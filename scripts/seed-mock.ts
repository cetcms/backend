import { faker } from '@faker-js/faker/locale/zh_CN';
import { DatabaseService } from 'src/database';
import { AdminRepository, AdminRoleRepository, CompanyRepository, MemberRepository } from 'src/repositories';

const main = async () => {
  const prisma = new DatabaseService();

  // 创建管理员角色
  const adminRoleRepo = new AdminRoleRepository(prisma);
  const adminRole = await adminRoleRepo.save(
    { code: 'Admin' },
    {
      name: 'Admin',
      code: 'Admin',
      permissions: [],
      description: '管理员角色',
    }
  );
  console.log('Admin role saved:', adminRole);

  // 创建管理员
  const adminRepo = new AdminRepository(prisma);
  ['AdminTest1', 'AdminTest2', 'AdminTest3'].map((name) => {
    const email = `${name.toLowerCase()}@email.com`;
    adminRepo
      .save(
        { email },
        {
          email,
          name: name,
          password: '123456',
          role: {
            connect: {
              id: adminRole.id,
            },
          },
        }
      )
      .then((admin) => {
        console.log('Admin saved:', admin);
      });
  });

  // 创建成员
  const memberRepo = new MemberRepository(prisma);
  Array.from({ length: 10 }).map(() => {
    const email = `member_${faker.internet.username()}@email.com`;
    memberRepo
      .save(
        { email },
        {
          email,
          name: faker.person.fullName(),
          password: '123456',
        }
      )
      .then((member) => {
        console.log('Member saved:', member);
      });
  });

  // 创建企业
  const companyRepo = new CompanyRepository(prisma);
  Array.from({ length: 5 }).map(() => {
    const code = faker.string.uuid();
    const name = faker.company.name();
    companyRepo
      .save(
        { code },
        {
          code,
          name,
          alias: name,
          description: faker.music.album(),
        }
      )
      .then((company) => {
        console.log('Company saved:', company);
      });
  });
};

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((err) => {
    console.error(err);
  });
