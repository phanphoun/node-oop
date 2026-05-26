import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreateOrdersTable1685020000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',

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
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['pending', 'paid', 'failed'],
            default: "'pending'",
          },
          {
            name: 'order_status',
            type: 'enum',
            enum: [
              'pending',
              'processing',
              'shipped',
              'delivered',
              'cancelled',
            ],
            default: "'pending'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],

        foreignKeys: [
          {
            columnNames: ['buyer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
