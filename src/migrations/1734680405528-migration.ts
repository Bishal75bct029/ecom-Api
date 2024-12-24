import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1734680405528 implements MigrationInterface {
  name = 'Migration1734680405528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "discount" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "discount"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "discount" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "discount"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "discount" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "discount"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_discounts"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "discount" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "discount"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "discount" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "discount"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "discount" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "discount"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "updatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "updatedAt" TIMESTAMP DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "deletedAt" TIMESTAMP
        `);
  }
}
