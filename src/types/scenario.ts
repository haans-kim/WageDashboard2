export interface Scenario {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: {
    baseUpRate: number
    meritRate: number
    selectedFixedAmount: number
    levelRates: Record<string, { baseUp: number; merit: number }>
    totalBudget?: number // 총예산 (억원 단위)
  }
}

export interface ScenarioState {
  scenarios: Scenario[]
  activeScenarioId: string | null
}