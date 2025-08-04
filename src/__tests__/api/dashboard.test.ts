/**
 * @jest-environment node
 */
import { GET } from '@/app/api/dashboard/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    aiRecommendation: {
      findFirst: jest.fn(),
    },
    budget: {
      findFirst: jest.fn(),
    },
    levelStatistics: {
      findMany: jest.fn(),
    },
    employee: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}))

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return dashboard data successfully', async () => {
    const mockDate = new Date('2024-01-01')
    
    // Mock database responses
    ;(prisma.aiRecommendation.findFirst as jest.Mock).mockResolvedValue({
      baseUpPercentage: 3.2,
      meritIncreasePercentage: 2.5,
      explanation: 'Test recommendation',
      status: 'approved',
      createdAt: mockDate,
    })

    ;(prisma.budget.findFirst as jest.Mock).mockResolvedValue({
      totalBudget: 31900000000n, // 319억원
      allocatedBudget: 30000000000n,
      remainingBudget: 1900000000n,
    })

    ;(prisma.levelStatistics.findMany as jest.Mock).mockResolvedValue([
      { level: 'Lv.1', averageSalary: 30000000, employeeCount: 50 },
      { level: 'Lv.2', averageSalary: 45000000, employeeCount: 100 },
      { level: 'Lv.3', averageSalary: 65000000, employeeCount: 150 },
      { level: 'Lv.4', averageSalary: 85000000, employeeCount: 45 },
    ])

    ;(prisma.employee.count as jest.Mock).mockResolvedValue(345)

    ;(prisma.employee.groupBy as jest.Mock)
      .mockResolvedValueOnce([ // By department
        { department: '영업1팀', _count: { _all: 60 } },
        { department: '영업2팀', _count: { _all: 55 } },
        { department: '개발팀', _count: { _all: 80 } },
      ])
      .mockResolvedValueOnce([ // By performance rating
        { performanceRating: 'S', _count: { _all: 35 } },
        { performanceRating: 'A', _count: { _all: 210 } },
        { performanceRating: 'B', _count: { _all: 100 } },
      ])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('aiRecommendation')
    expect(data).toHaveProperty('budget')
    expect(data).toHaveProperty('levelStatistics')
    expect(data).toHaveProperty('departmentDistribution')
    expect(data).toHaveProperty('performanceDistribution')
    expect(data.summary.totalEmployees).toBe(345)
  })

  test('should handle database errors gracefully', async () => {
    (prisma.aiRecommendation.findFirst as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
    expect(data.error).toBe('Failed to fetch dashboard data')
  })
})