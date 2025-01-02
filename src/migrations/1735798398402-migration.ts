import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1735798398402 implements MigrationInterface {
  name = 'Migration1735798398402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "UQ_4c9fb58de893725258746385e16" UNIQUE ("name")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT "UQ_4c9fb58de893725258746385e16"
        `);
  }
}
