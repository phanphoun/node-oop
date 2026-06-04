import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CompleteBuyNowSchema1688000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureColumn(queryRunner, 'users', new TableColumn({
      name: 'updated_at',
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    }));

    await this.ensureTable(queryRunner, new Table({
      name: 'categories',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'name', type: 'varchar', length: '255', isUnique: true },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }));

    await this.ensureColumn(queryRunner, 'products', new TableColumn({
      name: 'category_id',
      type: 'varchar',
      length: '36',
      isNullable: true,
    }));
    await this.ensureColumn(queryRunner, 'products', new TableColumn({
      name: 'image',
      type: 'varchar',
      length: '500',
      isNullable: true,
    }));
    await this.ensureColumn(queryRunner, 'products', new TableColumn({
      name: 'seller_id',
      type: 'varchar',
      length: '36',
      isNullable: true,
    }));

    await this.ensureIndex(queryRunner, 'products', new TableIndex({ name: 'idx_products_name', columnNames: ['name'] }));
    await this.ensureIndex(queryRunner, 'products', new TableIndex({ name: 'idx_products_price', columnNames: ['price'] }));
    await this.ensureIndex(queryRunner, 'products', new TableIndex({ name: 'idx_products_category_id', columnNames: ['category_id'] }));
    await this.ensureIndex(queryRunner, 'products', new TableIndex({ name: 'idx_products_seller_id', columnNames: ['seller_id'] }));
    await this.ensureForeignKey(queryRunner, 'products', new TableForeignKey({
      name: 'fk_products_category_id',
      columnNames: ['category_id'],
      referencedTableName: 'categories',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));
    await this.ensureForeignKey(queryRunner, 'products', new TableForeignKey({
      name: 'fk_products_seller_id',
      columnNames: ['seller_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

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

    await this.ensureTable(queryRunner, new Table({
      name: 'favorites',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'buyer_id', type: 'varchar', length: '36' },
        { name: 'product_id', type: 'varchar', length: '36' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await this.ensureIndex(queryRunner, 'favorites', new TableIndex({
      name: 'idx_favorites_buyer_product',
      columnNames: ['buyer_id', 'product_id'],
      isUnique: true,
    }));
    await this.ensureForeignKey(queryRunner, 'favorites', new TableForeignKey({
      name: 'fk_favorites_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, 'favorites', new TableForeignKey({
      name: 'fk_favorites_product_id',
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

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
    await this.ensureIndex(queryRunner, 'reviews', new TableIndex({
      name: 'idx_reviews_buyer_product',
      columnNames: ['buyer_id', 'product_id'],
      isUnique: true,
    }));
    await this.ensureForeignKey(queryRunner, 'reviews', new TableForeignKey({
      name: 'fk_reviews_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, 'reviews', new TableForeignKey({
      name: 'fk_reviews_product_id',
      columnNames: ['product_id'],
      referencedTableName: 'products',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await this.migratePaymentsTable(queryRunner);

    await this.ensureTable(queryRunner, new Table({
      name: 'notifications',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'user_id', type: 'varchar', length: '36', isNullable: true },
        { name: 'type', type: 'varchar', length: '100' },
        { name: 'title', type: 'varchar', length: '255' },
        { name: 'message', type: 'text' },
        { name: 'is_read', type: 'boolean', default: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }));
    await this.ensureIndex(queryRunner, 'notifications', new TableIndex({ name: 'idx_notifications_user_id', columnNames: ['user_id'] }));
    await this.ensureForeignKey(queryRunner, 'notifications', new TableForeignKey({
      name: 'fk_notifications_user_id',
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTableIfExists(queryRunner, 'notifications');
    await this.dropTableIfExists(queryRunner, 'reviews');
    await this.dropTableIfExists(queryRunner, 'favorites');
    await this.dropTableIfExists(queryRunner, 'order_items');
    await this.dropTableIfExists(queryRunner, 'orders');
    await this.dropTableIfExists(queryRunner, 'cart_items');
    await this.dropTableIfExists(queryRunner, 'carts');

    await this.dropForeignKeyIfExists(queryRunner, 'payments', 'fk_payments_order_id');
    await this.dropForeignKeyIfExists(queryRunner, 'payments', 'fk_payments_buyer_id');
    await this.dropColumnIfExists(queryRunner, 'payments', 'order_id');
    await this.dropColumnIfExists(queryRunner, 'payments', 'buyer_id');
    await this.dropColumnIfExists(queryRunner, 'payments', 'payment_method');
    await this.dropColumnIfExists(queryRunner, 'payments', 'payment_status');
    await this.dropColumnIfExists(queryRunner, 'payments', 'transaction_id');

    await this.dropForeignKeyIfExists(queryRunner, 'products', 'fk_products_category_id');
    await this.dropForeignKeyIfExists(queryRunner, 'products', 'fk_products_seller_id');
    await this.dropColumnIfExists(queryRunner, 'products', 'category_id');
    await this.dropColumnIfExists(queryRunner, 'products', 'image');
    await this.dropColumnIfExists(queryRunner, 'products', 'seller_id');
    await this.dropTableIfExists(queryRunner, 'categories');
    await this.dropColumnIfExists(queryRunner, 'users', 'updated_at');
  }

  private async migratePaymentsTable(queryRunner: QueryRunner) {
    if (!(await queryRunner.hasTable('payments'))) {
      await this.ensureTable(queryRunner, new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'order_id', type: 'varchar', length: '36' },
          { name: 'buyer_id', type: 'varchar', length: '36' },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'payment_method', type: 'varchar', length: '50', default: "'PayPal'" },
          { name: 'payment_status', type: 'varchar', length: '50', default: "'pending'" },
          { name: 'transaction_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }));
    } else {
      await this.makeColumnNullableIfExists(queryRunner, 'payments', 'user_id', 'varchar', '36');
      await this.makeColumnNullableIfExists(queryRunner, 'payments', 'method', 'varchar', '50');
      await this.ensureColumn(queryRunner, 'payments', new TableColumn({ name: 'order_id', type: 'varchar', length: '36', isNullable: true }));
      await this.ensureColumn(queryRunner, 'payments', new TableColumn({ name: 'buyer_id', type: 'varchar', length: '36', isNullable: true }));
      await this.ensureColumn(queryRunner, 'payments', new TableColumn({ name: 'payment_method', type: 'varchar', length: '50', default: "'PayPal'" }));
      await this.ensureColumn(queryRunner, 'payments', new TableColumn({ name: 'payment_status', type: 'varchar', length: '50', default: "'pending'" }));
      await this.ensureColumn(queryRunner, 'payments', new TableColumn({ name: 'transaction_id', type: 'varchar', length: '255', isNullable: true }));
    }

    await this.ensureIndex(queryRunner, 'payments', new TableIndex({ name: 'idx_payments_order_id', columnNames: ['order_id'] }));
    await this.ensureIndex(queryRunner, 'payments', new TableIndex({ name: 'idx_payments_buyer_id', columnNames: ['buyer_id'] }));
    await this.ensureForeignKey(queryRunner, 'payments', new TableForeignKey({
      name: 'fk_payments_order_id',
      columnNames: ['order_id'],
      referencedTableName: 'orders',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, 'payments', new TableForeignKey({
      name: 'fk_payments_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  private async ensureTable(queryRunner: QueryRunner, table: Table) {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table, true);
    }
  }

  private async ensureColumn(queryRunner: QueryRunner, tableName: string, column: TableColumn) {
    if (!(await queryRunner.hasColumn(tableName, column.name))) {
      await queryRunner.addColumn(tableName, column);
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

  private async dropColumnIfExists(queryRunner: QueryRunner, tableName: string, columnName: string) {
    if (await queryRunner.hasTable(tableName) && await queryRunner.hasColumn(tableName, columnName)) {
      await queryRunner.dropColumn(tableName, columnName);
    }
  }

  private async dropForeignKeyIfExists(queryRunner: QueryRunner, tableName: string, foreignKeyName: string) {
    const table = await queryRunner.getTable(tableName);
    const foreignKey = table?.foreignKeys.find((existing) => existing.name === foreignKeyName);
    if (foreignKey) {
      await queryRunner.dropForeignKey(tableName, foreignKey);
    }
  }

  private async makeColumnNullableIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    type: string,
    length?: string,
  ) {
    const table = await queryRunner.getTable(tableName);
    const column = table?.findColumnByName(columnName);
    if (!column || column.isNullable) {
      return;
    }

    for (const foreignKey of table!.foreignKeys.filter((key) => key.columnNames.includes(columnName))) {
      await queryRunner.dropForeignKey(tableName, foreignKey);
    }

    await queryRunner.changeColumn(tableName, columnName, new TableColumn({
      name: columnName,
      type,
      length,
      isNullable: true,
    }));
  }
}
