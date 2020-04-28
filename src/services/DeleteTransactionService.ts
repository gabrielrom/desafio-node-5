import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transactionExist = await transactionRepository.findOne({
      where: { id },
    });

    if (!transactionExist) {
      throw new AppError('Transaction not found', 401);
    }

    await transactionRepository.remove(transactionExist);
  }
}

export default DeleteTransactionService;
