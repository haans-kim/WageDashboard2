import { calculateWageIncrease, calculateTotalBudget } from '@/utils/calculations'

describe('Wage Calculations', () => {
  describe('calculateWageIncrease', () => {
    test('should calculate wage increase correctly', () => {
      const result = calculateWageIncrease({
        currentSalary: 50000000, // 5천만원
        baseUpPercentage: 3.2,
        meritIncreasePercentage: 2.5,
      })

      expect(result.totalPercentage).toBe(5.7)
      expect(result.newSalary).toBe(52850000) // 5천만원 * 1.057
      expect(result.increaseAmount).toBe(2850000)
    })

    test('should handle zero percentages', () => {
      const result = calculateWageIncrease({
        currentSalary: 50000000,
        baseUpPercentage: 0,
        meritIncreasePercentage: 0,
      })

      expect(result.totalPercentage).toBe(0)
      expect(result.newSalary).toBe(50000000)
      expect(result.increaseAmount).toBe(0)
    })

    test('should round results properly', () => {
      const result = calculateWageIncrease({
        currentSalary: 33333333,
        baseUpPercentage: 1.5,
        meritIncreasePercentage: 1.5,
      })

      expect(result.newSalary).toBe(34333333) // Rounded from 34,333,333.29
    })
  })

  describe('calculateTotalBudget', () => {
    test('should calculate total budget for employee list', () => {
      const employees = [
        { id: '1', currentSalary: 50000000, suggestedSalary: 52850000 },
        { id: '2', currentSalary: 40000000, suggestedSalary: 42280000 },
        { id: '3', currentSalary: 30000000, suggestedSalary: 31710000 },
      ]

      const result = calculateTotalBudget(employees)

      expect(result.currentTotal).toBe(120000000)
      expect(result.newTotal).toBe(126840000)
      expect(result.difference).toBe(6840000)
      expect(result.percentageIncrease).toBeCloseTo(5.7, 1)
    })

    test('should handle empty employee list', () => {
      const result = calculateTotalBudget([])

      expect(result.currentTotal).toBe(0)
      expect(result.newTotal).toBe(0)
      expect(result.difference).toBe(0)
      expect(result.percentageIncrease).toBe(0)
    })
  })
})