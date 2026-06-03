import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
    @ApiProperty({ example: 1, description: 'Owner of the account' })
    personId!: number;

    @ApiPropertyOptional({ example: 1000, description: 'Initial balance' })
    balance?: number;

    @ApiProperty({ example: 500, description: 'Maximum amount that can be withdrawn per day' })
    dailyWithdrawalLimit!: number;

    @ApiProperty({ example: 1, description: '1 = Checking, 2 = Savings' })
    accountType!: number;
}