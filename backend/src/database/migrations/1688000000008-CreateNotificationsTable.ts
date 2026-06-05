import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateNotificationsTable1688000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await this.ensureIndex(queryRunner, new TableIndex({ name: 'idx_notifications_user_id', columnNames: ['user_id'] }));
    await this.ensureForeignKey(queryRunner, new TableForeignKey({
      name: 'fk_notifications_user_id',
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('notifications')) {
      await queryRunner.dropTable('notifications', true);
    }
  }

  private async ensureTable(queryRunner: QueryRunner, table: Table) {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table, true);
    }
  }

  private async ensureIndex(queryRunner: QueryRunner, index: TableIndex) {
    const table = await queryRunner.getTable('notifications');
    if (table && !table.indices.some((existing) => existing.name === index.name)) {
      await queryRunner.createIndex('notifications', index);
    }
  }

  private async ensureForeignKey(queryRunner: QueryRunner, foreignKey: TableForeignKey) {
    const table = await queryRunner.getTable('notifications');
    if (table && !table.foreignKeys.some((existing) => existing.name === foreignKey.name)) {
      await queryRunner.createForeignKey('notifications', foreignKey);
    }
  }
}
