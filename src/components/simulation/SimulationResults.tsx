'use client'

import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'

interface SimulationResultsProps {
  results: {
    simulation: {
      baseUpPercentage: number
      meritIncreasePercentage: number
      totalPercentage: number
      employeeCount: number
      totalCurrentSalary: number
      totalSuggestedSalary: number
      totalIncreaseAmount: number
      averageIncreaseAmount: number
    }
    levelStatistics: Array<{
      level: string
      employeeCount: number
      currentTotal: number
      suggestedTotal: number
      increaseAmount: number
      averageIncrease: number
    }>
    departmentStatistics: Array<{
      department: string
      employeeCount: number
      currentTotal: number
      suggestedTotal: number
      increaseAmount: number
      averageIncrease: number
    }>
  }
}

export function SimulationResults({ results }: SimulationResultsProps) {
  const { simulation, levelStatistics, departmentStatistics } = results

  return (
    <div className="space-y-6">
      {/* 전체 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">시뮬레이션 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">적용 인원</p>
            <p className="text-2xl font-bold">{simulation.employeeCount.toLocaleString('ko-KR')}명</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">총 인상률</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPercentage(simulation.totalPercentage)}
            </p>
            <p className="text-xs text-gray-500">
              Base-up {formatPercentage(simulation.baseUpPercentage)} + Merit {formatPercentage(simulation.meritIncreasePercentage)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">총 인상액</p>
            <p className="text-2xl font-bold text-green-600">
              {formatKoreanCurrency(simulation.totalIncreaseAmount, '억원')}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">평균 인상액</p>
            <p className="text-2xl font-bold">
              {formatKoreanCurrency(simulation.averageIncreaseAmount, '만원')}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">현재 총 급여</p>
              <p className="text-xl font-semibold">{formatKoreanCurrency(simulation.totalCurrentSalary, '억원')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">→</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">예상 총 급여</p>
              <p className="text-xl font-semibold text-primary-600">
                {formatKoreanCurrency(simulation.totalSuggestedSalary, '억원')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 직급별 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">직급별 시뮬레이션 결과</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">직급</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">인원</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">현재 총액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">예상 총액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">인상액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">평균 인상액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {levelStatistics.map((stat) => (
                <tr key={stat.level}>
                  <td className="px-4 py-3 font-medium">{stat.level}</td>
                  <td className="px-4 py-3 text-right">{stat.employeeCount}명</td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatKoreanCurrency(stat.currentTotal, '억원')}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular font-semibold">
                    {formatKoreanCurrency(stat.suggestedTotal, '억원')}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular text-green-600">
                    +{formatKoreanCurrency(stat.increaseAmount, '만원')}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatKoreanCurrency(stat.averageIncrease, '만원')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 부서별 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">부서별 시뮬레이션 결과</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">인원</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">현재 총액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">예상 총액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">인상액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">평균 인상액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departmentStatistics.map((stat) => (
                <tr key={stat.department}>
                  <td className="px-4 py-3 font-medium">{stat.department}</td>
                  <td className="px-4 py-3 text-right">{stat.employeeCount}명</td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatKoreanCurrency(stat.currentTotal, '만원')}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular font-semibold">
                    {formatKoreanCurrency(stat.suggestedTotal, '만원')}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular text-green-600">
                    +{formatKoreanCurrency(stat.increaseAmount, '만원')}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatKoreanCurrency(stat.averageIncrease, '만원')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}