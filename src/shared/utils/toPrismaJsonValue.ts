import { Prisma } from 'prisma/generated';

export function toPrismaJsonValue(value: any): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Prisma.InputJsonValue;
    } catch {
      return value;
    }
  }

  return value as Prisma.InputJsonValue;
}
