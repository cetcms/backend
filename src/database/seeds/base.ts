import { DatabaseService } from 'src/database';
import { CompanyRole } from 'src/generated/graphql/company-role';
import {
  AdminCompanyRepository,
  AdminRepository,
  AdminRoleRepository,
  CompanyRepository,
  CompanyRoleRepository,
  CompanyUserRepository,
  UserRepository,
} from 'src/repositories';

const main = async () => {
  const prisma = new DatabaseService();

  const adminRoleRepo = new AdminRoleRepository(prisma);
  const adminRole = await adminRoleRepo.upsert(
    { code: 'ROOT' },
    {
      name: 'Root',
      code: 'ROOT',
      description: '根管理员角色',
      permissions: [],
    }
  );
  console.log('Admin role created:', adminRole);

  const adminRepo = new AdminRepository(prisma);
  const admin = await adminRepo.upsert(
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
  console.log('Admin created:', admin);

  let companyRole: CompanyRole | null;
  const companyRoleRepo = new CompanyRoleRepository(prisma);
  companyRole = await companyRoleRepo.findFirst(
    { code: { equals: 'OWNER' } },
    { companyId: { sort: 'asc', nulls: 'first' } }
  );
  console.log('Company role found:', companyRole);
  if (!companyRole) {
    companyRole = await companyRoleRepo.create({
      name: 'Owner',
      code: 'OWNER',
      description: '企业所有者',
      permissions: [],
    });
    console.log('Company role created:', companyRole);
  }

  const userRepo = new UserRepository(prisma);
  const user = await userRepo.upsert(
    { email: 'user@email.com' },
    {
      name: 'User',
      email: 'user@email.com',
      password: '123456',
    }
  );
  console.log('User created:', user);

  const companyRepo = new CompanyRepository(prisma);
  const company = await companyRepo.upsert(
    { code: '123456789011121314' },
    {
      name: '极客领航网络科技有限公司',
      code: '123456789011121314',
      alias: '极客领航',
      description: '极客领航公司',
    }
  );
  console.log('Company created:', company);

  const adminCompanyRepo = new AdminCompanyRepository(prisma);
  const adminCompanyExist = await adminCompanyRepo.findUnique({
    adminCompanyIdx: {
      adminId: admin.id,
      companyId: company.id,
    },
  });
  if (!adminCompanyExist) {
    const adminCompany = await adminCompanyRepo.create({
      admin: { connect: { id: admin.id } },
      company: { connect: { id: company.id } },
      permissions: [],
    });
    console.log('Admin company created:', adminCompany);
  } else {
    console.log('Admin company already exists', adminCompanyExist);
  }

  const companyUserRepo = new CompanyUserRepository(prisma);
  const companyUserExist = await companyUserRepo.findUnique({
    companyUserIdx: {
      companyId: company.id,
      userId: user.id,
    },
  });
  if (!companyUserExist) {
    const companyUser = await companyUserRepo.create({
      company: { connect: { id: company.id } },
      role: { connect: { id: companyRole.id } },
      user: { connect: { id: user.id } },
    });
    console.log('Company user created:', companyUser);
  } else {
    console.log('Company user already exists', companyUserExist);
  }
};

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((err) => {
    console.error(err);
  });
