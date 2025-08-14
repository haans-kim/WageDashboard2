'use client'

import React from 'react'
import { formatKoreanCurrency } from '@/lib/utils'

interface BudgetUtilizationDetailProps {
  baseUpRate?: number
  meritRate?: number
  totalEmployees?: number
  totalSalaryBase?: number  // 총급여베이스 추가
  totalBudget?: number  // 총예산 추가
  levelStatistics?: Array<{
    level: string
    employeeCount: number
    averageSalary: string
  }>
  
  // 승급/승진 예산 (사용자 입력)
  promotionBudgets?: {
    lv2: number
    lv3: number
    lv4: number
  }
  onPromotionBudgetChange?: (level: string, value: number) => void
  
  // 추가 인상 예산 (사용자 입력)
  additionalBudget?: number
  onAdditionalBudgetChange?: (value: number) => void
  
  // 추가 인상 활성화 여부
  enableAdditionalIncrease?: boolean
  onEnableAdditionalIncreaseChange?: (value: boolean) => void
  
  // 계산된 예산 값들을 부모로 전달
  onBudgetCalculated?: (details: {
    aiRecommendation: number
    promotion: number
    additional: number
    indirect: number
  }) => void
}

export function BudgetUtilizationDetail({
  baseUpRate = 3.2,
  meritRate = 2.5,
  totalEmployees = 4925,
  totalSalaryBase = 283034052564, // 총급여베이스
  totalBudget = 30000000000, // 총예산 기본값 300억
  levelStatistics,
  promotionBudgets = { lv2: 263418542, lv3: 119262338, lv4: 32662484 },
  onPromotionBudgetChange,
  additionalBudget = 4499898100,
  onAdditionalBudgetChange,
  enableAdditionalIncrease = true,
  onEnableAdditionalIncreaseChange,
  onBudgetCalculated
}: BudgetUtilizationDetailProps) {
  
  // 카드 1: AI 적정 인상률 예산 (자동 계산 - 총급여베이스 기반)
  const baseUpBudget = totalSalaryBase * (baseUpRate / 100)
  const meritBudget = totalSalaryBase * (meritRate / 100)
  const aiTotalBudget = baseUpBudget + meritBudget
  
  // 카드 2: 승급/승진 인상률 예산 (사용자 입력)
  const promotionLv2 = promotionBudgets.lv2
  const promotionLv3 = promotionBudgets.lv3
  const promotionLv4 = promotionBudgets.lv4
  const promotionTotal = promotionLv2 + promotionLv3 + promotionLv4
  
  // 카드 3: 추가 인상 가능 범위 계산
  // 간접비용 비중 (퇴직급여 4.5% + 4대보험 11.3% + 개인연금 2.0% = 17.8%)
  const indirectCostRatio = 0.178
  
  // 최대인상가능폭 계산
  // 공식: (총예산 - 간접비용비중 * (AI예산 + 승급승진예산)) / 간접비용비중
  const maxIncreasePossible = (totalBudget - indirectCostRatio * (aiTotalBudget + promotionTotal)) / indirectCostRatio
  
  // 현재 설정값 (체크박스 상태에 따라 결정)
  const currentSetting = enableAdditionalIncrease ? additionalBudget : 0
  
  // 카드 4: 간접비용 Impact (자동 계산)
  // 기준값 = AI예산 + 승급승진예산 + 현재설정값(체크박스 상태 반영)
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">예산활용내역상세</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* 카드 1: AI 적정 인상률 예산 */}
        <div className="bg-blue-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-base">
            ①
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-2">
            AI 적정 인상률 예산
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base-up</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(baseUpBudget, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">성과</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(meritBudget, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
              <span className="font-semibold text-gray-700">합계</span>
              <span className="font-bold text-blue-600 text-lg">
                {formatKoreanCurrency(aiTotalBudget, '백만원', 1000000)}
              </span>
            </div>
          </div>
        </div>
        
        {/* 카드 2: 승급/승진 인상률 예산 */}
        <div className="bg-green-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-base">
            ②
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-2">
            승급/승진 인상 예산
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Lv.2</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={Math.round(promotionLv2)}
                  onChange={(e) => onPromotionBudgetChange?.('lv2', parseFloat(e.target.value || '0'))}
                  className="w-32 px-2 py-1.5 text-right text-sm font-semibold border border-gray-300 rounded"
                  placeholder="0"
                  step="1"
                />
                <span className="text-sm text-gray-600">원</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Lv.3</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={Math.round(promotionLv3)}
                  onChange={(e) => onPromotionBudgetChange?.('lv3', parseFloat(e.target.value || '0'))}
                  className="w-32 px-2 py-1.5 text-right text-sm font-semibold border border-gray-300 rounded"
                  placeholder="0"
                  step="1"
                />
                <span className="text-sm text-gray-600">원</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Lv.4</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={Math.round(promotionLv4)}
                  onChange={(e) => onPromotionBudgetChange?.('lv4', parseFloat(e.target.value || '0'))}
                  className="w-32 px-2 py-1.5 text-right text-sm font-semibold border border-gray-300 rounded"
                  placeholder="0"
                  step="1"
                />
                <span className="text-sm text-gray-600">원</span>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-green-200">
              <span className="font-semibold text-gray-700">합계</span>
              <span className="font-bold text-green-600 text-lg">
                {Math.round(promotionTotal).toLocaleString('ko-KR')}원
              </span>
            </div>
          </div>
        </div>
        
        {/* 카드 3: 추가 인상 가능 범위 */}
        <div className="bg-purple-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base">
            ③
          </div>
          <div className="flex items-center justify-between mb-3 mt-2">
            <h3 className="text-sm font-semibold text-gray-700">
              추가 인상 가능 범위
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAdditionalIncrease}
                onChange={(e) => onEnableAdditionalIncreaseChange?.(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">지급</span>
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">최대인상가능폭</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(maxIncreasePossible, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">추가 인상없음</span>
              <span className="font-semibold text-gray-900 text-base">
                0원
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-purple-200">
              <span className="font-semibold text-gray-700">현재 설정</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={Math.round(enableAdditionalIncrease ? additionalBudget : 0)}
                  onChange={(e) => onAdditionalBudgetChange?.(parseFloat(e.target.value || '0'))}
                  className={`w-32 px-2 py-1.5 text-right text-sm font-bold border rounded ${
                    enableAdditionalIncrease 
                      ? 'text-purple-600 border-purple-300 bg-white' 
                      : 'text-gray-400 border-gray-200 bg-gray-50'
                  }`}
                  placeholder="0"
                  step="1"
                  disabled={!enableAdditionalIncrease}
                />
                <span className="text-sm text-gray-600">원</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 카드 4: 간접비용 Impact */}
        <div className="bg-orange-50 rounded-lg p-4 relative">
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-base">
            ④
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-2">
            간접비용 Impact
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">퇴직급여충당분(4.5%)</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(retirementCost, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">4대보험(11.3%)</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(insuranceCost, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">개인연금(2.0%)</span>
              <span className="font-semibold text-gray-900 text-base">
                {formatKoreanCurrency(pensionCost, '백만원', 1000000)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-orange-200">
              <span className="font-semibold text-gray-700">합계</span>
              <span className="font-bold text-orange-600 text-lg">
                {formatKoreanCurrency(indirectTotal, '백만원', 1000000)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}