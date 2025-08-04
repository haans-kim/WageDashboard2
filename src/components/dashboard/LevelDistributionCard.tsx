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
  baseUpRate?: number
  meritRate?: number
}

export function LevelDistributionCard({ data, baseUpRate, meritRate }: LevelDistributionCardProps) {
  const levelColors = {
    'Lv.1': 'bg-purple-100 text-purple-700',
    'Lv.2': 'bg-blue-100 text-blue-700',
    'Lv.3': 'bg-green-100 text-green-700',
    'Lv.4': 'bg-orange-100 text-orange-700',
  }

  const totalEmployees = data.reduce((sum, level) => sum + level.employeeCount, 0)
  const isSimulated = baseUpRate !== undefined || meritRate !== undefined

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isSimulated ? '시뮬레이션 직급별 인상률' : '직급별 인상률 현황'}
      </h2>
      <div className="space-y-4">
        {data.map((level) => {
          const percentage = totalEmployees > 0 ? (level.employeeCount / totalEmployees) * 100 : 0
          const colorClass = levelColors[level.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-700'
          
          // 시뮬레이션 값이 있으면 사용, 없으면 원래 값 사용
          const displayBaseUp = baseUpRate ?? level.avgBaseUpPercentage
          const displayMerit = meritRate ?? level.avgMeritPercentage
          const displayTotal = displayBaseUp + displayMerit

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
                  <p className="text-sm text-gray-700 font-medium">평균 급여</p>
                  <p className="font-bold font-tabular text-gray-900 text-lg">
                    {formatKoreanCurrency(Number(level.averageSalary), '만원')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-800 font-medium">Base-up</p>
                  <p className={`font-bold text-base ${isSimulated ? 'text-purple-600' : 'text-gray-900'}`}>
                    {formatPercentage(displayBaseUp)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-800 font-medium">Merit</p>
                  <p className={`font-bold text-base ${isSimulated ? 'text-pink-600' : 'text-gray-900'}`}>
                    {formatPercentage(displayMerit)}
                  </p>
                </div>
                <div className="text-center p-2 bg-primary-50 rounded">
                  <p className="text-gray-800 font-medium">총 인상률</p>
                  <p className={`font-bold text-base ${isSimulated ? 'text-purple-600' : 'text-primary-600'}`}>
                    {formatPercentage(displayTotal)}
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