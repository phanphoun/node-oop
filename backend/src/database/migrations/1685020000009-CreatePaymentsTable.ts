import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreatePaymentsTable1685020000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',

        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'order_id',
            type: 'varchar',
            length: '36',
            isUnique: true,
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['pending', 'paid', 'failed'],
            default: "'pending'",
          },
          {
            name: 'transaction_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],

        foreignKeys: [
          {
            columnNames: ['order_id'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}