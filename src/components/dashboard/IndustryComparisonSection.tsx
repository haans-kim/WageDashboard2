'use client'

import { formatPercentage } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'

interface IndustryComparisonSectionProps {
  baseUpRate?: number
  meritRate?: number
}

export function IndustryComparisonSection({
  baseUpRate = 3.2,
  meritRate = 2.5
}: IndustryComparisonSectionProps) {
  
  // C사 데이터
  const companyIncrease = baseUpRate + meritRate // 우리 회사
  const cCompanyIncrease = 4.2 // C사 평균 인상률
  
  // 동적 Y축 범위 계산
  const maxValue = Math.max(companyIncrease, cCompanyIncrease)
  const yAxisMax = Math.ceil(maxValue + 1) // 최대값보다 1 큰 정수로 설정
  const tickCount = yAxisMax + 1 // 0부터 yAxisMax까지의 눈금 개수
  
  // 직급별 경쟁력 데이터 (사용자 제공 데이터)
  const competitivenessData = [
    {
      level: 'Lv.1',
      cCompany: 56000, // C사 평균 (천원)
      ourCompany: 51977.513, // SBL (천원)
      competitiveness: 93, // 보상경쟁력%
      ourCompanyToBe: 51977.513 * (1 + companyIncrease / 100), // 인상 후 연봉
      competitivenessToBe: Math.round((51977.513 * (1 + companyIncrease / 100)) / 56000 * 100) // 인상 후 경쟁력
    },
    {
      level: 'Lv.2',
      cCompany: 70000,
      ourCompany: 67376.032,
      competitiveness: 96,
      ourCompanyToBe: 67376.032 * (1 + companyIncrease / 100),
      competitivenessToBe: Math.round((67376.032 * (1 + companyIncrease / 100)) / 70000 * 100)
    },
    {
      level: 'Lv.3',
      cCompany: 80000,
      ourCompany: 87599.520,
      competitiveness: 109,
      ourCompanyToBe: 87599.520 * (1 + companyIncrease / 100),
      competitivenessToBe: Math.round((87599.520 * (1 + companyIncrease / 100)) / 80000 * 100)
    },
    {
      level: 'Lv.4',
      cCompany: 100000,
      ourCompany: 108469.574,
      competitiveness: 108,
      ourCompanyToBe: 108469.574 * (1 + companyIncrease / 100),
      competitivenessToBe: Math.round((108469.574 * (1 + companyIncrease / 100)) / 100000 * 100)
    }
  ]
  
  // 인상률 비교 차트 데이터
  const increaseComparisonData = [
    {
      name: '우리 회사',
      value: companyIncrease,
      color: '#3B82F6'
    },
    {
      name: 'C사',
      value: cCompanyIncrease,
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
  
  // 경쟁력 트렌드 데이터 (꺾은선 그래프용)
  const trendData = [
    { year: '2023', ourCompany: 91.2, cCompany: 100 },
    { year: '2024', ourCompany: 92.8, cCompany: 100 },
    { year: '2025(예상)', ourCompany: 93.5 + (companyIncrease - 5.7), cCompany: 100 }
  ]
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">동종업계 대비 비교</h2>
      
      {/* 상단: 인상률 비교 요약 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">우리 회사</p>
          <p className="text-2xl font-bold text-blue-600">{formatPercentage(companyIncrease)}</p>
          <p className="text-xs text-gray-500">Base-up {formatPercentage(baseUpRate)} + Merit {formatPercentage(meritRate)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">C사 평균</p>
          <p className="text-2xl font-bold text-green-600">{formatPercentage(cCompanyIncrease)}</p>
          <p className="text-xs text-gray-500">동종업계 기준</p>
        </div>
      </div>
      
      {/* 3열 구조: 막대차트(좁음) | 테이블(넓음) | 꺾은선 그래프 */}
      <div className="grid grid-cols-7 gap-3">
        {/* 1열: 인상률 막대 차트 (2칸) */}
        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
          <h3 className="text-sm font-bold text-gray-800 mb-3">인상률 비교</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={increaseComparisonData} margin={{ top: 10, right: 2, left: 2, bottom: 5 }}>
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
                domain={[0, yAxisMax]}
                tickCount={tickCount}
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
                  formatter: (value: number) => `${value}%` 
                }}
              >
                {increaseComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 2열: 직급별 경쟁력 테이블 (3칸) */}
        <div className="bg-gray-50 rounded-lg p-3 col-span-3">
          <h3 className="text-sm font-bold text-gray-800 mb-3">직급별 보상경쟁력</h3>
          <div className="overflow-x-auto">
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
                {competitivenessData.map((row) => (
                  <tr key={row.level} className="border-b border-gray-300 hover:bg-white transition-colors">
                    <td className="py-2 px-1 font-semibold text-gray-700">{row.level}</td>
                    <td className="py-2 px-1 text-right font-medium text-gray-600">{(row.cCompany * 1000).toLocaleString('ko-KR')}원</td>
                    <td className="py-2 px-1 text-right font-medium text-gray-600">{(row.ourCompany * 1000).toLocaleString('ko-KR')}원</td>
                    <td className="py-2 px-1 text-right">
                      <span className={`font-bold text-sm px-1 py-0.5 rounded ${
                        row.competitiveness >= 100 ? 'text-blue-700 bg-blue-100' :
                        row.competitiveness >= 95 ? 'text-green-700 bg-green-100' :
                        row.competitiveness >= 90 ? 'text-yellow-700 bg-yellow-100' :
                        'text-red-700 bg-red-100'
                      }`}>
                        {row.competitiveness}%
                      </span>
                    </td>
                    <td className="py-2 px-1 text-right font-medium text-blue-600">{(row.ourCompanyToBe * 1000).toLocaleString('ko-KR')}원</td>
                    <td className="py-2 px-1 text-right">
                      <span className={`font-bold text-sm px-1 py-0.5 rounded ${
                        row.competitivenessToBe >= 100 ? 'text-blue-700 bg-blue-100' :
                        row.competitivenessToBe >= 95 ? 'text-green-700 bg-green-100' :
                        row.competitivenessToBe >= 90 ? 'text-yellow-700 bg-yellow-100' :
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
          <ResponsiveContainer width="100%" height={220}>
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