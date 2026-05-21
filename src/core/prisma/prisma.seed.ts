import { BadRequestException, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '../../../prisma/generated';
import { COVERS } from './data/covers';
const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
});

async function main() {
  try {
    Logger.log('Начало заполнения базы данных');
    await prisma.$transaction([prisma.cover.deleteMany()]);

    await prisma.cover.createMany({
      data: COVERS,
    });

    Logger.log('Заполнение базы данных завершено успешно');
  } catch (error) {
    Logger.error(error);
    throw new BadRequestException('Ошибка при заполнении базы данных');
  } finally {
    Logger.log('Закрытие соединения с базой данных...');
    await prisma.$disconnect();
    Logger.log('Соединение с базой данных успешно закрыто');
  }
}

main();
