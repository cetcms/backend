import { SystemContract } from 'src/contracts';
import { DatabaseService } from 'src/database';
import { NotificationPrivacy, NotificationReceiver, NotificationSender } from 'src/generated/graphql';
import { I18nEnum } from 'src/i18n';
import {
  AdminCompanyRepository,
  AdminRepository,
  AdminRoleRepository,
  CompanyRepository,
  CompanyRoleRepository,
  CompanyUserRepository,
  NotificationRepository,
  UserRepository,
} from 'src/repositories';

const main = async () => {
  const prisma = new DatabaseService();

  // 创建管理员角色
  const adminRoleRepo = new AdminRoleRepository(prisma);
  const adminRole = await adminRoleRepo.save(
    { code: SystemContract.RootAdminRole },
    {
      name: 'Root',
      code: SystemContract.RootAdminRole,
      description: '根管理员角色',
      permissions: [],
    }
  );
  console.log('Admin role saved:', adminRole);

  // 创建管理员
  const adminRepo = new AdminRepository(prisma);
  const admin = await adminRepo.save(
    { email: 'admin@email.com' },
    {
      name: 'Admin',
      email: 'admin@email.com',
      password: '123456',
      role: {
        connect: {
          id: adminRole.id,
        },
      },
    }
  );
  console.log('Admin saved:', admin);

  // 创建企业角色
  const companyRoleRepo = new CompanyRoleRepository(prisma);
  const companyRole = await companyRoleRepo.saveCommonRole(SystemContract.RootCompanyRole, {
    name: 'Owner',
    description: '企业所有者',
    permissions: [],
  });
  console.log('Company role saved:', companyRole);

  // 创建用户
  const userRepo = new UserRepository(prisma);
  const user = await userRepo.save(
    { email: 'user@email.com' },
    {
      name: 'User',
      email: 'user@email.com',
      password: '123456',
    }
  );
  console.log('User saved:', user);

  // 创建企业
  const companyRepo = new CompanyRepository(prisma);
  const company = await companyRepo.save(
    { code: '123456789011121314' },
    {
      name: '极客领航网络科技有限公司',
      code: '123456789011121314',
      alias: '极客领航',
      description: '极客领航公司',
    }
  );
  console.log('Company saved:', company);

  // 关联管理员企业
  const adminCompanyRepo = new AdminCompanyRepository(prisma);
  const adminCompany = await adminCompanyRepo.save(
    {
      adminCompanyIdx: {
        adminId: admin.id,
        companyId: company.id,
      },
    },
    {
      admin: { connect: { id: admin.id } },
      company: { connect: { id: company.id } },
      role: { connect: { id: companyRole.id } },
    }
  );
  console.log('Admin company saved:', adminCompany);

  // 关联用户
  const companyUserRepo = new CompanyUserRepository(prisma);
  const companyUser = await companyUserRepo.save(
    {
      companyUserIdx: {
        companyId: company.id,
        userId: user.id,
      },
    },
    {
      company: { connect: { id: company.id } },
      role: { connect: { id: companyRole.id } },
      user: { connect: { id: user.id } },
    }
  );
  console.log('Company user saved:', companyUser);

  const notificationRepo = new NotificationRepository(prisma);
  const notification = await notificationRepo.create({
    sender: NotificationSender.System,
    privacy: NotificationPrivacy.Public,
    receiver: [NotificationReceiver.Admin, NotificationReceiver.Company, NotificationReceiver.User],
    content: {
      [I18nEnum.En]: 'Welcome to use the system',
      [I18nEnum.Zh]: '欢迎使用本系统',
      [I18nEnum.ZhHant]: '歡迎使用本系統',
      [I18nEnum.Ja]: 'システムを使用してください',
      [I18nEnum.Ko]: '시스템을 사용하십시오',
    },
  });
  console.log('Notification created:', notification);
};

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((err) => {
    console.error(err);
  });
