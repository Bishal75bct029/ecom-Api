import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1734075312484 implements MigrationInterface {
  name = 'Migration1734075312484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN temp_unique_name character varying`);

    await queryRunner.query(`
        WITH ranked_names AS (
            SELECT 
                id,  
                name, 
                ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rank
            FROM "categories"
        )
        UPDATE "categories"
        SET temp_unique_name = CONCAT("categories".name, '_', rank)
        FROM ranked_names
        WHERE "categories".id = ranked_names.id AND ranked_names.rank > 1;
    `);

    await queryRunner.query(
      `UPDATE "categories"
         SET name = temp_unique_name
         WHERE temp_unique_name IS NOT NULL;`,
    );

    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN temp_unique_name`);

    await queryRunner.query(`
            ALTER TABLE "categories"
            ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"
        `);
  }
}
