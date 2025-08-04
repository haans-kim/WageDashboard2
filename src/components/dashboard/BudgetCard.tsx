'use client'

import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'

interface BudgetCardProps {
  data: {
    totalBudget: string
    usedBudget: string
    remainingBudget: string
    usagePercentage: number
  } | null
  baseUpRate?: number
  meritRate?: number
  totalEmployees?: number
  averageSalary?: number
  levelRates?: Record<string, { baseUp: number; merit: number }>
  levelStatistics?: Array<{
    level: string
    employeeCount: number
    averageSalary: string
  }>
  selectedFixedAmount?: number
  customTotalBudget?: number | null
  onTotalBudgetChange?: (value: number | null) => void
}

export function BudgetCard({ data, baseUpRate, meritRate, totalEmployees, averageSalary, levelRates, levelStatistics, selectedFixedAmount = 100, customTotalBudget, onTotalBudgetChange }: BudgetCardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">인상 재원 예산 현황</h2>
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const totalBudget = customTotalBudget !== null && customTotalBudget !== undefined 
    ? BigInt(Math.round(customTotalBudget * 100000000)) 
    : BigInt(data.totalBudget)
  
  // 1번: AI 적정 인상률 예산 계산
  let aiRecommendationBudget = 0
  let baseSalaryIncrease = 0
  
  if (levelRates && levelStatistics) {
    // 레벨별로 계산
    levelStatistics.forEach((level) => {
      const levelRate = levelRates[level.level]
      if (levelRate) {
        const levelAvgSalary = parseFloat(level.averageSalary)
        const levelBudget = (level.employeeCount * levelAvgSalary * (levelRate.baseUp + levelRate.merit) / 100) * 12 / 100000000
        aiRecommendationBudget += levelBudget
        baseSalaryIncrease += (level.employeeCount * levelAvgSalary * (levelRate.baseUp + levelRate.merit) / 100) * 12
      }
    })
    aiRecommendationBudget = Math.round(aiRecommendationBudget)
  } else if (baseUpRate !== undefined && meritRate !== undefined && totalEmployees && averageSalary) {
    const totalRate = (baseUpRate + meritRate) / 100
    baseSalaryIncrease = totalEmployees * averageSalary * totalRate * 12
    aiRecommendationBudget = Math.round(baseSalaryIncrease / 100000000)
  }
  
  // 2번: 정액 인상 (선택된 금액 * 인원수) - 연간 금액
  const fixedIncreaseBudgetRounded = Math.round((selectedFixedAmount * (totalEmployees || 0)) / 10000) // 억원 단위
  
  // 3번: 간접비용 (기본급 인상분의 약 22.6%)
  // 정액 인상도 간접비용에 포함되어야 함
  const totalSalaryIncrease = baseSalaryIncrease + (fixedIncreaseBudgetRounded * 100000000)
  const indirectCostBudget = Math.round(totalSalaryIncrease * 0.226 / 100000000)
  
  // 총 사용 예산
  const totalUsedBudget = aiRecommendationBudget + fixedIncreaseBudgetRounded + indirectCostBudget
  
  
  const usedBudget = BigInt(Math.round(totalUsedBudget * 100000000))
  const usagePercentage = Number(totalBudget) > 0 ? (totalUsedBudget / (Number(totalBudget) / 100000000)) * 100 : 0
  
  const remainingBudget = totalBudget - usedBudget
  const isSimulated = baseUpRate !== undefined || meritRate !== undefined

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isSimulated ? '시뮬레이션 예산 현황' : '인상 재원 예산 현황'}
      </h2>
      <div className="space-y-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">총 예산</span>
            {onTotalBudgetChange ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customTotalBudget || Number(data.totalBudget) / 100000000}
                  onChange={(e) => {
                    const value = e.target.value
                    onTotalBudgetChange(value ? parseFloat(value) : null)
                  }}
                  className="w-24 px-2 py-1 text-xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
                <span className="text-xl font-bold text-gray-900">억원</span>
              </div>
            ) : (
              <span className="text-2xl font-bold font-tabular text-gray-900">
                {formatKoreanCurrency(Number(totalBudget), '억원')}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{isSimulated ? '시뮬레이션 사용 예산' : '사용 예산'}</span>
            <span className={`font-semibold font-tabular text-lg ${isSimulated ? 'text-purple-600' : 'text-gray-900'}`}>
              {formatKoreanCurrency(Number(usedBudget), '억원')}
            </span>
          </div>
        </div>
        
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between items-center text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">1</span>
              AI 적정 인상률
            </span>
            <span className="font-medium">{aiRecommendationBudget}억 원</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">2</span>
              정액 인상 ({selectedFixedAmount}만원)
            </span>
            <span className="font-medium">{fixedIncreaseBudgetRounded}억 원</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-600">3</span>
              간접비용
            </span>
            <span className="font-medium">{indirectCostBudget}억 원</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">예산 사용률</span>
            <span className={`text-sm font-semibold ${isSimulated ? 'text-purple-600' : 'text-primary-600'}`}>
              {formatPercentage(usagePercentage)} 활용
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className={`${isSimulated ? 'bg-purple-600' : 'bg-primary-600'} rounded-full h-3 transition-all duration-300`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">잔여 예산</span>
            <span className="font-semibold text-green-600 font-tabular">
              {formatKoreanCurrency(Number(remainingBudget), '억원')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}