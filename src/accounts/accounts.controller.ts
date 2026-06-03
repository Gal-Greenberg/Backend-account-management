import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { TransactionDto } from './dto/transaction.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new account' })
    create(@Body() body: CreateAccountDto) {
        return this.accountsService.create(body);
    }

    @Get(':id/balance')
    @ApiOperation({ summary: 'Get account balance' })
    getBalance(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.getBalance(id);
    }

    @Get(':id/statement')
    @ApiOperation({ summary: 'Get transaction history, optionally filtered by date range' })
    getStatement(
        @Param('id', ParseIntPipe) id: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.accountsService.getStatement(id, from, to);
    }

    @Post(':id/deposit')
    @ApiOperation({ summary: 'Deposit funds into account' })
    deposit(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: TransactionDto,
    ) {
        return this.accountsService.deposit(id, body.value);
    }

    @Post(':id/withdraw')
    @ApiOperation({ summary: 'Withdraw funds from account' })
    withdraw(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: TransactionDto,
    ) {
        return this.accountsService.withdraw(id, body.value);
    }

    @Patch(':id/block')
    @ApiOperation({ summary: 'Block account' })
    block(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.blockAccount(id);
    }
}