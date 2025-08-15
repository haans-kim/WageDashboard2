// 직급 레벨
export type EmployeeLevel = 'Lv.1' | 'Lv.2' | 'Lv.3' | 'Lv.4'

// 평가 등급
export type PerformanceRating = 'S' | 'A' | 'B' | 'C'

// 직원 정보
export interface Employee {
  id: string
  name: string
  level: EmployeeLevel
  department: string
  performanceRating: PerformanceRating
  currentSalary: number
  baseUpAmount: number
  meritIncreaseAmount: number
  totalIncreaseAmount: number
  increasePercentage: number
}

// 인상률 정보
export interface WageIncrease {
  baseUpPercentage: number
  meritIncreasePercentage: number
  totalPercentage: number
  minRange: number
  maxRange: number
}

// 예산 정보
export interface Budget {
  totalBudget: number
  usedBudget: number
  remainingBudget: number
  usagePercentage: number
}

// 직급별 통계
export interface LevelStatistics {
  level: EmployeeLevel
  employeeCount: number
  averageSalary: number
  totalSalary: number
  baseUpPercentage: number
  meritIncreasePercentage: number
  totalIncreasePercentage: number
}