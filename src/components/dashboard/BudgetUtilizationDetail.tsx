'use client'

import React from 'react'
import { formatKoreanCurrency } from '@/lib/utils'

interface BudgetUtilizationDetailProps {
  baseUpRate?: number
  meritRate?: number
  meritWeightedAverage?: number  // 성과인상률 가중평균 추가
  totalEmployees?: number
  totalSalaryBase?: number  // 총급여베이스 추가
  totalBudget?: number  // 총예산 추가
  levelStatistics?: Array<{
    level: string
    employeeCount: number
    averageSalary: string
  }>
  
  // 승급/승격 예산 (사용자 입력)
  promotionBudgets?: {
    lv1: number
    lv2: number
    lv3: number
    lv4: number
  }
  onPromotionBudgetChange?: (level: string, value: number) => void
  
  // 추가 인상 예산 (사용자 입력)
  additionalBudget?: number
  onAdditionalBudgetChange?: (value: number) => void
  
  // 추가 인상 활성화 여부 (읽기 전용)
  enableAdditionalIncrease?: boolean
  
  // 계산된 예산 값들을 부모로 전달
  onBudgetCalculated?: (details: {
    aiRecommendation: number
    promotion: number
    additional: number
    indirect: number
  }) => void
}

function BudgetUtilizationDetailComponent({
  baseUpRate = 0,
  meritRate = 0,
  meritWeightedAverage,
  totalEmployees,
  totalSalaryBase, // 총급여베이스 - props로 전달받음
  totalBudget = 0, // 총예산 기본값
  levelStatistics,
  promotionBudgets = { lv1: 0, lv2: 0, lv3: 0, lv4: 0 },
  onPromotionBudgetChange,
  additionalBudget = 0,
  onAdditionalBudgetChange,
  enableAdditionalIncrease = false,
  onBudgetCalculated
}: BudgetUtilizationDetailProps) {
  
  // 카드 1: AI 적정 인상률 예산 (자동 계산 - 직급별 데이터 기반)
  let baseUpBudget = 0
  let meritBudget = 0
  let aiTotalBudget = 0
  
  if (levelStatistics && levelStatistics.length > 0) {
    // 직급별 계산 (BudgetResourceCard와 동일한 방식)
    levelStatistics.forEach((level) => {
      const levelAvgSalary = parseFloat(level.averageSalary)
      const levelBaseUpBudget = level.employeeCount * levelAvgSalary * (baseUpRate / 100)
      const effectiveMeritRate = meritWeightedAverage !== undefined && meritWeightedAverage > 0 ? meritWeightedAverage : meritRate
      const levelMeritBudget = level.employeeCount * levelAvgSalary * (effectiveMeritRate / 100)
      
      baseUpBudget += levelBaseUpBudget
      meritBudget += levelMeritBudget
    })
    aiTotalBudget = baseUpBudget + meritBudget
  } else {
    // 레벨 데이터가 없으면 기존 방식 사용 (fallback)
    baseUpBudget = (totalSalaryBase || 0) * (baseUpRate / 100)
    const effectiveMeritRate = meritWeightedAverage !== undefined && meritWeightedAverage > 0 ? meritWeightedAverage : meritRate
    meritBudget = (totalSalaryBase || 0) * (effectiveMeritRate / 100)
    aiTotalBudget = baseUpBudget + meritBudget
  }
  
  // 승급/승격 인상률은 제거되었으므로 0으로 설정
  const promotionTotal = 0
  
  // 카드 3: 추가 인상 가능 범위 계산
  // 간접비용 비중 (퇴직급여 4.5% + 4대보험 11.3% + 개인연금 2.0% = 17.8%)
  const indirectCostRatio = 0.178
  
  // 최대인상가능폭 계산
  // 현재까지 사용된 직접비용
  const usedDirectCost = aiTotalBudget + promotionTotal
  // 현재까지 사용된 간접비용
  const usedIndirectCost = usedDirectCost * indirectCostRatio
  // 현재까지 사용된 총비용
  const totalUsedCost = usedDirectCost + usedIndirectCost
  // 남은 예산
  const remainingBudget = totalBudget - totalUsedCost
  // 최대인상가능폭 (남은 예산을 1.178로 나누어 직접비용만 추출)
  const maxIncreasePossible = remainingBudget / (1 + indirectCostRatio)
  
  // 현재 설정값 (체크박스 상태에 따라 결정)
  const currentSetting = enableAdditionalIncrease ? additionalBudget : 0
  
  // 카드 4: 간접비용 Impact (자동 계산)
  // 기준값 = AI예산 + 승급승격예산 + 현재설정값(체크박스 상태 반영)
  const totalBasisAmount = aiTotalBudget + promotionTotal + currentSetting
  
  const retirementCost = totalBasisAmount * 0.045 // 퇴직급여충당분(4.5%)
  const insuranceCost = totalBasisAmount * 0.113 // 4대보험(11.3%)
  const pensionCost = totalBasisAmount * 0.020 // 개인연금(2.0%)
  const indirectTotal = retirementCost + insuranceCost + pensionCost
  
  // 계산된 예산 값들을 부모 컴포넌트로 전달
  React.useEffect(() => {
    if (onBudgetCalculated) {
      onBudgetCalculated({
        aiRecommendation: aiTotalBudget,
        promotion: promotionTotal,
        additional: currentSetting,
        indirect: indirectTotal
      })
    }
  }, [aiTotalBudget, promotionTotal, currentSetting, indirectTotal, onBudgetCalculated])
  
  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">예산 활용 내역 상세</h2>
      
      <div className="grid grid-cols-1 gap-4 flex-1">
        {/* 카드 1: AI 적정 인상률 예산 */}
        <div className="bg-blue-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-base">
            1
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-3 mt-2 pl-2">
            AI 적정 인상률 예산
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base text-gray-700">Base-up 재원</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(baseUpBudget, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-gray-700">성과인상률 재원</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(meritBudget, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="font-semibold text-gray-700 text-base">합계</span>
              <div className="text-right">
                <span className="font-bold text-blue-600 text-lg">
                  {formatKoreanCurrency(aiTotalBudget, '백만원', 1000000)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  ({totalBudget > 0 ? ((aiTotalBudget / totalBudget) * 100).toFixed(1) : '0.0'}% 활용)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 카드 2: 추가 인상 가능 범위 */}
        <div className="bg-purple-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-base">
            2
          </div>
          <div className="flex items-center justify-between mb-3 mt-2 pl-2">
            <h3 className="text-base font-semibold text-gray-700">
              추가 인상 가능 범위
            </h3>
            {enableAdditionalIncrease && (
              <span className="text-sm font-medium text-purple-600">활성화됨</span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base text-gray-700">최대인상가능폭</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(maxIncreasePossible, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-purple-200">
              <span className="font-semibold text-gray-700 text-base">현재 설정</span>
              <div className="text-right">
                <span className="font-bold text-purple-600 text-lg">
                  {formatKoreanCurrency(currentSetting, '백만원', 1000000)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  ({totalBudget > 0 ? ((currentSetting / totalBudget) * 100).toFixed(1) : '0.0'}% 활용)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 카드 3: 간접비용 Impact */}
        <div className="bg-orange-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-base">
            3
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-3 mt-2 pl-2">
            간접비용 Impact
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base text-gray-700">퇴직급여충당분(4.5%)</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(retirementCost, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-gray-700">4대보험(11.3%)</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(insuranceCost, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-gray-700">개인연금(2.0%)</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(pensionCost, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-orange-200">
              <span className="font-semibold text-gray-700 text-base">합계</span>
              <div className="text-right">
                <span className="font-bold text-orange-600 text-lg">
                  {formatKoreanCurrency(indirectTotal, '백만원', 1000000)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  ({totalBudget > 0 ? ((indirectTotal / totalBudget) * 100).toFixed(1) : '0.0'}% 활용)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const BudgetUtilizationDetail = React.memo(BudgetUtilizationDetailComponent)