module.exports = {
  PrismaClient: jest.fn().mockImplementation(() => ({
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    aiRecommendation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    budget: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    levelStatistics: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    wageCalculation: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    salaryHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}