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
}

export function BudgetCard({ data, baseUpRate, meritRate, totalEmployees, averageSalary }: BudgetCardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">인상 재원 예산 현황</h2>
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const totalBudget = BigInt(data.totalBudget)
  let usedBudget = BigInt(data.usedBudget)
  let usagePercentage = data.usagePercentage
  
  // 시뮬레이션 값이 있을 경우 재계산
  if (baseUpRate !== undefined && meritRate !== undefined && totalEmployees && averageSalary) {
    const totalRate = (baseUpRate + meritRate) / 100
    const estimatedUsedBudget = Math.round(totalEmployees * averageSalary * totalRate * 12)
    usedBudget = BigInt(estimatedUsedBudget)
    usagePercentage = Number(totalBudget) > 0 ? (estimatedUsedBudget / Number(totalBudget)) * 100 : 0
  }
  
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
            <span className="text-2xl font-bold font-tabular text-gray-900">
              {formatKoreanCurrency(Number(totalBudget), '억원')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{isSimulated ? '시뮬레이션 사용 예산' : '사용 예산'}</span>
            <span className={`font-semibold font-tabular text-lg ${isSimulated ? 'text-purple-600' : 'text-gray-900'}`}>
              {formatKoreanCurrency(Number(usedBudget), '억원')}
            </span>
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