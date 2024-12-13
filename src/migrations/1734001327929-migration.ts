import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1734001327929 implements MigrationInterface {
  name = 'Migration1734001327929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "path" character varying NOT NULL,
                "method" character varying NOT NULL,
                "feature" character varying NOT NULL,
                "allowedRoles" text NOT NULL DEFAULT '["USER"]',
                "isSystemUpdate" boolean NOT NULL DEFAULT true,
                "updatedAt" TIMESTAMP DEFAULT now(),
                "updatedById" uuid,
                CONSTRAINT "UQ_fa2bba6bfe1ec82560682feef41" UNIQUE ("path", "method"),
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD CONSTRAINT "FK_3ec888a96330ca53ded73988c92" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP CONSTRAINT "FK_3ec888a96330ca53ded73988c92"
        `);
    await queryRunner.query(`
            DROP TABLE "permissions"
        `);
  }
}
