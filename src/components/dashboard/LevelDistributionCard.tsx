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
  levelRates?: Record<string, { baseUp: number; merit: number }>
  updateLevelRate?: (level: string, type: 'baseUp' | 'merit', value: number) => void
}

export function LevelDistributionCard({ data, baseUpRate, meritRate, levelRates, updateLevelRate }: LevelDistributionCardProps) {
  const levelColors = {
    'Lv.1': 'bg-purple-100 text-purple-700',
    'Lv.2': 'bg-blue-100 text-blue-700',
    'Lv.3': 'bg-green-100 text-green-700',
    'Lv.4': 'bg-orange-100 text-orange-700',
  }

  const totalEmployees = data.reduce((sum, level) => sum + level.employeeCount, 0)
  const isSimulated = baseUpRate !== undefined || meritRate !== undefined
  const hasIndividualControl = levelRates !== undefined && updateLevelRate !== undefined

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isSimulated ? '시뮬레이션 직급별 인상률' : '직급별 인상률 현황'}
      </h2>
      <div className="space-y-4">
        {data.map((level) => {
          const percentage = totalEmployees > 0 ? Math.round((level.employeeCount / totalEmployees) * 100 * 10) / 10 : 0
          const colorClass = levelColors[level.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-700'
          
          // 개별 레벨 값이 있으면 사용, 없으면 전체 값, 그것도 없으면 원래 값 사용
          const levelRate = levelRates?.[level.level]
          const displayBaseUp = levelRate?.baseUp ?? baseUpRate ?? level.avgBaseUpPercentage
          const displayMerit = levelRate?.merit ?? meritRate ?? level.avgMeritPercentage
          const displayTotal = displayBaseUp + displayMerit

          return (
            <div key={level.level} className="border rounded-lg px-2 py-1.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${colorClass}`}>
                    {level.level}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{level.employeeCount}명</p>
                    <p className="text-xs text-gray-500">{formatPercentage(percentage)}의 직원</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-700 font-medium">평균 급여</p>
                  <p className="font-bold font-tabular text-gray-900 text-sm">
                    {formatKoreanCurrency(Number(level.averageSalary), '만원')}
                  </p>
                </div>
              </div>

              {hasIndividualControl ? (
                <div>
                  <div className="text-center -mt-2 pb-2">
                    <p className="text-xs font-medium text-gray-700">총 인상률</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPercentage(displayTotal)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-gray-700">Base-up</p>
                        <p className="text-xs font-bold text-gray-900">{formatPercentage(displayBaseUp)}</p>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={displayBaseUp}
                        onChange={(e) => updateLevelRate(level.level, 'baseUp', parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-small slider-baseup"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0%</span>
                        <span>10%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-gray-700">성과 인상률</p>
                        <p className="text-xs font-bold text-gray-900">{formatPercentage(displayMerit)}</p>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={displayMerit}
                        onChange={(e) => updateLevelRate(level.level, 'merit', parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-small slider-merit"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0%</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-800 font-medium">Base-up</p>
                    <p className={`font-bold text-base ${isSimulated ? 'text-gray-900' : 'text-gray-900'}`}>
                      {formatPercentage(displayBaseUp)}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-800 font-medium">성과 인상률</p>
                    <p className={`font-bold text-base ${isSimulated ? 'text-gray-900' : 'text-gray-900'}`}>
                      {formatPercentage(displayMerit)}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-primary-50 rounded">
                    <p className="text-gray-800 font-medium">총 인상률</p>
                    <p className={`font-bold text-base ${isSimulated ? 'text-gray-900' : 'text-primary-600'}`}>
                      {formatPercentage(displayTotal)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}