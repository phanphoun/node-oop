import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateFavoritesTable1688000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTable(queryRunner, new Table({
      name: 'favorites',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'buyer_id', type: 'varchar', length: '36' },
        { name: 'product_id', type: 'varchar', length: '36' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await this.ensureIndex(queryRunner, new TableIndex({
      name: 'idx_favorites_buyer_product',
      columnNames: ['buyer_id', 'product_id'],
      isUnique: true,
    }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_favorites_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_favorites_product_id',
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('favorites')) {
      await queryRunner.dropTable('favorites', true);
    }
  }

  private async ensureTable(queryRunner: QueryRunner, table: Table) {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table, true);
    }
  }

  private async ensureIndex(queryRunner: QueryRunner, index: TableIndex) {
    const table = await queryRunner.getTable('favorites');
    if (table && !table.indices.some((existing) => existing.name === index.name)) {
      await queryRunner.createIndex('favorites', index);
    }
  }

  private async ensureForeignKey(queryRunner: QueryRunner, foreignKey: TableForeignKey) {
    const table = await queryRunner.getTable('favorites');
    if (table && !table.foreignKeys.some((existing) => existing.name === foreignKey.name)) {
      await queryRunner.createForeignKey('favorites', foreignKey);
    }
  }
}
