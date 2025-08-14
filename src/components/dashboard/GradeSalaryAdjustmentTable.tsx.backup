'use client'

import { formatKoreanCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface GradeSalaryAdjustmentTableProps {
  baseUpRate?: number
  meritRate?: number
  onRateChange?: (level: string, type: 'baseUp' | 'merit', value: number) => void
}

interface LevelData {
  level: string
  headcount: number
  aiOptimalBudget: number
  promotionBudget: number
  additionalBudget: number
  totalBudget: number
  totalAmount: number
}

export function GradeSalaryAdjustmentTable({
  baseUpRate = 3.2,
  meritRate = 2.5,
  onRateChange
}: GradeSalaryAdjustmentTableProps) {
  
  // 직급별 데이터 (Pay 현황.png 기반)
  const initialData: LevelData[] = [
    {
      level: '전체',
      headcount: 4167,
      aiOptimalBudget: 161.3,
      promotionBudget: 4.2,
      additionalBudget: 45.0,
      totalBudget: 206.3,
      totalAmount: 210.5
    },
    {
      level: 'Lv.4',
      headcount: 479,
      aiOptimalBudget: 26.2,
      promotionBudget: 2.3,
      additionalBudget: 7.3,
      totalBudget: 33.5,
      totalAmount: 35.8
    },
    {
      level: 'Lv.3',
      headcount: 1051,
      aiOptimalBudget: 46.0,
      promotionBudget: 1.2,
      additionalBudget: 12.8,
      totalBudget: 58.8,
      totalAmount: 60.0
    },
    {
      level: 'Lv.2',
      headcount: 1089,
      aiOptimalBudget: 36.7,
      promotionBudget: 0.6,
      additionalBudget: 10.2,
      totalBudget: 46.9,
      totalAmount: 47.5
    },
    {
      level: 'Lv.1',
      headcount: 1548,
      aiOptimalBudget: 40.2,
      promotionBudget: 0.0,
      additionalBudget: 11.2,
      totalBudget: 51.4,
      totalAmount: 51.4
    }
  ]
  
  const [levelData, setLevelData] = useState(initialData)
  const [levelRates, setLevelRates] = useState({
    'Lv.4': { baseUp: baseUpRate, merit: meritRate },
    'Lv.3': { baseUp: baseUpRate, merit: meritRate },
    'Lv.2': { baseUp: baseUpRate, merit: meritRate },
    'Lv.1': { baseUp: baseUpRate, merit: meritRate }
  })
  
  // 인상률 변경 시 예산 재계산
  useEffect(() => {
    const recalculateData = () => {
      const newData = [...initialData]
      
      // 각 레벨별로 재계산
      let totalAiBudget = 0
      let totalAdditionalBudget = 0
      
      for (let i = 1; i < newData.length; i++) {
        const level = newData[i].level
        const rate = levelRates[level as keyof typeof levelRates]
        if (rate) {
          // AI 예산 재계산 (기본 값에 비율 적용)
          const rateMultiplier = (rate.baseUp + rate.merit) / 5.7
          newData[i].aiOptimalBudget = Math.round(initialData[i].aiOptimalBudget * rateMultiplier * 10) / 10
          
          // 추가 예산도 비례적으로 조정
          newData[i].additionalBudget = Math.round(initialData[i].additionalBudget * rateMultiplier * 10) / 10
          
          // 총계 재계산
          newData[i].totalBudget = newData[i].aiOptimalBudget + newData[i].additionalBudget
          newData[i].totalAmount = newData[i].totalBudget + newData[i].promotionBudget
          
          totalAiBudget += newData[i].aiOptimalBudget
          totalAdditionalBudget += newData[i].additionalBudget
        }
      }
      
      // 전체 합계 업데이트
      newData[0].aiOptimalBudget = Math.round(totalAiBudget * 10) / 10
      newData[0].additionalBudget = Math.round(totalAdditionalBudget * 10) / 10
      newData[0].totalBudget = newData[0].aiOptimalBudget + newData[0].additionalBudget
      newData[0].totalAmount = newData[0].totalBudget + newData[0].promotionBudget
      
      setLevelData(newData)
    }
    
    recalculateData()
  }, [levelRates])
  
  const handleRateChange = (level: string, type: 'baseUp' | 'merit', value: number) => {
    setLevelRates(prev => ({
      ...prev,
      [level]: {
        ...prev[level as keyof typeof prev],
        [type]: value
      }
    }))
    
    if (onRateChange) {
      onRateChange(level, type, value)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">직급별 고정급 인상률 조정</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                직급
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                인원수
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                1. AI 적정<br/>인상률 예산
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                2. 승급/승격<br/>인상
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                3. 추가<br/>인상
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                총계<br/>(1+3)
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 bg-yellow-50">
                총 금액
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                인상률 조정
              </th>
            </tr>
          </thead>
          <tbody>
            {levelData.map((row, index) => (
              <tr key={row.level} className={index === 0 ? 'bg-gray-50 font-semibold' : ''}>
                <td className="border border-gray-200 px-4 py-3 text-sm">
                  {row.level}
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                  {row.headcount.toLocaleString()}명
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-right">
                  {row.aiOptimalBudget}억
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-right">
                  {row.promotionBudget}억
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-right">
                  {row.additionalBudget}억
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-right bg-blue-50 font-semibold">
                  {row.totalBudget}억
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-right bg-yellow-50 font-semibold">
                  {row.totalAmount}억
                </td>
                <td className="border border-gray-200 px-4 py-3">
                  {index > 0 && (
                    <div className="flex gap-2 justify-center">
                      <div className="text-xs">
                        <label className="text-gray-600">Base</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={levelRates[row.level as keyof typeof levelRates]?.baseUp || baseUpRate}
                          onChange={(e) => handleRateChange(row.level, 'baseUp', parseFloat(e.target.value))}
                          className="w-14 px-1 py-1 text-xs border rounded text-center"
                        />
                      </div>
                      <div className="text-xs">
                        <label className="text-gray-600">Merit</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={levelRates[row.level as keyof typeof levelRates]?.merit || meritRate}
                          onChange={(e) => handleRateChange(row.level, 'merit', parseFloat(e.target.value))}
                          className="w-14 px-1 py-1 text-xs border rounded text-center"
                        />
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        * 금액 단위: 억원 | 총계는 AI 적정 인상률 예산과 추가 인상의 합계
      </div>
    </div>
  )
}