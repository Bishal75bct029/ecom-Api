import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1735809636099 implements MigrationInterface {
  name = 'Migration1735809636099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "deletedBy" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_867a2e0da2bb6f8682639a89182" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_867a2e0da2bb6f8682639a89182"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "deletedBy"
        `);
  }
}
