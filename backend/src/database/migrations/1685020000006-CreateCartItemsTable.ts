import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreateCartItemsTable1685020000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
          },
          {
            name: 'product_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
        ],

        foreignKeys: [
          {
            columnNames: ['cart_id'],
            referencedTableName: 'carts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cart_items');
  }
}