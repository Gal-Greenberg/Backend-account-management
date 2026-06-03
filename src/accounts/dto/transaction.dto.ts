import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
    @ApiProperty({ example: 500, description: 'Amount to deposit or withdraw' })
    value!: number;
}