import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1735294361328 implements MigrationInterface {
  name = 'Migration1735294361328';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "isActive" boolean NOT NULL DEFAULT true
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "phone" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "lastLogInDate" TIMESTAMP WITH TIME ZONE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "lastLogInDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "phone"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "isActive"
        `);
  }
}
