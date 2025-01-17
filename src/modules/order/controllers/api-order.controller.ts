import { Controller, Post, Body, Req, BadRequestException, Query, Get, Param, Put } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

import { CreateOrderDto, OrderQueryDto } from '../dto/create-order.dto';
import { CapturePaymentDto } from '@/modules/transaction/dto/capture-payment.dto';
import { OrderItemService } from '../services/order-item.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { ProductMetaService } from '@/modules/product/services';
import { PaymentMethodService } from '@/modules/payment-method/services/payment-method.service';
import { TransactionService } from '@/modules/transaction/services/transaction.service';
import { CartService } from '@/modules/cart/services/cart.service';
import { OrderService } from '../services/order.service';
import { PaypalService } from '@/common/module/payment/paypal.service';
import { SchoolDiscountEntity } from '@/modules/school-discount/entities/schoolDiscount.entity';
import { ProductEntity, ProductMetaEntity } from '@/modules/product/entities';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { CartEntity } from '@/modules/cart/entities/cart.entity';
import { TransactionEntity } from '@/modules/transaction/entities/transaction.entity';
import { getRoundedOffValue } from '@/common/utils';
import { ValidateIDDto } from '@/common/dtos';
import { OrderItemStatusEnum } from '../entities/order-history.entity';
import { OrderStatusHistoryService } from '../services/order-history-service';

