'use client'

import { useState } from 'react'

interface FixedSalaryRangeCardProps {
  baseUpRate: number
  meritRate: number
  selectedAmount?: number
  onAmountSelect?: (amount: number) => void
  totalBudget?: number // 총 예산 (억원 단위)
  totalEmployees?: number // 총 직원수
  fixedSalaryRange?: {
    minimum: number
    average: number
    maximum: number
  }
  onRangeChange?: (range: { minimum: number; average: number; maximum: number }) => void
}

export function FixedSalaryRangeCard({ 
  selectedAmount = 100, 
  onAmountSelect, 
  totalBudget, 
  totalEmployees,
  fixedSalaryRange = { minimum: 165, average: 168, maximum: 202 },
  onRangeChange
}: FixedSalaryRangeCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const { minimum, average, maximum } = fixedSalaryRange
  
  // 정액 인상 예산 계산 (억원 단위)
  const fixedAmountBudget = totalEmployees && selectedAmount 
    ? Math.round((totalEmployees * selectedAmount * 10000) / 100000000)
    : 0
    
  // 활용률 계산 (정액 인상 예산 / 전체 예산)
  const utilizationRate = totalBudget && totalBudget > 0 && fixedAmountBudget > 0
    ? Math.round((fixedAmountBudget / totalBudget) * 100)
    : 0
  
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
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isEditing ? '완료' : '수정'}
        </button>
        <span className="text-lg font-bold text-green-600">{utilizationRate}% 활용</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div 
          className={`rounded-lg p-4 text-center transition-all ${
            selectedAmount === minimum 
              ? 'bg-green-100 border-2 border-green-500' 
              : 'bg-gray-50 border-2 border-transparent'
          } ${!isEditing ? 'cursor-pointer hover:bg-gray-100' : ''}`}
          onClick={() => !isEditing && handleAmountSelect(minimum)}
        >
          <p className="text-sm text-gray-700 font-medium mb-1">최소 권장 : <span className="text-green-600 font-semibold">안전 수준</span></p>
          {isEditing ? (
            <input
              type="number"
              value={minimum}
              onChange={(e) => {
                const newValue = Number(e.target.value)
                onRangeChange?.({
                  ...fixedSalaryRange,
                  minimum: newValue
                })
                if (selectedAmount === minimum) {
                  handleAmountSelect(newValue)
                }
              }}
              className="text-3xl font-bold text-center w-full border-2 border-gray-300 rounded px-2"
              aria-label="최소 권장 금액"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{minimum}만 원/연</p>
          )}
        </div>
        <div 
          className={`rounded-lg p-4 text-center transition-all ${
            selectedAmount === average 
              ? 'bg-green-100 border-2 border-green-500' 
              : 'bg-green-50 border-2 border-transparent'
          } ${!isEditing ? 'cursor-pointer hover:bg-green-100' : ''}`}
          onClick={() => !isEditing && handleAmountSelect(average)}
        >
          <p className="text-sm text-gray-700 font-medium mb-1">현재 설정</p>
          {isEditing ? (
            <input
              type="number"
              value={average}
              onChange={(e) => {
                const newValue = Number(e.target.value)
                onRangeChange?.({
                  ...fixedSalaryRange,
                  average: newValue
                })
                if (selectedAmount === average) {
                  handleAmountSelect(newValue)
                }
              }}
              className="text-3xl font-bold text-center w-full border-2 border-gray-300 rounded px-2 text-green-600"
              aria-label="현재 설정 금액"
            />
          ) : (
            <p className="text-3xl font-bold text-green-600">{average}만 원/연</p>
          )}
        </div>
        <div 
          className={`rounded-lg p-4 text-center transition-all ${
            selectedAmount === maximum 
              ? 'bg-green-100 border-2 border-green-500' 
              : 'bg-gray-50 border-2 border-transparent'
          } ${!isEditing ? 'cursor-pointer hover:bg-gray-100' : ''}`}
          onClick={() => !isEditing && handleAmountSelect(maximum)}
        >
          <p className="text-sm text-gray-700 font-medium mb-1">최대 권장 : <span className="text-red-600 font-semibold">적극 수준</span></p>
          {isEditing ? (
            <input
              type="number"
              value={maximum}
              onChange={(e) => {
                const newValue = Number(e.target.value)
                onRangeChange?.({
                  ...fixedSalaryRange,
                  maximum: newValue
                })
                if (selectedAmount === maximum) {
                  handleAmountSelect(newValue)
                }
              }}
              className="text-3xl font-bold text-center w-full border-2 border-gray-300 rounded px-2"
              aria-label="최대 권장 금액"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{maximum}만 원/연</p>
          )}
        </div>
      </div>
    </div>
  )
}