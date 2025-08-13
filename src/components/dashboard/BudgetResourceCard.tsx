'use client'

import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'

interface BudgetResourceCardProps {
  totalBudget?: number // 원 단위
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
  customTotalBudget?: number | null
  onTotalBudgetChange?: (value: number | null) => void
}

export function BudgetResourceCard({ 
  totalBudget = 30000000000, // 300억원으로 변경
  baseUpRate = 3.2,
  meritRate = 2.5,
  totalEmployees = 4167,
  averageSalary,
  levelRates,
  levelStatistics,
  customTotalBudget,
  onTotalBudgetChange
}: BudgetResourceCardProps) {
  
  const actualBudget = customTotalBudget !== null && customTotalBudget !== undefined 
    ? customTotalBudget * 100000000 
    : totalBudget
  
  // 예산 계산 로직 - 사용자 제공 값
  let aiRecommendationBudget = 16132940996 // 카드 1: AI 적정 인상률 예산 (53.8%)
  let promotionBudget = 151924823 // 카드 2: 승급/승진 예산 (0.5%)
  let additionalBudget = 4499898100 // 카드 3: 추가 인상 (15.0%)
  let indirectCostBudget = 3699687978 // 카드 4: 간접비용 (12.3%)
  
  // 레벨별 계산이 있을 경우
  if (levelRates && levelStatistics) {
    aiRecommendationBudget = 0
    levelStatistics.forEach((level) => {
      const levelRate = levelRates[level.level]
      if (levelRate) {
        const levelAvgSalary = parseFloat(level.averageSalary)
        const levelBudget = level.employeeCount * levelAvgSalary * (levelRate.baseUp + levelRate.merit) / 100
        aiRecommendationBudget += levelBudget
      }
    })
  }
  
  // 총 사용 예산
  const totalUsedBudget = aiRecommendationBudget + promotionBudget + additionalBudget + indirectCostBudget
  const usageRate = (totalUsedBudget / actualBudget) * 100
  const savingRate = 100 - usageRate
  
  // 각 항목의 비율 계산
  const aiPercent = (aiRecommendationBudget / actualBudget) * 100
  const promotionPercent = (promotionBudget / actualBudget) * 100
  const additionalPercent = (additionalBudget / actualBudget) * 100
  const indirectPercent = (indirectCostBudget / actualBudget) * 100
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">인상재원예산현황</h2>
      
      {/* 상단: 총예산, 사용예산, 활용률 */}
      <div className="bg-blue-50 rounded-lg p-5 mb-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700 font-medium">총 예산</span>
            <div className="flex items-center gap-2">
              {onTotalBudgetChange ? (
                <div className="flex items-center gap-1 bg-white rounded-lg border-2 border-blue-300 px-4 py-2">
                  <input
                    type="number"
                    value={customTotalBudget || actualBudget / 100000000}
                    onChange={(e) => {
                      const value = e.target.value
                      onTotalBudgetChange(value ? parseFloat(value) : null)
                    }}
                    className="w-28 text-2xl font-bold text-blue-600 outline-none text-right"
                    placeholder="0"
                  />
                  <span className="text-base font-medium text-gray-600">억원</span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {formatKoreanCurrency(actualBudget, '억')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700">사용 예산</span>
            <span className="text-lg font-bold text-blue-600">
              {formatKoreanCurrency(totalUsedBudget, '억')}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-blue-200">
            <span className="text-base text-gray-700">활용률</span>
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">
                {formatPercentage(usageRate)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (절감률: {formatPercentage(savingRate)})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단: 고정급 인상(3줄), 간접비용 인상 */}
      <div className="space-y-3">
        {/* 고정급 인상 섹션 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">고정급 인상</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center relative pl-7">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                ①
              </div>
              <span className="text-sm text-gray-600">AI 적정 인상률</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 text-sm">
                  {formatKoreanCurrency(aiRecommendationBudget, '백만원', 1000000)}
                </span>
                <span className="text-xs text-gray-500 ml-1">{formatPercentage(aiPercent)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center relative pl-7">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                ②
              </div>
              <span className="text-sm text-gray-600">승급/승진 인상</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 text-sm">
                  {formatKoreanCurrency(promotionBudget, '백만원', 1000000)}
                </span>
                <span className="text-xs text-gray-500 ml-1">{formatPercentage(promotionPercent)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center relative pl-7">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                ③
              </div>
              <span className="text-sm text-gray-600">추가 인상</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 text-sm">
                  {formatKoreanCurrency(additionalBudget, '백만원', 1000000)}
                </span>
                <span className="text-xs text-gray-500 ml-1">{formatPercentage(additionalPercent)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 간접비용 인상 섹션 */}
        <div className="bg-orange-50 rounded-lg p-4 relative pl-9">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            ④
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">간접비용 인상</span>
            <div className="text-right">
              <span className="font-bold text-orange-600 text-base">
                {formatKoreanCurrency(indirectCostBudget, '백만원', 1000000)}
              </span>
              <span className="text-xs text-gray-500 ml-1">{formatPercentage(indirectPercent)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}