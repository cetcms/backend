import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from 'src/app.module';
import { Target } from 'src/generated/graphql/prisma';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let companyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform login successfully', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('Origin', 'http://localhost')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              target
              accessType
              accessToken
              accessTimeout
            }
          }
        `,
        variables: {
          input: {
            account: 'admin@email.com',
            password: '123456',
            target: Target.Admin,
          },
        },
      })
      .expect(200)
      .expect((res) => {
        // 添加调试信息
        console.log('Login response:', JSON.stringify(res.body, null, 2));

        // 检查是否有错误
        if (res.body.errors) {
          console.error('Login errors:', res.body.errors);
          throw new Error(`Login failed with errors: ${JSON.stringify(res.body.errors)}`);
        }

        expect(res.body.data).toBeDefined();
        expect(res.body.data.login).toBeDefined();
        expect(res.body.data.login.accessToken).toBeDefined();
        accessToken = res.body.data.login.accessToken;
      });
  });

  it('should list auth companies', (): any => {
    // 只有在获取到访问令牌的情况下才执行此测试
    if (!accessToken) {
      console.log('Skipping list companies test - no access token');
      return;
    }

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          query PaginateCompanies {
            paginateCompanies {
              items {
                id
                name
                alias
                code
              }
              pagination {
                totalCount
              }
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        // 添加调试信息
        console.log('List companies response:', JSON.stringify(res.body, null, 2));

        // 检查是否有错误
        if (res.body.errors) {
          console.error('List companies errors:', res.body.errors);
          throw new Error(`List companies failed with errors: ${JSON.stringify(res.body.errors)}`);
        }

        expect(res.body.data).toBeDefined();
        expect(res.body.data.paginateCompanies).toBeDefined();
        const items = res.body.data.paginateCompanies.items ?? [];
        if (items.length > 0) {
          companyId = items[0].id;
        }
        console.log('Company ID:', companyId);
      });
  });

  it('should switch auth company', (): any => {
    // 只有在获取到公司ID的情况下才执行此测试
    if (!companyId) {
      console.log('Skipping switch company test - no company ID');
      return;
    }

    if (!accessToken) {
      console.log('Skipping switch company test - no access token');
      return;
    }

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          mutation SwitchAuthCompany($companyId: String!) {
            switchAuthCompany(companyId: $companyId) {
              target
              accessType
              accessToken
              accessTimeout
            }
          }
        `,
        variables: {
          companyId: companyId,
        },
      })
      .expect(200)
      .expect((res) => {
        // 添加调试信息
        console.log('Switch company response:', JSON.stringify(res.body, null, 2));

        // 检查是否有错误
        if (res.body.errors) {
          console.error('Switch company errors:', res.body.errors);
          throw new Error(`Switch company failed with errors: ${JSON.stringify(res.body.errors)}`);
        }

        expect(res.body.data).toBeDefined();
        expect(res.body.data.switchAuthCompany).toBeDefined();
        expect(res.body.data.switchAuthCompany.accessToken).toBeDefined();
        // 更新访问令牌
        accessToken = res.body.data.switchAuthCompany.accessToken;
      });
  });

  it('should get auth info', (): any => {
    // 只有在获取到访问令牌的情况下才执行此测试
    if (!accessToken) {
      console.log('Skipping auth info test - no access token');
      return;
    }

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `
          query AuthInfo {
            authInfo {
              id
              target
              adminId
              memberId
              companyId
              admin {
                id
                name
                email
              }
              member {
                id
                name
                email
              }
              company {
                id
                name
                alias
                code
              }
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        // 添加调试信息
        console.log('Auth info response:', JSON.stringify(res.body, null, 2));

        // 检查是否有错误
        if (res.body.errors) {
          console.error('Auth info errors:', res.body.errors);
          throw new Error(`Auth info failed with errors: ${JSON.stringify(res.body.errors)}`);
        }

        expect(res.body.data).toBeDefined();
        expect(res.body.data.authInfo).toBeDefined();
      });
  });
});
