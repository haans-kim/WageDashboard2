'use client'

import React from 'react'
import { formatPercentage } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, ComposedChart, Scatter } from 'recharts'

interface IndustryComparisonSectionProps {
  baseUpRate?: number
  meritRate?: number
  levelTotalRates?: {[key: string]: number}  // 직급별 총 인상률
  weightedAverageRate?: number  // 가중평균 인상률
  levelStatistics?: Array<{  // 직급별 실제 데이터
    level: string
    employeeCount: number
    averageSalary: string
  }>
  competitorData?: Array<{  // 새로운 형식: 직군×직급별 C사 데이터
    company: string
    band: string
    level: string
    averageSalary: number
  }> | {  // 구 형식 (임시 지원)
    averageIncrease?: number
    levelSalaries?: {
      'Lv.1'?: number
      'Lv.2'?: number
      'Lv.3'?: number
      'Lv.4'?: number
    }
  } | null
}

function IndustryComparisonSectionComponent({
  baseUpRate = 0,
  meritRate = 0,
  levelTotalRates = {
    'Lv.1': 0,
    'Lv.2': 0,
    'Lv.3': 0,
    'Lv.4': 0
  },
  weightedAverageRate = 0,
  levelStatistics,
  competitorData
}: IndustryComparisonSectionProps) {
  
  // C사 데이터 (엑셀에서 가져온 데이터 사용)
  const companyIncrease = baseUpRate + meritRate // 우리 회사
  
  // C사 평균 인상률 계산 (새 구조에서는 직접 계산 필요)
  let cCompanyIncrease = 4.2 // 기본값
  if (Array.isArray(competitorData)) {
    // 새로운 구조에서는 인상률을 별도로 관리하지 않으므로 기본값 사용
    cCompanyIncrease = 4.2
  } else if (competitorData?.averageIncrease) {
    // 구 형식
    cCompanyIncrease = competitorData.averageIncrease
  }
  
  // 동적 Y축 범위 계산
  const maxValue = Math.max(companyIncrease, cCompanyIncrease)
  const yAxisMax = Math.ceil(maxValue + 1) // 최대값보다 1 큰 정수로 설정
  const tickCount = yAxisMax + 1 // 0부터 yAxisMax까지의 눈금 개수
  
  // 직급별 우리 회사 실제 평균 급여 가져오기
  const getOurCompanySalary = (level: string) => {
    const levelData = levelStatistics?.find(l => l.level === level)
    return levelData ? parseFloat(levelData.averageSalary) / 1000 : 0 // 천원 단위로 변환
  }
  
  // 직급별 C사 급여 (엑셀에서 가져온 데이터 사용)
  const getCCompanySalary = (level: string) => {
    // competitorData가 배열 형식인 경우 (새로운 구조)
    if (Array.isArray(competitorData)) {
      // 모든 직군의 해당 직급 평균 계산
      const levelSalaries = competitorData
        .filter(c => c.level === level)
        .map(c => c.averageSalary)
      
      if (levelSalaries.length > 0) {
        const avgSalary = levelSalaries.reduce((sum, sal) => sum + sal, 0) / levelSalaries.length
        return avgSalary / 1000 // 천원 단위로 변환
      }
    }
    // 구 형식 지원 (나중에 제거 예정)
    else if (competitorData?.levelSalaries) {
      return competitorData.levelSalaries[level as keyof typeof competitorData.levelSalaries] || 0
    }
    
    return 0
  }
  
  // 직급별 경쟁력 데이터 (실제 데이터 기반) - Lv.1이 맨 왼쪽
  const competitivenessData = [
    {
      level: 'Lv.1',
      cCompany: getCCompanySalary('Lv.1'), // C사 평균 (천원)
      ourCompany: getOurCompanySalary('Lv.1'), // 실제 평균 급여 (천원)
      competitiveness: Math.round((getOurCompanySalary('Lv.1') / getCCompanySalary('Lv.1')) * 100), // 보상경쟁력%
      ourCompanyToBe: getOurCompanySalary('Lv.1') * (1 + (levelTotalRates['Lv.1'] || companyIncrease) / 100), // 조정된 인상률로 계산
      competitivenessToBe: Math.round((getOurCompanySalary('Lv.1') * (1 + (levelTotalRates['Lv.1'] || companyIncrease) / 100)) / getCCompanySalary('Lv.1') * 100) // 인상 후 경쟁력
    },
    {
      level: 'Lv.2',
      cCompany: getCCompanySalary('Lv.2'),
      ourCompany: getOurCompanySalary('Lv.2'),
      competitiveness: Math.round((getOurCompanySalary('Lv.2') / getCCompanySalary('Lv.2')) * 100),
      ourCompanyToBe: getOurCompanySalary('Lv.2') * (1 + (levelTotalRates['Lv.2'] || companyIncrease) / 100),
      competitivenessToBe: Math.round((getOurCompanySalary('Lv.2') * (1 + (levelTotalRates['Lv.2'] || companyIncrease) / 100)) / getCCompanySalary('Lv.2') * 100)
    },
    {
      level: 'Lv.3',
      cCompany: getCCompanySalary('Lv.3'),
      ourCompany: getOurCompanySalary('Lv.3'),
      competitiveness: Math.round((getOurCompanySalary('Lv.3') / getCCompanySalary('Lv.3')) * 100),
      ourCompanyToBe: getOurCompanySalary('Lv.3') * (1 + (levelTotalRates['Lv.3'] || companyIncrease) / 100),
      competitivenessToBe: Math.round((getOurCompanySalary('Lv.3') * (1 + (levelTotalRates['Lv.3'] || companyIncrease) / 100)) / getCCompanySalary('Lv.3') * 100)
    },
    {
      level: 'Lv.4',
      cCompany: getCCompanySalary('Lv.4'),
      ourCompany: getOurCompanySalary('Lv.4'),
      competitiveness: Math.round((getOurCompanySalary('Lv.4') / getCCompanySalary('Lv.4')) * 100),
      ourCompanyToBe: getOurCompanySalary('Lv.4') * (1 + (levelTotalRates['Lv.4'] || companyIncrease) / 100),
      competitivenessToBe: Math.round((getOurCompanySalary('Lv.4') * (1 + (levelTotalRates['Lv.4'] || companyIncrease) / 100)) / getCCompanySalary('Lv.4') * 100)
    }
  ]
  
  // 인상률 비교 차트 데이터 (조정 인상률 마커용 데이터 추가)
  const increaseComparisonData = [
    {
      name: '우리 회사',
      value: companyIncrease,
      adjustedValue: weightedAverageRate,
      color: '#3B82F6'
    },
    {
      name: 'C사',
      value: cCompanyIncrease,
      adjustedValue: null,
      color: '#10B981'
    }
  ]
  
  // 경쟁력 차트 데이터
  const chartData = competitivenessData.map(item => ({
    level: item.level,
    'C사': item.cCompany / 1000, // 백만원 단위로 변환
    '우리회사(현재)': item.ourCompany / 1000,
    '우리회사(인상후)': item.ourCompanyToBe / 1000,
    competitiveness: item.competitiveness,
    competitivenessToBe: item.competitivenessToBe
  }))
  
  // 차트 Y축 범위 동적 계산
  const allChartValues = chartData.flatMap(item => [
    item['C사'], 
    item['우리회사(현재)'], 
    item['우리회사(인상후)']
  ])
  const chartMinValue = Math.min(...allChartValues)
  const chartMaxValue = Math.max(...allChartValues)
  const chartPadding = (chartMaxValue - chartMinValue) * 0.1 // 10% 여백
  const chartYMin = Math.max(0, Math.floor(chartMinValue - chartPadding))
  const chartYMax = Math.ceil(chartMaxValue + chartPadding)
  
  // 디버그용 로그
  console.log('Debug - 인상률:', companyIncrease)
  console.log('Debug - 샘플 계산:')
  competitivenessData.forEach(row => {
    console.log(`${row.level}: 현재 ${row.ourCompany}천원 → 인상후 ${row.ourCompanyToBe}천원 (실제표시: ${Math.round(row.ourCompanyToBe * 1000).toLocaleString()}원)`)
  })
  
  // 경쟁력 트렌드 데이터 (꺾은선 그래프용)
  const trendData = [
    { year: '2023', ourCompany: 91.2, cCompany: 100 },
    { year: '2024', ourCompany: 92.8, cCompany: 100 },
    { year: '2025(예상)', ourCompany: 93.5 + (companyIncrease - 5.7), cCompany: 100 }
  ]
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-3">동종업계 대비 비교</h2>
      
      {/* 상단: 인상률 비교 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-base text-gray-700 font-medium">우리 회사(AI제안)</p>
          <p className="text-3xl font-bold text-blue-600">{formatPercentage(companyIncrease)}</p>
          <p className="text-sm text-gray-600">Base-up {formatPercentage(baseUpRate)} + Merit {formatPercentage(meritRate)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-base text-gray-700 font-medium">우리 회사(조정)</p>
          <p className="text-3xl font-bold text-purple-600">{formatPercentage(weightedAverageRate)}</p>
          <p className="text-sm text-gray-600">직급별 가중평균</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-base text-gray-700 font-medium">C사 평균</p>
          <p className="text-3xl font-bold text-green-600">{formatPercentage(cCompanyIncrease)}</p>
          <p className="text-sm text-gray-600">동종업계 기준</p>
        </div>
      </div>
      
      {/* 3열 구조: 막대차트(좁음) | 테이블(넓음) | 꺾은선 그래프 */}
      <div className="grid grid-cols-7 gap-3">
        {/* 1열: 인상률 막대 차트 (2칸) */}
        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
          <h3 className="text-base font-bold text-gray-800 mb-3">인상률 비교</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={increaseComparisonData} margin={{ top: 20, right: 2, left: 2, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
              />
              <YAxis 
                tick={{ fontSize: 11, fontWeight: 'bold' }} 
                tickFormatter={(value) => `${value}%`}
                axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                domain={[0, Math.max(yAxisMax, Math.ceil(weightedAverageRate + 1))]}
                tickCount={Math.max(yAxisMax, Math.ceil(weightedAverageRate + 1)) + 1}
                width={30}
                type="number"
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '인상률']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]} 
                label={{ 
                  position: 'top', 
                  fontSize: 12, 
                  fontWeight: 'bold',
                  formatter: (value: any) => `${value}%` 
                }}
              >
                {increaseComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              {/* 조정된 인상률 마커 표시 */}
              <Scatter 
                dataKey="adjustedValue" 
                fill="#9333EA"
                shape={(props: any) => {
                  const { cx, cy, payload } = props
                  if (payload.adjustedValue === null) return <g />
                  return (
                    <g>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={8} 
                        fill="#9333EA"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <text 
                        x={cx} 
                        y={cy - 16} 
                        fill="#9333EA" 
                        fontSize={11} 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        조정: {payload.adjustedValue.toFixed(1)}%
                      </text>
                    </g>
                  )
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* 2열: 직급별 경쟁력 테이블 (3칸) */}
        <div className="bg-gray-50 rounded-lg p-3 col-span-3 flex flex-col" style={{height: '320px'}}>
          <h3 className="text-sm font-bold text-gray-800 mb-3">직급별 보상경쟁력</h3>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-400">
                    <th className="text-left py-2 px-1 font-bold text-gray-800">직급</th>
                    <th className="text-right py-2 px-1 font-bold text-gray-800">C사</th>
                    <th className="text-right py-2 px-1 font-bold text-gray-800">현재</th>
                    <th className="text-right py-2 px-1 font-bold text-gray-800">경쟁력</th>
                    <th className="text-right py-2 px-1 font-bold text-blue-700">인상후</th>
                    <th className="text-right py-2 px-1 font-bold text-blue-700">경쟁력</th>
                  </tr>
                </thead>
                <tbody>
                  {[...competitivenessData].reverse().map((row) => (
                    <tr key={row.level} className="border-b border-gray-300 hover:bg-white transition-colors">
                      <td className="py-3 px-1 font-semibold text-gray-700">{row.level}</td>
                      <td className="py-3 px-1 text-right font-medium text-gray-600">{(row.cCompany * 1000).toLocaleString('ko-KR')}원</td>
                      <td className="py-3 px-1 text-right font-medium text-gray-600">{(row.ourCompany * 1000).toLocaleString('ko-KR')}원</td>
                      <td className="py-3 px-1 text-right">
                        <span className={`font-bold text-sm px-1 py-0.5 rounded ${
                          row.competitiveness > 105 ? 'text-green-700 bg-green-100' :
                          row.competitiveness >= 95 ? 'text-gray-700 bg-gray-100' :
                          'text-red-700 bg-red-100'
                        }`}>
                          {row.competitiveness}%
                        </span>
                      </td>
                      <td className="py-3 px-1 text-right font-medium text-blue-600">{Math.round(row.ourCompanyToBe * 1000).toLocaleString('ko-KR')}원</td>
                      <td className="py-3 px-1 text-right">
                        <span className={`font-bold text-sm px-1 py-0.5 rounded ${
                          row.competitivenessToBe > 105 ? 'text-green-700 bg-green-100' :
                          row.competitivenessToBe >= 95 ? 'text-gray-700 bg-gray-100' :
                          'text-red-700 bg-red-100'
                        }`}>
                          {row.competitivenessToBe}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 경쟁력 색상 기준 범례 - 하단 고정 */}
            <div className="mt-3 pt-2 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between gap-2 text-[10px] px-1">
                <span className="text-gray-600 font-semibold">💡 경쟁력 기준:</span>
                
                <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-100 flex-1 justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
                  <span className="font-bold text-red-700">95% 미만 (부족)</span>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 flex-1 justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
                  <span className="font-bold text-gray-700">95~105% (적정)</span>
                </div>
                
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100 flex-1 justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                  <span className="font-bold text-green-700">105% 초과 (우위)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3열: 직급별 보상 비교 꺾은선 그래프 (2칸) */}
        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800">직급별 보상 비교</h3>
            <div className="flex gap-3 text-xs font-bold">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-green-600 rounded"></div>
                <span className="text-green-700">C사</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-gray-500 rounded"></div>
                <span className="text-gray-700">현재</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-blue-600 rounded"></div>
                <span className="text-blue-700">인상후</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 2, left: 2, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis 
                dataKey="level" 
                tick={{ fontSize: 11, fontWeight: 'bold' }} 
                padding={{ left: 25, right: 25 }}
                axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
              />
              <YAxis 
                hide={true}
                domain={[chartYMin, chartYMax]} 
                type="number"
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value.toFixed(1)}백만원`, name]} 
                labelFormatter={(label) => `직급: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="C사" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                name="C사"
                activeDot={{ r: 6, fill: '#059669' }}
              />
              <Line 
                type="monotone" 
                dataKey="우리회사(현재)" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#6b7280', strokeWidth: 2, stroke: '#ffffff' }}
                name="우리회사(현재)"
                activeDot={{ r: 5, fill: '#6b7280' }}
              />
              <Line 
                type="monotone" 
                dataKey="우리회사(인상후)" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                name="우리회사(인상후)"
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export const IndustryComparisonSection = React.memo(IndustryComparisonSectionComponent)