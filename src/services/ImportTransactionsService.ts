import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  avatarFileName: string;
}

interface TransactionDTO {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ avatarFileName }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, avatarFileName);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionDTO[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      const transaction: TransactionDTO = {
        title,
        type,
        value: parseFloat(value),
        category,
      };
      lines.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    await Promise.all(
      lines.map(async transactionObject => {
        const { title, value, category, type } = transactionObject;
        const createTransaction = new CreateTransactionService();

        const transaction = await createTransaction.execute({
          title,
          type,
          value,
          category,
        });

        transactions.push(transaction);
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
