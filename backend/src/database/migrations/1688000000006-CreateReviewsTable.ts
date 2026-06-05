import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateReviewsTable1688000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTable(queryRunner, new Table({
      name: 'reviews',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'buyer_id', type: 'varchar', length: '36' },
        { name: 'product_id', type: 'varchar', length: '36' },
        { name: 'rating', type: 'int' },
        { name: 'comment', type: 'text', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await this.ensureIndex(queryRunner, new TableIndex({
      name: 'idx_reviews_buyer_product',
      columnNames: ['buyer_id', 'product_id'],
      isUnique: true,
    }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_reviews_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_reviews_product_id',
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('reviews')) {
      await queryRunner.dropTable('reviews', true);
    }
  }

  private async ensureTable(queryRunner: QueryRunner, table: Table) {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table, true);
    }
  }

  private async ensureIndex(queryRunner: QueryRunner, index: TableIndex) {
    const table = await queryRunner.getTable('reviews');
    if (table && !table.indices.some((existing) => existing.name === index.name)) {
      await queryRunner.createIndex('reviews', index);
    }
  }

  private async ensureForeignKey(queryRunner: QueryRunner, foreignKey: TableForeignKey) {
    const table = await queryRunner.getTable('reviews');
    if (table && !table.foreignKeys.some((existing) => existing.name === foreignKey.name)) {
      await queryRunner.createForeignKey('reviews', foreignKey);
    }
  }
}
