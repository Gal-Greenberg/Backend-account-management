# Backend Account Management

  A REST API for managing bank accounts and transactions, built with NestJS, TypeScript, and PostgreSQL.

## Tech Stack

  - **NestJS** - Node.js framework
  - **TypeScript**
  - **PostgreSQL** - Database
  - **Prisma** - ORM
  - **Docker** - Database container
  - **Swagger** - API documentation
  - **Jest** - Testing

## Prerequisites

  - Node.js (v18+)
  - Docker Desktop

## Setup

1. Clone the repository:
```bash
  git clone https://github.com/Gal-Greenberg/Backend-account-management.git
  cd Backend-account-management
```
2. Install dependencies:
```bash
  npm install
```
3. Create a `.env` file in the root directory like .env.example
4. Start the database:
```bash
  docker-compose up -d
```
5. Run database migrations:
```bash
  npx prisma migrate deploy
```
6. Seed the database with sample data:
```bash
   npm run seed
```
7. Start the server:
```bash
   npm run start:dev
```

The server will run on `http://localhost:3000`

## API Documentation

Swagger UI is available at `http://localhost:3000/api`

## Sample Data

The seed creates 3 accounts:

| Account ID | Person ID | Balance | Daily Limit | Type | Status |
|------------|-----------|---------|-------------|------|--------|
| 1 | 1 | 5000 | 1000 | Checking | Active |
| 2 | 2 | 2000 | 500 | Savings | Active |
| 3 | 3 | 0 | 200 | Checking | Blocked |

Account 3 is blocked — useful for testing error handling.

## API Endpoints

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts` | Create a new account |
| GET | `/accounts/:id/balance` | Get account balance |
| GET | `/accounts/:id/statement` | Get transaction history |
| POST | `/accounts/:id/deposit` | Deposit funds |
| POST | `/accounts/:id/withdraw` | Withdraw funds |
| PATCH | `/accounts/:id/block` | Block an account |

### Statement Filtering

The statement endpoint supports date filtering via query params:
GET /accounts/:id/statement?from=2026-01-01&to=2026-12-31

### Request Examples

**Create account:**
```json
POST /accounts
{
  "personId": 1,
  "balance": 1000,
  "dailyWithdrawalLimit": 500,
  "accountType": 1
}
```

**Deposit:**
```json
POST /accounts/1/deposit
{
  "value": 500
}
```

**Withdraw:**
```json
POST /accounts/1/withdraw
{
  "value": 200
}
```

## Business Rules

- Withdrawals are rejected if the account is blocked
- Withdrawals are rejected if balance is insufficient
- Withdrawals are rejected if the daily withdrawal limit is exceeded
- Deposits are rejected if the account is blocked

## Running Tests
```bash
npm run test
```