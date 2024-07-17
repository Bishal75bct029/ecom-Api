import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721197709983 implements MigrationInterface {
  name = 'Migration1721197709983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "product_meta" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "sku" character varying(255) NOT NULL,
                "image" text,
                "price" bigint NOT NULL,
                "variants" jsonb DEFAULT '{}',
                "isDefault" boolean NOT NULL DEFAULT false,
                "stock" integer NOT NULL,
                "productId" uuid,
                CONSTRAINT "PK_14edc0f4842cf90dc07bc7fdd98" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "name" character varying NOT NULL,
                "image" text NOT NULL,
                "mpath" character varying DEFAULT '',
                "parentId" uuid,
                CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "tags" text NOT NULL,
                "attributes" text,
                "attributesOptions" jsonb,
                "variants" jsonb,
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "comment" text,
                "image" text,
                "rating" bigint NOT NULL,
                "productId" uuid,
                "userId" uuid,
                CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."addresses_type_enum" AS ENUM('SHIPPING', 'BILLING')
        `);
    await queryRunner.query(`
            CREATE TABLE "addresses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "name" character varying NOT NULL,
                "contact" character varying NOT NULL,
                "type" "public"."addresses_type_enum" NOT NULL DEFAULT 'SHIPPING',
                "userId" uuid,
                CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "quantity" bigint NOT NULL,
                "pricePerUnit" bigint NOT NULL,
                "totalPrice" bigint NOT NULL,
                "productMetaId" uuid,
                "orderId" uuid,
                CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "discount" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "couponCode" character varying NOT NULL,
                "amount" character varying NOT NULL DEFAULT '0',
                "isPercentage" boolean NOT NULL DEFAULT false,
                "minBuyingPrice" bigint NOT NULL DEFAULT '0',
                "maxDiscountPrice" bigint NOT NULL,
                "expiryTime" TIMESTAMP NOT NULL,
                CONSTRAINT "UQ_0b4aa015cd8339d5b5682cdb582" UNIQUE ("couponCode"),
                CONSTRAINT "PK_d05d8712e429673e459e7f1cddb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."orders_status_enum" AS ENUM(
                'PLACED',
                'PACKED',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "totalPrice" bigint,
                "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PLACED',
                "userId" uuid,
                "discountId" uuid,
                CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "email" character varying NOT NULL,
                "name" character varying NOT NULL,
                "image" text,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER',
                "password" character varying,
                "isOtpEnabled" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "school_discounts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "name" character varying NOT NULL,
                "discountPercentage" integer NOT NULL,
                "schoolMeta" jsonb NOT NULL DEFAULT '{}',
                "schoolId" uuid NOT NULL,
                CONSTRAINT "UQ_e827d03be6863fe5bafa0a1db9d" UNIQUE ("schoolId"),
                CONSTRAINT "PK_f24e0afb3267c4e2425d2d52e32" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "deletedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now(),
                "productMetaId" text NOT NULL,
                "userId" uuid,
                CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"),
                CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "product_categories" (
                "productsId" uuid NOT NULL,
                "categoriesId" uuid NOT NULL,
                CONSTRAINT "PK_bc0bce5de12ebedb70ddcb3bb34" PRIMARY KEY ("productsId", "categoriesId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3d78977f2f60b4f7a1d833e418" ON "product_categories" ("productsId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c642709e6ad4582ed11aca458f" ON "product_categories" ("categoriesId")
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD CONSTRAINT "FK_7e9accd22cc78a627c46b3daa24" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD CONSTRAINT "FK_36bc2b4c21fd026a9a7c0cf53ce" FOREIGN KEY ("productMetaId") REFERENCES "product_meta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_b7e1358a054f59f61e40b70ba8f" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "product_categories"
            ADD CONSTRAINT "FK_3d78977f2f60b4f7a1d833e4181" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "product_categories"
            ADD CONSTRAINT "FK_c642709e6ad4582ed11aca458f9" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product_categories" DROP CONSTRAINT "FK_c642709e6ad4582ed11aca458f9"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_categories" DROP CONSTRAINT "FK_3d78977f2f60b4f7a1d833e4181"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP CONSTRAINT "FK_b7e1358a054f59f61e40b70ba8f"
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_items" DROP CONSTRAINT "FK_36bc2b4c21fd026a9a7c0cf53ce"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"
        `);
    await queryRunner.query(`
            ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP CONSTRAINT "FK_7e9accd22cc78a627c46b3daa24"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c642709e6ad4582ed11aca458f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3d78977f2f60b4f7a1d833e418"
        `);
    await queryRunner.query(`
            DROP TABLE "product_categories"
        `);
    await queryRunner.query(`
            DROP TABLE "carts"
        `);
    await queryRunner.query(`
            DROP TABLE "school_discounts"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "orders"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."orders_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "discount"
        `);
    await queryRunner.query(`
            DROP TABLE "order_items"
        `);
    await queryRunner.query(`
            DROP TABLE "addresses"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."addresses_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "reviews"
        `);
    await queryRunner.query(`
            DROP TABLE "products"
        `);
    await queryRunner.query(`
            DROP TABLE "categories"
        `);
    await queryRunner.query(`
            DROP TABLE "product_meta"
        `);
  }
}
