import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCategoriesTable1685020000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('categories')) {
      return;
    }

    await queryRunner.createTable(new Table({
      name: 'categories',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'name', type: 'varchar', length: '255', isUnique: true },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('categories')) {
      await queryRunner.dropTable('categories', true);
    }
  }
}
