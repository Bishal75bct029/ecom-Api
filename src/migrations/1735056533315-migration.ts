import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1735056533315 implements MigrationInterface {
  name = 'Migration1735056533315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP CONSTRAINT "FK_7e9accd22cc78a627c46b3daa24"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "variant"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "image"
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "attributeOptions"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "images" text
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "attributes" jsonb DEFAULT '{}'
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."products_status_enum" AS ENUM('PUBLISHED', 'DRAFT', 'SCHEDULED')
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "status" "public"."products_status_enum" NOT NULL DEFAULT 'DRAFT'
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "scheduledDate" TIMESTAMP WITH TIME ZONE
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "stock" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "images" text
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "updatedById" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "description"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "description" text NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ALTER COLUMN "tags"
            SET DEFAULT '[]'
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "attributes"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "attributes" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD CONSTRAINT "FK_7e9accd22cc78a627c46b3daa24" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_3aa627ab6766f571d413ca8cbde" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT "FK_3aa627ab6766f571d413ca8cbde"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP CONSTRAINT "FK_7e9accd22cc78a627c46b3daa24"
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "attributes"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "attributes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ALTER COLUMN "tags" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "description"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "description" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "updatedById"
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "images"
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "stock"
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "scheduledDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."products_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "attributes"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta" DROP COLUMN "images"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "attributeOptions" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "image" text
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD "variant" jsonb DEFAULT '{}'
        `);
    await queryRunner.query(`
            ALTER TABLE "product_meta"
            ADD CONSTRAINT "FK_7e9accd22cc78a627c46b3daa24" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
