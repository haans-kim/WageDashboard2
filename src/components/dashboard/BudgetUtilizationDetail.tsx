'use client'

import { formatKoreanCurrency } from '@/lib/utils'

interface BudgetUtilizationDetailProps {
  baseUpRate?: number
  meritRate?: number
  totalEmployees?: number
  averageSalary?: number
  levelStatistics?: Array<{
    level: string
    employeeCount: number
    averageSalary: string
  }>
}

export function BudgetUtilizationDetail({
  baseUpRate = 3.2,
  meritRate = 2.5,
  totalEmployees = 4167,
  averageSalary = 67906000, // 평균 급여
  levelStatistics
}: BudgetUtilizationDetailProps) {
  
  // 카드 1: AI 적정 인상률 예산 (사용자 제공 값)
  const aiTotalBudget = 16132940996 // 53.8% of 300억
  const baseUpBudget = aiTotalBudget * 0.56 // Base-up 비율
  const meritBudget = aiTotalBudget * 0.44 // Merit 비율
  
  // 카드 2: 승급/승진 인상률 예산 (사용자 제공 값)
  const promotionTotal = 151924823 // 0.5% of 300억
  const promotionLv2 = promotionTotal * 0.15
  const promotionLv3 = promotionTotal * 0.29
  const promotionLv4 = promotionTotal * 0.56
  
  // 카드 3: 추가 인상 가능 범위 (사용자 제공 값)
  const adoptableIncrease = 4499898100 // 15.0% of 300억
  const additionalRange = adoptableIncrease * 33.9 // 추가 범위는 채택 가능의 약 33.9배
  
  // 카드 4: 간접비용 Impact (사용자 제공 값)
  const indirectTotal = 3699687978 // 12.3% of 300억
  const laborCost = indirectTotal * 0.253 // 인건비 비율
  const taxCost = indirectTotal * 0.635 // 세금 비율
  const otherCost = indirectTotal * 0.112 // 기타 비율
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">예산활용내역상세</h2>
      
      <div className="grid grid-cols-4 gap-3">
        {/* 카드 1: AI 적정 인상률 예산 */}
        <div className="bg-blue-50 rounded-lg p-3 relative">
          <div className="absolute -top-2 -left-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            ①
          </div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2 mt-2">
            AI 적정 인상률 예산
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Base-up</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(baseUpBudget, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">성과</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(meritBudget, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-blue-200">
              <span className="font-semibold text-gray-700">합계</span>
              <span className="font-bold text-blue-600 text-sm">
                {formatKoreanCurrency(aiTotalBudget, '억', 100000000)}
              </span>
            </div>
          </div>
        </div>
        
        {/* 카드 2: 승급/승진 인상률 예산 */}
        <div className="bg-green-50 rounded-lg p-3 relative">
          <div className="absolute -top-2 -left-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            ②
          </div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2 mt-2">
            승급/승진 인상 예산
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Lv.2</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(promotionLv2, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Lv.3</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(promotionLv3, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Lv.4</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(promotionLv4, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-green-200">
              <span className="font-semibold text-gray-700">합계</span>
              <span className="font-bold text-green-600 text-sm">
                {formatKoreanCurrency(promotionTotal, '억', 100000000)}
              </span>
            </div>
          </div>
        </div>
        
        {/* 카드 3: 추가 인상 가능 범위 */}
        <div className="bg-purple-50 rounded-lg p-3 relative">
          <div className="absolute -top-2 -left-2 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            ③
          </div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2 mt-2">
            추가 인상 가능 범위
          </h3>
          <div className="space-y-1">
            <div className="text-xs">
              <p className="text-gray-600">추가 범위</p>
              <p className="font-semibold text-gray-900 text-right">
                {formatKoreanCurrency(additionalRange, '억', 100000000)}
              </p>
            </div>
            <div className="pt-1 border-t border-purple-200">
              <p className="text-xs text-gray-600">채택 가능</p>
              <p className="font-bold text-purple-600 text-sm text-right">
                {formatKoreanCurrency(adoptableIncrease, '억', 100000000)}
              </p>
            </div>
          </div>
        </div>
        
        {/* 카드 4: 간접비용 Impact */}
        <div className="bg-orange-50 rounded-lg p-3 relative">
          <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            ④
          </div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2 mt-2">
            간접비용 Impact
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">인건비(4.5%)</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(laborCost, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">세금(11.3%)</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(taxCost, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">기타(2.0%)</span>
              <span className="font-semibold text-gray-900">
                {formatKoreanCurrency(otherCost, '억', 100000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-orange-200">
              <span className="font-semibold text-gray-700">합계</span>
              <span className="font-bold text-orange-600 text-sm">
                {formatKoreanCurrency(indirectTotal, '억', 100000000)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}