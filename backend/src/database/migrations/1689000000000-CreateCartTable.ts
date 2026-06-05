import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCartTable1689000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'buyer_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['buyer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        columnNames: ['buyer_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'cart_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['cart_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}
