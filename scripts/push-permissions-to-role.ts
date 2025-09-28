import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { Permissions } from 'src/generated/permissions';
import { AdminRoleRepository, CompanyRoleRepository } from 'src/repositories';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import {DatabaseService} from "src/database";

const logger = new Logger('PushPermissionsToRole');

const main = async () => {
  const program = new Command();
  program.option('-r, --role <role>', 'Role to push permissions to <role>', 'root');
  program.option('-p, --permissions <permissions>', 'Permissions to push to role <permissions>');
  program.option('-t, --type <type>', 'Type of permissions to push to role <type>', 'admin');
  program.parse();

  const options = program.opts();
  if (options.role && options.type) {
    const db = new DatabaseService();
    const adminRoleRepo = new AdminRoleRepository(db);
    const companyRoleRepo = new CompanyRoleRepository(db);

    const permissions = Permissions.map((p) => `${p.subject}:${p.action}`);
    if (options.type.toLowerCase() === 'admin') {
      logger.log(`Pushing permissions to admin role ${options.role}`);
      await adminRoleRepo.update({ code: options.role.toUpperCase() }, { permissions });
    }
    if (options.type.toLowerCase() === 'company') {
      logger.log(`Pushing permissions to company role ${options.role}`);
      await companyRoleRepo.updateCommonRole(options.role.toUpperCase(), {
        permissions,
      });
    }
  }
};

main()
  .then(() => {
    logger.log('Running in external script mode');
  })
  .catch((err) => {
    console.error(err);
  });
