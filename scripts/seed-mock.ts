import { faker } from '@faker-js/faker/locale/zh_CN';
import { DatabaseService } from 'src/database';
import {
  AdminRepository,
  AdminRoleRepository,
  CompanyRepository,
  CompanyRoleRepository,
  MemberRepository,
} from 'src/repositories';
import voca from 'voca';

const main = async () => {
  const prisma = new DatabaseService();

  // 创建管理员角色
  const adminRoleRepo = new AdminRoleRepository(prisma);
  const adminRole = await adminRoleRepo.save(
    { code: 'ADMIN' },
    {
      name: 'Admin',
      code: 'ADMIN',
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
  Array.from({ length: 20 }).map(() => {
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
  const companyRoleRepo = new CompanyRoleRepository(prisma);
  Array.from({ length: 10 }).map(() => {
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
        Array.from({ length: 3 }).map(() => {
          const code = voca.snakeCase(faker.person.jobArea()).toUpperCase();
          // 创建企业角色
          companyRoleRepo
            .save(
              {
                companyRoleIdx: {
                  code,
                  companyId: company.id,
                },
              },
              {
                code,
                name: faker.person.jobType(),
                description: faker.person.jobTitle(),
                company: {
                  connect: {
                    id: company.id,
                  },
                },
                permissions: [],
              }
            )
            .then((companyRole) => {
              console.log('Company role saved:', companyRole);
            });
        });
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
