import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreateFavoritesTable1685020000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'favorites',

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
          },
          {
            name: 'product_id',
            type: 'varchar',
            length: '36',
          },
        ],

        foreignKeys: [
          {
            columnNames: ['buyer_id'],
            referencedTableName: 'users',
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
    await queryRunner.dropTable('favorites');
  }
}