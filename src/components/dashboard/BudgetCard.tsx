'use client'

import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'

interface BudgetCardProps {
  data: {
    totalBudget: string
    usedBudget: string
    remainingBudget: string
    usagePercentage: number
  } | null
}

export function BudgetCard({ data }: BudgetCardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">인상 재원 예산 현황</h2>
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const totalBudget = BigInt(data.totalBudget)
  const usedBudget = BigInt(data.usedBudget)
  const remainingBudget = BigInt(data.remainingBudget)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">인상 재원 예산 현황</h2>
      <div className="space-y-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">총 예산</span>
            <span className="text-2xl font-bold font-tabular">
              {formatKoreanCurrency(Number(totalBudget), '억원')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">사용 예산</span>
            <span className="font-semibold font-tabular">
              {formatKoreanCurrency(Number(usedBudget), '억원')}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">예산 사용률</span>
            <span className="text-sm font-semibold text-primary-600">
              {formatPercentage(data.usagePercentage)} 활용
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 rounded-full h-3 transition-all duration-300"
              style={{ width: `${data.usagePercentage}%` }}
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