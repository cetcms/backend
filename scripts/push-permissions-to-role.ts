import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { Command } from 'commander';
import { DatabaseService } from 'src/database';
import { Permissions } from 'src/generated/permissions';
import { AdminRoleRepository, CompanyRoleRepository } from 'src/repositories';

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

    const permissions = Permissions.map((p) => p.name);
    if (options.type.toLowerCase() === 'admin') {
      logger.log(`Pushing ${permissions.length} permissions to admin role ${options.role}`);
      await adminRoleRepo.update({ code: options.role.toUpperCase() }, { permissions }).then((role) => {
        logger.log(`Pushed ${role?.permissions.length} permissions to admin role ${role?.code}`);
      });
    }
    if (options.type.toLowerCase() === 'company') {
      logger.log(`Pushing ${permissions.length} permissions to company role ${options.role}`);
      await companyRoleRepo
        .updateCommonRole(options.role.toUpperCase(), {
          permissions,
        })
        .then((role) => {
          logger.log(`Pushed ${role?.permissions.length} permissions to company role ${role?.code}`);
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
