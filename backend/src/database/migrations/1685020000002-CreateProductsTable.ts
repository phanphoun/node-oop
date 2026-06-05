import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateProductsTable1685020000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('products'))) {
      await queryRunner.createTable(new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2, default: '0.00' },
          { name: 'sku', type: 'varchar', length: '100', isUnique: true, isNullable: true },
          { name: 'stock', type: 'int', default: 0 },
          { name: 'category_id', type: 'varchar', length: '36', isNullable: true },
          { name: 'image', type: 'varchar', length: '500', isNullable: true },
          { name: 'seller_id', type: 'varchar', length: '36', isNullable: true },
          { name: 'status', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { name: 'idx_products_name', columnNames: ['name'] },
          { name: 'idx_products_price', columnNames: ['price'] },
          { name: 'idx_products_category_id', columnNames: ['category_id'] },
          { name: 'idx_products_seller_id', columnNames: ['seller_id'] },
        ],
        foreignKeys: [
          {
            name: 'fk_products_category_id',
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            name: 'fk_products_seller_id',
            columnNames: ['seller_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }), true);

      return;
    }

    await this.ensureColumn(queryRunner, new TableColumn({
      name: 'category_id',
      type: 'varchar',
      length: '36',
      isNullable: true,
    }));
    await this.ensureColumn(queryRunner, new TableColumn({
      name: 'image',
      type: 'varchar',
      length: '500',
      isNullable: true,
    }));
    await this.ensureColumn(queryRunner, new TableColumn({
      name: 'seller_id',
      type: 'varchar',
      length: '36',
      isNullable: true,
    }));

    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_products_name', columnNames: ['name'] }));
    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_products_price', columnNames: ['price'] }));
    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_products_category_id', columnNames: ['category_id'] }));
    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_products_seller_id', columnNames: ['seller_id'] }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_products_category_id',
      columnNames: ['category_id'],
      referencedTableName: 'categories',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_products_seller_id',
      columnNames: ['seller_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('products')) {
      await queryRunner.dropTable('products', true);
    }
  }

  private async ensureColumn(queryRunner: QueryRunner, column: TableColumn) {
    if (!(await queryRunner.hasColumn('products', column.name))) {
      await queryRunner.addColumn('products', column);
    }
  }

  private async ensureIndex(queryRunner: QueryRunner, index: TableIndex) {
    const table = await queryRunner.getTable('products');
    if (table && !table.indices.some((existing) => existing.name === index.name)) {
      await queryRunner.createIndex('products', index);
    }
  }

  private async ensureForeignKey(queryRunner: QueryRunner, foreignKey: TableForeignKey) {
    const table = await queryRunner.getTable('products');
    if (table && !table.foreignKeys.some((existing) => existing.name === foreignKey.name)) {
      await queryRunner.createForeignKey('products', foreignKey);
    }
  }
}
