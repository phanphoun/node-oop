import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreateProductsTable1685020000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',

        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'stock',
            type: 'int',
            default: 0,
          },
          {
            name: 'image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'category_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'seller_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
        ],

        foreignKeys: [
          {
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['seller_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}