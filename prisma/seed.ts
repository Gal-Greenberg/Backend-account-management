import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const account1 = await prisma.account.create({
        data: {
            personId: 1,
            balance: 5000,
            dailyWithdrawalLimit: 1000,
            accountType: 1,
            transactions: {
                create: [{ value: 5000, type: 'DEPOSIT' }],
            },
        },
    });

    const account2 = await prisma.account.create({
        data: {
            personId: 2,
            balance: 2000,
            dailyWithdrawalLimit: 500,
            accountType: 2,
            transactions: {
                create: [
                    { value: 3000, type: 'DEPOSIT' },
                    { value: 1000, type: 'WITHDRAWAL' },
                ],
            },
        },
    });

    const account3 = await prisma.account.create({
        data: {
            personId: 3,
            balance: 0,
            dailyWithdrawalLimit: 200,
            accountType: 1,
            activeFlag: false,
            transactions: {
                create: [
                    { value: 500, type: 'DEPOSIT' },
                    { value: 500, type: 'WITHDRAWAL' },
                ],
            },
        },
    });

    console.log('Seeded accounts:', account1.accountId, account2.accountId, account3.accountId);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());