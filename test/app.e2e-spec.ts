import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('AccountsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await app.close();
  });

  it('POST /accounts - should create an account', async () => {
    const res = await request(app.getHttpServer())
      .post('/accounts')
      .send({ personId: 1, balance: 1000, dailyWithdrawalLimit: 500, accountType: 1 });

    expect(res.status).toBe(201);
    expect(res.body.balance).toBe(1000);
    expect(res.body.activeFlag).toBe(true);
  });

  it('POST /accounts/:id/deposit - should deposit funds', async () => {
    const account = await prisma.account.create({
      data: { personId: 2, balance: 500, dailyWithdrawalLimit: 300, accountType: 1 },
    });

    const res = await request(app.getHttpServer())
      .post(`/accounts/${account.accountId}/deposit`)
      .send({ value: 200 });

    expect(res.status).toBe(201);
    expect(res.body.balance).toBe(700);
  });

  it('POST /accounts/:id/withdraw - should withdraw funds', async () => {
    const account = await prisma.account.create({
      data: { personId: 3, balance: 1000, dailyWithdrawalLimit: 500, accountType: 1 },
    });

    const res = await request(app.getHttpServer())
      .post(`/accounts/${account.accountId}/withdraw`)
      .send({ value: 200 });

    expect(res.status).toBe(201);
    expect(res.body.balance).toBe(800);
  });

  it('POST /accounts/:id/withdraw - should reject if daily limit exceeded', async () => {
    const account = await prisma.account.create({
      data: { personId: 4, balance: 1000, dailyWithdrawalLimit: 100, accountType: 1 },
    });

    const res = await request(app.getHttpServer())
      .post(`/accounts/${account.accountId}/withdraw`)
      .send({ value: 200 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Daily withdrawal limit exceeded');
  });

  it('PATCH /accounts/:id/block - should block account', async () => {
    const account = await prisma.account.create({
      data: { personId: 5, balance: 1000, dailyWithdrawalLimit: 500, accountType: 1 },
    });

    const res = await request(app.getHttpServer())
      .patch(`/accounts/${account.accountId}/block`);

    expect(res.status).toBe(200);
    expect(res.body.activeFlag).toBe(false);
  });

  it('GET /accounts/:id/statement - should return transactions', async () => {
    const account = await prisma.account.create({
      data: {
        personId: 6,
        balance: 800,
        dailyWithdrawalLimit: 500,
        accountType: 1,
        transactions: {
          create: [{ value: 1000, type: 'DEPOSIT' }, { value: 200, type: 'WITHDRAWAL' }],
        },
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/accounts/${account.accountId}/statement`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});