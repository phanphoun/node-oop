import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCartsTables1688000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTable(queryRunner, new Table({
      name: 'carts',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'buyer_id', type: 'varchar', length: '36' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await this.ensureIndex(queryRunner, 'carts', new TableIndex({ name: 'idx_carts_buyer_id', columnNames: ['buyer_id'] }));
    await this.ensureForeignKey(queryRunner, 'carts', new TableForeignKey({
      name: 'fk_carts_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await this.ensureTable(queryRunner, new Table({
      name: 'cart_items',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'cart_id', type: 'varchar', length: '36' },
        { name: 'product_id', type: 'varchar', length: '36' },
        { name: 'quantity', type: 'int' },
      ],
    }));
    await this.ensureIndex(queryRunner, 'cart_items', new TableIndex({
      name: 'idx_cart_items_cart_product',
      columnNames: ['cart_id', 'product_id'],
      isUnique: true,
    }));
    await this.ensureForeignKey(queryRunner, 'cart_items', new TableForeignKey({
      name: 'fk_cart_items_cart_id',
      columnNames: ['cart_id'],
      referencedTableName: 'carts',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, 'cart_items', new TableForeignKey({
      name: 'fk_cart_items_product_id',
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTableIfExists(queryRunner, 'cart_items');
    await this.dropTableIfExists(queryRunner, 'carts');
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
