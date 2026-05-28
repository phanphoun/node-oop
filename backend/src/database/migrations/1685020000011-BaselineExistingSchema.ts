import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaselineExistingSchema1685020000011 implements MigrationInterface {
    public async up(_queryRunner: QueryRunner): Promise<void> {
        // baseline migration: intentionally empty to mark existing schema as managed
        return Promise.resolve();
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // no-op: baseline should not attempt to drop existing tables
        return Promise.resolve();
    }
}
