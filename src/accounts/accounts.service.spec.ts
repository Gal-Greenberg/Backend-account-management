import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockAccount = {
  accountId: 1,
  personId: 1,
  balance: 1000,
  dailyWithdrawalLimit: 500,
  activeFlag: true,
  accountType: 1,
  createDate: new Date(),
};

const mockPrisma = {
  account: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if account not found', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('should return account if found', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockAccount);
      const result = await service.findOne(1);
      expect(result).toEqual(mockAccount);
    });
  });

  describe('withdraw', () => {
    it('should throw BadRequestException if account is blocked', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockAccount, activeFlag: false });
      await expect(service.withdraw(1, 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if insufficient funds', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockAccount, balance: 50 });
      await expect(service.withdraw(1, 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if daily limit exceeded', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockAccount);
      mockPrisma.transaction.aggregate.mockResolvedValue({ _sum: { value: 450 } });
      await expect(service.withdraw(1, 100)).rejects.toThrow(BadRequestException);
    });

    it('should withdraw successfully', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockAccount);
      mockPrisma.transaction.aggregate.mockResolvedValue({ _sum: { value: 0 } });
      mockPrisma.account.update.mockResolvedValue({ ...mockAccount, balance: 900 });
      const result = await service.withdraw(1, 100);
      expect(result.balance).toBe(900);
    });
  });

  describe('deposit', () => {
    it('should throw BadRequestException if account is blocked', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockAccount, activeFlag: false });
      await expect(service.deposit(1, 100)).rejects.toThrow(BadRequestException);
    });

    it('should deposit successfully', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockAccount);
      mockPrisma.account.update.mockResolvedValue({ ...mockAccount, balance: 1100 });
      const result = await service.deposit(1, 100);
      expect(result.balance).toBe(1100);
    });
  });
});