@ApiTags('API Order')
@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly orderHistoryService: OrderStatusHistoryService,
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly productMetaService: ProductMetaService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly transactionService: TransactionService,
    private readonly paypalService: PaypalService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const { paymentMethodId } = createOrderDto;
    const { schoolId, id: userId } = req.session.user;
    //initial validations
    const [paymentMethod, productMetas] = await Promise.all([
      this.paymentMethodService.findOne({
        where: { id: paymentMethodId, isActive: true },
      }),
      this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      }),
    ]);

    if (
      !paymentMethod ||
      productMetas.length === 0 ||
      productMetas.length !== createOrderDto.productMetaIds.length ||
      !userId
    )
      throw new BadRequestException('Sorry, failed to place order. Please try again later.');

    /** Transaction */
    return await this.dataSource.transaction(async (entityManager) => {
      //validate qunatities
      this.productMetaService.validateQuantity(productMetas, createOrderDto);

      //decrease quantity in product meta
      const decreaseProductMetaQuantities = productMetas.map((product) => {
        const productFromOrder = createOrderDto.productMetaIds.find((item) => item.id === product.id);
        return { ...product, stock: product.stock - productFromOrder.quantity };
      });
      await entityManager.save(ProductMetaEntity, decreaseProductMetaQuantities);

      //calculate total price with discount if any
      let totalPrice = this.orderItemService.calculateTotalPrice(productMetas, createOrderDto);
      let discount: SchoolDiscountEntity;
      if (schoolId) {
        discount = await this.schoolDiscountService.findOne({
          where: { schoolId },
        });
        if (discount) {
          totalPrice = Math.floor(
            getRoundedOffValue((totalPrice * (1 - (discount.discountPercentage || 0) / 100)) / 100),
          );
        }
      }

      //save order and order items
      const order = await entityManager.save(OrderEntity, {
        totalPrice,
        user: { id: userId },
      });
      const orderItems = productMetas.map((productMeta) => {
        const quantity = createOrderDto.productMetaIds.find(({ id }) => id === productMeta.id).quantity;
        const pricePerUnit = Math.floor(
          getRoundedOffValue((Number(productMeta.price) * ((1 - (discount?.discountPercentage ?? 0)) / 100)) / 100) *
            100,
        );

        return {
          productMeta,
          pricePerUnit,
          quantity,
          totalPrice: quantity * pricePerUnit,
          order,
        };
      });
      const createdOrderItems = this.orderItemService.createMany(orderItems);
      await entityManager.save(OrderItemEntity, createdOrderItems);

      const createOrderStatusHistory = createdOrderItems.map((item) => ({
        status: item.status,
        orderItems: { id: item.id },
      }));

      this.orderHistoryService.insert(createOrderStatusHistory);

      //create paypal payment intent
      const [paypalPaymentPayload, userCart] = await Promise.all([
        this.paypalService.createPayment([
          {
            amount: {
              currency_code: 'SGD',
              value: (totalPrice / 100).toFixed(2),
            },
          },
        ]),
        this.cartService.findOne({ where: { user: { id: userId } } }),
      ]);

      // cart query
      let promisifiedCart: Promise<CartEntity>;
      const productMetaIds = userCart.cartItems.map((item) => item.productMetaId);
      if (userCart && productMetaIds.some((metaId) => productMetas.map(({ id }) => id).includes(metaId))) {
        const updatedCartItems = userCart.cartItems.filter(
          (item) => !productMetas.map(({ id }) => id).includes(item.productMetaId),
        );
        promisifiedCart = entityManager.save(CartEntity, {
          ...userCart,
          cartItems: updatedCartItems,
        });
      }

      // save transaction and cart update
      await Promise.all([
        entityManager.save(TransactionEntity, {
          transactionId: paypalPaymentPayload?.result.id,
          paymentMethod,
          price: totalPrice,
          order,
          transactionCode: this.transactionService.genTransactionCode(),
          user: { id: userId },
        }),
        promisifiedCart,
      ]);

      const approvalUrl = paypalPaymentPayload?.result.links.find((item: any) => item.rel === 'approve').href;
      return { approvalUrl };
    });
  }

  @Get('confirm')
  async confirmOrder(@Query() query: CapturePaymentDto) {
    const { token } = query;

    const transaction = await this.transactionService.findOne({
      where: { transactionId: token, isSuccess: false },
      relations: [
        'order',
        'order.orderItems',
        'order.orderItems.orderHistory',
        'order.orderItems.productMeta',
        'order.orderItems.productMeta.product',
      ],
      select: {
        order: {
          id: true,
          totalPrice: true,
          orderItems: {
            id: true,
            pricePerUnit: true,
            orderHistory: {
              status: true,
            },
            quantity: true,
            totalPrice: true,
            productMeta: {
              id: true,
              images: true,
              attributes: {},
              product: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!transaction) throw new BadRequestException('Sorry, failed to place order. Please try again later.');

    const paypalResponse = await this.paypalService.captureOrder(token);
    const paypalFee =
      paypalResponse.result.purchase_units[0].payments.captures[0].seller_receivable_breakdown?.paypal_fee.value || 0;

    await this.transactionService.save({
      ...transaction,
      isSuccess: true,
      responseJson: paypalResponse,
      paymentGatewayCharge: getRoundedOffValue(paypalFee * 100),
    });

    return transaction.order;
  }

  @Get()
  async getOrders(@Req() { session: { user } }: Request, @Query() orderQueryDto: OrderQueryDto) {
    const { page = 1, limit = 10 } = orderQueryDto;

    const queryBuilder = this.orderService.createQueryBuilder('order');
    queryBuilder
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.productMeta', 'productMeta')
      .leftJoinAndSelect('productMeta.product', 'product')
      .leftJoinAndSelect('order.transaction', 'transaction')
      .select([
        'order.id',
        'order.totalPrice',
        'order.createdAt',
        'order.updatedAt',
        'orderItem.id',
        'orderItem.quantity',
        'orderItem.status',
        'orderItem.pricePerUnit',
        'orderItem.totalPrice',
        'productMeta.id',
        'productMeta.images',
        'productMeta.price',
        'productMeta.attributes',
        'product.id',
        'product.name',
        'transaction.isSuccess',
        'transaction.transactionId',
      ])
      .where('order.userId = :userId', { userId: user.id })
      .andWhere('transaction.isSuccess = :isSuccess', { isSuccess: true });

    // if (status === 'pending') {
    //   queryBuilder.andWhere((qb) => {
    //     const subQuery = qb
    //       .subQuery()
    //       .select('1')
    //       .from('order_items', 'oi')
    //       .where('oi.orderId = order.id AND oi.status NOT IN(:...notPendingStatuses)', {
    //         notPendingStatuses: [OrderItemStatusEnum.DELIVERED, OrderItemStatusEnum.CANCELLED],
    //       })
    //       .getQuery();

    //     return `EXISTS ${subQuery}`;
    //   });
    // }

    const [orders, count] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      count,
      order: orders?.map((order) => {
        return {
          ...order,
          totalPrice: Number(order.totalPrice) / 100,
          orderItems: order.orderItems.map((orderItem) => {
            return {
              ...orderItem,
              pricePerUnit: Number(orderItem.pricePerUnit) / 100,
              totalPrice: Number(orderItem.totalPrice) / 100,
              productMeta: {
                ...orderItem.productMeta,
                price: (Number(orderItem.productMeta.price) / 100) * orderItem.quantity,
              },
            };
          }),
        };
      }),
    };
  }

  @Get(':id')
  getOrderById(@Req() { session: { user } }: Request, @Param() { id }: ValidateIDDto) {
    return this.orderService.findOne({
      where: {
        user: { id: user.id },
        id,
        transaction: { isSuccess: true },
      },
      relations: ['orderItems', 'orderItems.productMeta', 'orderItems.orderHistory', 'orderItems.productMeta.product'],
      select: {
        id: true,
        totalPrice: true,
        orderItems: {
          id: true,
          orderHistory: {
            status: true,
          },
          pricePerUnit: true,
          quantity: true,
          totalPrice: true,
          productMeta: {
            id: true,
            images: true,
            attributes: {},
            product: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
        transaction: { isSuccess: true },
        updatedAt: true,
      },
    });
  }

  @Put('cancel-order/:id')
  async cancelOrder(@Req() { session: { user } }: Request, @Param() { id }: ValidateIDDto) {
    const order = await this.orderService.findOne({
      where: { id, user: { id: user.id } },
      relations: ['orderItems', 'orderItems.productMeta'],
    });
    if (!order) throw new BadRequestException('Order not found.');

    if (order.status !== OrderStatusEnum.PENDING) throw new BadRequestException('Cannot cancel order.');

    await this.dataSource.transaction(async (entityManager) => {
      const productMetas = await this.productMetaService.find({
        where: { id: In(order.orderItems.map((item) => item.productMeta.id)) },
        relations: ['product'],
        select: {
          id: true,
          stock: true,
          product: {
            id: true,
            stock: true,
          },
        },
      });

      const stockUpdatedProduct = new Map<string, ProductEntity>();
      productMetas.forEach((productMeta) => {
        const increasedStock = order.orderItems.find((item) => item.productMeta.id === productMeta.id).quantity;
        productMeta.stock += Number(increasedStock ?? 0);

        const product = stockUpdatedProduct.get(productMeta.product.id) || { ...productMeta.product };
        product.stock += Number(increasedStock ?? 0);
        stockUpdatedProduct.set(productMeta.product.id, product);
      });

      const orderItemsId: string[] = [];
      const cancelledOrderItems = order.orderItems.map((item) => {
        orderItemsId.push(item.id);
        return {
          ...item,
          status: OrderItemStatusEnum.CANCELLED,
        };
      });

      await Promise.all([
        entityManager.save(ProductMetaEntity, productMetas),
        entityManager.save(ProductEntity, [...stockUpdatedProduct.values()]),
        entityManager.save(OrderItemEntity, cancelledOrderItems),
        this.orderHistoryService.update(
          { orderItems: { id: In(orderItemsId) } },
          { status: OrderItemStatusEnum.CANCELLED },
        ),
      ]);
    });

    return { message: 'Order cancelled successfully' };
  }
}
