import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const findTransactions = await this.find();

    const income = findTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((accumulator, transaction) => {
        return accumulator + transaction.value;
      }, 0);

    const outcome = findTransactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((accumulator, transaction) => {
        return accumulator + transaction.value;
      }, 0);

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
