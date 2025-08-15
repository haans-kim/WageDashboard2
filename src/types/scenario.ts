export interface Scenario {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: {
    baseUpRate: number
    meritRate: number
    levelRates: Record<string, { baseUp: number; merit: number }>
    totalBudget?: number // 총예산 (원 단위)
    
    // 예산활용내역 상세
    promotionBudgets?: {
      lv1: number
      lv2: number
      lv3: number
      lv4: number
    }
    additionalBudget?: number
    enableAdditionalIncrease?: boolean
    calculatedAdditionalBudget?: number
    
    // 계산된 값들
    levelTotalRates?: Record<string, number>
    weightedAverageRate?: number
    meritWeightedAverage?: number
    
    // GradeSalaryAdjustmentTable의 직급별 세부 인상률
    detailedLevelRates?: Record<string, {
      baseUp: number
      merit: number
      promotion: number
      advancement: number
      additional: number
    }>
  }
}

export interface ScenarioState {
  scenarios: Scenario[]
  activeScenarioId: string | null
}