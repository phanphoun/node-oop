import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserProfileImage1689000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('users', 'profile_image'))) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'profile_image',
        type: 'text',
        isNullable: true,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('users', 'profile_image')) {
      await queryRunner.dropColumn('users', 'profile_image');
    }
  }
}
