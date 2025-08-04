/**
 * @jest-environment node
 */
import { POST, PUT } from '@/app/api/simulation/route'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    wageCalculation: {
      create: jest.fn(),
    },
    salaryHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

describe('Simulation API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/simulation', () => {
    test('should run simulation successfully', async () => {
      const mockEmployees = [
        {
          id: '1',
          employeeNumber: 'E001',
          name: '김철수',
          department: '개발팀',
          level: 'Lv.3',
          currentSalary: 65000000,
          performanceRating: 'A',
        },
        {
          id: '2',
          employeeNumber: 'E002',
          name: '이영희',
          department: '영업1팀',
          level: 'Lv.2',
          currentSalary: 45000000,
          performanceRating: 'S',
        },
      ]

      ;(prisma.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees)

      const request = new NextRequest('http://localhost:3000/api/simulation', {
        method: 'POST',
        body: JSON.stringify({
          baseUpPercentage: 3.2,
          meritIncreasePercentage: 2.5,
          filters: {},
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.simulation).toBeDefined()
      expect(data.simulation.totalIncrease).toBe(5.7)
      expect(data.employees).toHaveLength(2)
      expect(data.employees[0].suggestedSalary).toBe(68705000) // 65000000 * 1.057
    })

    test('should apply filters correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulation', {
        method: 'POST',
        body: JSON.stringify({
          baseUpPercentage: 3.2,
          meritIncreasePercentage: 2.5,
          filters: {
            level: 'Lv.3',
            department: '개발팀',
          },
        }),
      })

      await POST(request)

      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        where: {
          level: 'Lv.3',
          department: '개발팀',
        },
      })
    })
  })

  describe('PUT /api/simulation', () => {
    test('should apply simulation results to all employees', async () => {
      const mockEmployees = [
        {
          id: '1',
          employeeNumber: 'E001',
          name: '김철수',
          currentSalary: 65000000,
          suggestedSalary: 68705000,
          increase: 3705000,
        },
      ]

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          employee: prisma.employee,
          wageCalculation: prisma.wageCalculation,
          salaryHistory: prisma.salaryHistory,
        })
      })

      const request = new NextRequest('http://localhost:3000/api/simulation', {
        method: 'PUT',
        body: JSON.stringify({
          employees: mockEmployees,
          applyToAll: true,
        }),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { currentSalary: 68705000 },
      })
      expect(prisma.salaryHistory.create).toHaveBeenCalled()
      expect(prisma.wageCalculation.create).toHaveBeenCalled()
    })

    test('should handle transaction errors', async () => {
      ;(prisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('Transaction failed')
      )

      const request = new NextRequest('http://localhost:3000/api/simulation', {
        method: 'PUT',
        body: JSON.stringify({
          employees: [],
          applyToAll: true,
        }),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to apply wage increases')
    })
  })
})