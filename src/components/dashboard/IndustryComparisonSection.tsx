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
  
  // C사 및 업계 데이터
  const companyIncrease = baseUpRate + meritRate // 우리 회사
  const cCompanyIncrease = 4.2 // C사 평균 인상률
  const industryAverage = 1.5 // 업계 평균
  
  // 직급별 경쟁력 데이터 (Pay 현황.png 기반)
  const competitivenessData = [
    {
      level: 'Lv.4',
      cCompany: 115200, // C사 평균 (천원)
      ourCompany: 108470, // SBL (천원)
      competitiveness: 94.2 // 보상경쟁력%
    },
    {
      level: 'Lv.3',
      cCompany: 93600,
      ourCompany: 87600,
      competitiveness: 93.6
    },
    {
      level: 'Lv.2',
      cCompany: 72300,
      ourCompany: 67376,
      competitiveness: 93.2
    },
    {
      level: 'Lv.1',
      cCompany: 56800,
      ourCompany: 51978,
      competitiveness: 91.5
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
    },
    {
      name: '업계 평균',
      value: industryAverage,
      color: '#6B7280'
    }
  ]
  
  // 경쟁력 차트 데이터
  const chartData = competitivenessData.map(item => ({
    level: item.level,
    'C사': item.cCompany / 1000, // 백만원 단위로 변환
    '우리회사': item.ourCompany / 1000,
    competitiveness: item.competitiveness
  }))
  
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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">우리 회사</p>
          <p className="text-xl font-bold text-blue-600">{formatPercentage(companyIncrease)}</p>
          <p className="text-[10px] text-gray-500">업계 +{formatPercentage(companyIncrease - industryAverage)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">C사 평균</p>
          <p className="text-xl font-bold text-green-600">{formatPercentage(cCompanyIncrease)}</p>
          <p className="text-[10px] text-gray-500">업계 +{formatPercentage(cCompanyIncrease - industryAverage)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">업계 평균</p>
          <p className="text-xl font-bold text-gray-600">{formatPercentage(industryAverage)}</p>
          <p className="text-[10px] text-gray-500">기준선</p>
        </div>
      </div>
      
      {/* 3열 구조: 막대차트 | 테이블 | 꺾은선 그래프 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 1열: 인상률 막대 차트 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">인상률 비교</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={increaseComparisonData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {increaseComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 2열: 직급별 경쟁력 테이블 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">직급별 보상경쟁력</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1 px-1 font-semibold">직급</th>
                  <th className="text-right py-1 px-1 font-semibold">C사</th>
                  <th className="text-right py-1 px-1 font-semibold">우리</th>
                  <th className="text-right py-1 px-1 font-semibold">경쟁력</th>
                </tr>
              </thead>
              <tbody>
                {competitivenessData.map((row) => (
                  <tr key={row.level} className="border-b border-gray-200">
                    <td className="py-1 px-1">{row.level}</td>
                    <td className="py-1 px-1 text-right">{(row.cCompany/1000).toFixed(1)}M</td>
                    <td className="py-1 px-1 text-right">{(row.ourCompany/1000).toFixed(1)}M</td>
                    <td className="py-1 px-1 text-right">
                      <span className={`font-semibold ${
                        row.competitiveness >= 95 ? 'text-green-600' :
                        row.competitiveness >= 90 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {row.competitiveness.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 pt-2 border-t border-gray-300">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">평균 경쟁력</span>
                <span className="font-bold text-blue-600">93.1%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3열: 경쟁력 트렌드 꺾은선 그래프 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">경쟁력 트렌드</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[85, 105]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Line 
                type="monotone" 
                dataKey="ourCompany" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="우리회사"
              />
              <Line 
                type="monotone" 
                dataKey="cCompany" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="C사 (100%)"
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}