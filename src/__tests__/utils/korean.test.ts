import { formatKoreanNumber, formatKoreanCurrency } from '@/utils/korean'

describe('Korean Number Formatting', () => {
  describe('formatKoreanNumber', () => {
    test('should format numbers less than 10,000', () => {
      expect(formatKoreanNumber(0)).toBe('0')
      expect(formatKoreanNumber(1234)).toBe('1,234')
      expect(formatKoreanNumber(9999)).toBe('9,999')
    })

    test('should format numbers in 만원 (10,000) unit', () => {
      expect(formatKoreanNumber(10000)).toBe('1만')
      expect(formatKoreanNumber(50000)).toBe('5만')
      expect(formatKoreanNumber(123456)).toBe('12.3만')
    })

    test('should format numbers in 억원 (100,000,000) unit', () => {
      expect(formatKoreanNumber(100000000)).toBe('1억')
      expect(formatKoreanNumber(550000000)).toBe('5.5억')
      expect(formatKoreanNumber(1234567890)).toBe('12.3억')
    })

    test('should handle negative numbers', () => {
      expect(formatKoreanNumber(-10000)).toBe('-1만')
      expect(formatKoreanNumber(-100000000)).toBe('-1억')
    })
  })

  describe('formatKoreanCurrency', () => {
    test('should format currency with "원" suffix', () => {
      expect(formatKoreanCurrency(0)).toBe('0원')
      expect(formatKoreanCurrency(1234)).toBe('1,234원')
      expect(formatKoreanCurrency(10000)).toBe('1만 원')
      expect(formatKoreanCurrency(100000000)).toBe('1억 원')
    })

    test('should handle decimal places correctly', () => {
      expect(formatKoreanCurrency(12345678)).toBe('1,235만 원')
      expect(formatKoreanCurrency(123456789)).toBe('1.2억 원')
    })
  })
})