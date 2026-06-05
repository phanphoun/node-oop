import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePaymentsTable1688000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('payments'))) {
      await queryRunner.createTable(new Table({
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
        indices: [
          { name: 'idx_payments_order_id', columnNames: ['order_id'] },
          { name: 'idx_payments_buyer_id', columnNames: ['buyer_id'] },
        ],
        foreignKeys: [
          {
            name: 'fk_payments_order_id',
            columnNames: ['order_id'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'fk_payments_buyer_id',
            columnNames: ['buyer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }), true);

      return;
    }

    await this.makeColumnNullableIfExists(queryRunner, 'user_id', 'varchar', '36');
    await this.makeColumnNullableIfExists(queryRunner, 'method', 'varchar', '50');
    await this.ensureColumn(queryRunner, new TableColumn({ name: 'order_id', type: 'varchar', length: '36', isNullable: true }));
    await this.ensureColumn(queryRunner, new TableColumn({ name: 'buyer_id', type: 'varchar', length: '36', isNullable: true }));
    await this.ensureColumn(queryRunner, new TableColumn({ name: 'payment_method', type: 'varchar', length: '50', default: "'PayPal'" }));
    await this.ensureColumn(queryRunner, new TableColumn({ name: 'payment_status', type: 'varchar', length: '50', default: "'pending'" }));
    await this.ensureColumn(queryRunner, new TableColumn({ name: 'transaction_id', type: 'varchar', length: '255', isNullable: true }));

    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_payments_order_id', columnNames: ['order_id'] }));
    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_payments_buyer_id', columnNames: ['buyer_id'] }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_payments_order_id',
      columnNames: ['order_id'],
      referencedTableName: 'orders',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_payments_buyer_id',
      columnNames: ['buyer_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('payments')) {
      await queryRunner.dropTable('payments', true);
    }
  }

  private async ensureColumn(queryRunner: QueryRunner, column: TableColumn) {
    if (!(await queryRunner.hasColumn('payments', column.name))) {
      await queryRunner.addColumn('payments', column);
    }
  }

  private async ensureIndex(queryRunner: QueryRunner, index: TableIndex) {
    const table = await queryRunner.getTable('payments');
    if (table && !table.indices.some((existing) => existing.name === index.name)) {
      await queryRunner.createIndex('payments', index);
    }
  }

  private async ensureForeignKey(queryRunner: QueryRunner, foreignKey: TableForeignKey) {
    const table = await queryRunner.getTable('payments');
    if (table && !table.foreignKeys.some((existing) => existing.name === foreignKey.name)) {
      await queryRunner.createForeignKey('payments', foreignKey);
    }
  }

  private async makeColumnNullableIfExists(
    queryRunner: QueryRunner,
    columnName: string,
    type: string,
    length?: string,
  ) {
    const table = await queryRunner.getTable('payments');
    const column = table?.findColumnByName(columnName);
    if (!column || column.isNullable) {
      return;
    }

    for (const foreignKey of table!.foreignKeys.filter((key) => key.columnNames.includes(columnName))) {
      await queryRunner.dropForeignKey('payments', foreignKey);
    }

    await queryRunner.changeColumn('payments', columnName, new TableColumn({
      name: columnName,
      type,
      length,
      isNullable: true,
    }));
  }
}
