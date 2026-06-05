import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateOrdersTables1688000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTable(queryRunner, new Table({
      name: 'orders',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'buyer_id', type: 'varchar', length: '36' },
        { name: 'total_amount', type: 'decimal', precision: 10, scale: 2 },
        { name: 'payment_status', type: 'varchar', length: '50', default: "'pending'" },
        { name: 'order_status', type: 'varchar', length: '50', default: "'pending'" },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await this.ensureIndex(queryRunner, 'orders', new TableIndex({ name: 'idx_orders_buyer_id', columnNames: ['buyer_id'] }));
    await this.ensureForeignKey(queryRunner, 'orders', new TableForeignKey({
      name: 'fk_orders_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await this.ensureTable(queryRunner, new Table({
      name: 'order_items',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'order_id', type: 'varchar', length: '36' },
        { name: 'product_id', type: 'varchar', length: '36' },
        { name: 'quantity', type: 'int' },
        { name: 'price', type: 'decimal', precision: 10, scale: 2 },
      ],
    }));
    await this.ensureIndex(queryRunner, 'order_items', new TableIndex({ name: 'idx_order_items_order_id', columnNames: ['order_id'] }));
    await this.ensureIndex(queryRunner, 'order_items', new TableIndex({ name: 'idx_order_items_product_id', columnNames: ['product_id'] }));
    await this.ensureForeignKey(queryRunner, 'order_items', new TableForeignKey({
      name: 'fk_order_items_order_id',
      columnNames: ['order_id'],
      referencedTableName: 'orders',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, 'order_items', new TableForeignKey({
      name: 'fk_order_items_product_id',
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTableIfExists(queryRunner, 'order_items');
    await this.dropTableIfExists(queryRunner, 'orders');
  }

  private async ensureTable(queryRunner: QueryRunner, table: Table) {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table, true);
    }
  }

  private async ensureIndex(queryRunner: QueryRunner, tableName: string, index: TableIndex) {
    const table = await queryRunner.getTable(tableName);
    if (table && !table.indices.some((existing) => existing.name === index.name)) {
      await queryRunner.createIndex(tableName, index);
    }
  }

  private async ensureForeignKey(queryRunner: QueryRunner, tableName: string, foreignKey: TableForeignKey) {
    const table = await queryRunner.getTable(tableName);
    if (table && !table.foreignKeys.some((existing) => existing.name === foreignKey.name)) {
      await queryRunner.createForeignKey(tableName, foreignKey);
    }
  }

  private async dropTableIfExists(queryRunner: QueryRunner, tableName: string) {
    if (await queryRunner.hasTable(tableName)) {
      await queryRunner.dropTable(tableName, true);
    }
  }
}
