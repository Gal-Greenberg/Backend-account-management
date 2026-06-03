import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccountsService {
    constructor(private prisma: PrismaService) {}

    async create(data: {
        personId: number;
        balance?: number;
        dailyWithdrawalLimit: number;
        accountType: number;
    }) {
        return this.prisma.account.create({ data });
    }

    async findOne(accountId: number) {
        const account = await this.prisma.account.findUnique({
            where: { accountId },
        });

        if (!account) 
            throw new NotFoundException('Account not found');
        return account;
    }

    async deposit(accountId: number, value: number) {
        const account = await this.findOne(accountId);
        
        if (!account.activeFlag)
            throw new BadRequestException('Account is blocked');

        return this.prisma.account.update({
            where: { accountId },
            data: {
            balance: account.balance + value,
            transactions: {
                create: { value, type: 'DEPOSIT' },
            }},
        });
    }

    async withdraw(accountId: number, value: number) {
        const account = await this.findOne(accountId);

        if (!account.activeFlag) 
            throw new BadRequestException('Account is blocked');
        if (account.balance < value)
            throw new BadRequestException('Insufficient funds');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayWithdrawals = await this.prisma.transaction.aggregate({
            where: {
            accountId,
            type: 'WITHDRAWAL',
            transactionDate: { gte: today },
            },
            _sum: { value: true },
        });

        const totalToday = todayWithdrawals._sum.value ?? 0;
        if (totalToday + value > account.dailyWithdrawalLimit) {
            throw new BadRequestException('Daily withdrawal limit exceeded');
        }

        return this.prisma.account.update({
            where: { accountId },
            data: {
                balance: account.balance - value,
                transactions: {
                    create: { value, type: 'WITHDRAWAL' },
                },
            },
        });
    }

    async getStatement(accountId: number, from?: string, to?: string) {
        await this.findOne(accountId);

        const where: any = { accountId };
        if (from || to) {
            where.transactionDate = {};
            if (from) where.transactionDate.gte = new Date(from);
            if (to) where.transactionDate.lte = new Date(to);
        }

        return this.prisma.transaction.findMany({ where, orderBy: { transactionDate: 'desc' } });
    }

    async getBalance(accountId: number) {
        const account = await this.findOne(accountId);
        return { accountId, balance: account.balance };
    }

    async blockAccount(accountId: number) {
    await this.findOne(accountId);
        return this.prisma.account.update({
            where: { accountId },
            data: { activeFlag: false },
        });
    }
}