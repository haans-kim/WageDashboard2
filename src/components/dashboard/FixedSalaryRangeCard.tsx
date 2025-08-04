'use client'

import { formatKoreanCurrency } from '@/lib/utils'

interface FixedSalaryRangeCardProps {
  baseUpRate: number
  meritRate: number
  selectedAmount?: number
  onAmountSelect?: (amount: number) => void
}

export function FixedSalaryRangeCard({ baseUpRate, meritRate, selectedAmount = 100, onAmountSelect }: FixedSalaryRangeCardProps) {
  const totalRate = baseUpRate + meritRate
  
  // 정액 인상 권장 범위 계산 (연간, 만원 단위)
  // 기본값을 사용하고, 시뮬레이션 값에 따라 조정
  const baseAmount = 100 // 기본 100만원
  const adjustment = totalRate / 5.7 // 5.7%를 기준으로 비례 조정
  
  const minimum = Math.round(98 * adjustment)
  const average = Math.round(100 * adjustment)
  const maximum = Math.round(120 * adjustment)
  
  
  const utilizationRate = 13 // 예시 값
  
  // 선택 값 조정 (계산용으로 실제 금액 전달)
  const handleAmountSelect = (amount: number) => {
    onAmountSelect?.(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-bold">2</span>
        </div>
        <h3 className="text-lg font-semibold">
          정액 인상 권장 범위
          <span className="ml-2 text-sm text-gray-600">
            적정 인상률 적용 후 추가 인상 가능 재원 내 권장 범위 제안
          </span>
        </h3>
        <span className="ml-auto text-lg font-bold text-green-600">{utilizationRate}% 활용</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div 
          className={`rounded-lg p-4 text-center cursor-pointer transition-all ${
            selectedAmount === minimum 
              ? 'bg-green-100 border-2 border-green-500' 
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
          }`}
          onClick={() => handleAmountSelect(minimum)}
        >
          <p className="text-sm text-gray-700 font-medium mb-1">최소 권장 : <span className="text-green-600 font-semibold">안전 수준</span></p>
          <p className="text-3xl font-bold text-gray-900">{minimum}만 원/연</p>
        </div>
        <div 
          className={`rounded-lg p-4 text-center cursor-pointer transition-all ${
            selectedAmount === average 
              ? 'bg-green-100 border-2 border-green-500' 
              : 'bg-green-50 border-2 border-transparent hover:bg-green-100'
          }`}
          onClick={() => handleAmountSelect(average)}
        >
          <p className="text-sm text-gray-700 font-medium mb-1">현재 설정</p>
          <p className="text-3xl font-bold text-green-600">{average}만 원/연</p>
        </div>
        <div 
          className={`rounded-lg p-4 text-center cursor-pointer transition-all ${
            selectedAmount === maximum 
              ? 'bg-green-100 border-2 border-green-500' 
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
          }`}
          onClick={() => handleAmountSelect(maximum)}
        >
          <p className="text-sm text-gray-700 font-medium mb-1">최대 권장 : <span className="text-red-600 font-semibold">적극 수준</span></p>
          <p className="text-3xl font-bold text-gray-900">{maximum}만 원/연</p>
        </div>
      </div>
    </div>
  )
}