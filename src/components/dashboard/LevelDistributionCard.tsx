'use client'

import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'

interface LevelDistributionCardProps {
  data: Array<{
    level: string
    employeeCount: number
    averageSalary: string
    totalSalary: string
    avgBaseUpPercentage: number
    avgMeritPercentage: number
    totalIncreasePercentage: number
  }>
}

export function LevelDistributionCard({ data }: LevelDistributionCardProps) {
  const levelColors = {
    'Lv.1': 'bg-purple-100 text-purple-700',
    'Lv.2': 'bg-blue-100 text-blue-700',
    'Lv.3': 'bg-green-100 text-green-700',
    'Lv.4': 'bg-orange-100 text-orange-700',
  }

  const totalEmployees = data.reduce((sum, level) => sum + level.employeeCount, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">직급별 인상률 현황</h2>
      <div className="space-y-4">
        {data.map((level) => {
          const percentage = totalEmployees > 0 ? (level.employeeCount / totalEmployees) * 100 : 0
          const colorClass = levelColors[level.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-700'

          return (
            <div key={level.level} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                    {level.level}
                  </span>
                  <div>
                    <p className="font-semibold">{level.employeeCount}명</p>
                    <p className="text-xs text-gray-500">{formatPercentage(percentage)}의 직원</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">평균 급여</p>
                  <p className="font-semibold font-tabular">
                    {formatKoreanCurrency(Number(level.averageSalary), '만원')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">Base-up</p>
                  <p className="font-semibold">{formatPercentage(level.avgBaseUpPercentage)}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">Merit</p>
                  <p className="font-semibold">{formatPercentage(level.avgMeritPercentage)}</p>
                </div>
                <div className="text-center p-2 bg-primary-50 rounded">
                  <p className="text-gray-600">총 인상률</p>
                  <p className="font-semibold text-primary-600">
                    {formatPercentage(level.totalIncreasePercentage)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}