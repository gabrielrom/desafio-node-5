import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('You dont have that value to make an outcome');
    }

    const checkCategoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (checkCategoryExist) {
      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: checkCategoryExist.id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    const categoryResponse = categoryRepository.create({
      title: category,
    });

    await categoryRepository.save(categoryResponse);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryResponse,
    });

    await transactionsRepository.save(transaction);

    if (transaction.category_id && transaction.category) {
      delete transaction.category_id;
    }

    return transaction;
  }
}

export default CreateTransactionService;
