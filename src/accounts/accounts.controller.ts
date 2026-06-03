import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    create(@Body() body: {
        personId: number;
        balance?: number;
        dailyWithdrawalLimit: number;
        accountType: number;
    }) {
        return this.accountsService.create(body);
    }

    @Get(':id/balance')
    getBalance(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.getBalance(id);
    }

    @Get(':id/statement')
    getStatement(
        @Param('id', ParseIntPipe) id: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.accountsService.getStatement(id, from, to);
    }

    @Post(':id/deposit')
    deposit(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { value: number },
    ) {
        return this.accountsService.deposit(id, body.value);
    }

    @Post(':id/withdraw')
    withdraw(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { value: number },
    ) {
        return this.accountsService.withdraw(id, body.value);
    }

    @Patch(':id/block')
    block(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.blockAccount(id);
    }
}