import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1735613973991 implements MigrationInterface {
  name = 'Migration1735613973991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "description" text
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD "image" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "image"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP COLUMN "description"
        `);
  }
}
