'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { formatKoreanCurrency } from '@/lib/utils'

// 엑셀 업로드를 위한 인터페이스 (추후 확장 가능)
interface EmployeeData {
  totalCount: number
  levels: {
    [level: string]: {
      headcount: number
      averageSalary: number
    }
  }
}

// 직급별 인상률 인터페이스
interface LevelRates {
  baseUp: number      // Base-up
  merit: number       // 성과 인상률 (수정가능)
  promotion: number   // 승급 인상률 (수정가능)
  advancement: number // 승격 인상률 (수정가능)
  additional: number  // 추가 인상률 (수정가능)
}

interface GradeSalaryAdjustmentTableProps {
  baseUpRate?: number         // AI 제안 Base-up (고정값)
  meritRate?: number          // AI 제안 성과인상률 기본값
  employeeData?: EmployeeData // 추후 엑셀에서 import된 데이터
  onRateChange?: (level: string, rates: LevelRates) => void
  onTotalBudgetChange?: (totalBudget: number) => void
  enableAdditionalIncrease?: boolean  // 추가 인상 활성화 여부
  onEnableAdditionalIncreaseChange?: (value: boolean) => void  // 추가 인상 활성화 콜백
  onAdditionalBudgetChange?: (additionalBudget: number) => void  // 추가 인상 총액 콜백
  onPromotionBudgetChange?: (levelBudgets: {[key: string]: number}) => void  // 승급/승격 예산 콜백
  onLevelTotalRatesChange?: (levelRates: {[key: string]: number}, weightedAverage: number) => void  // 직급별 총 인상률 및 가중평균 콜백
  onMeritWeightedAverageChange?: (weightedAverage: number) => void  // 성과인상률 가중평균 콜백
  initialRates?: { [key: string]: LevelRates }  // 초기 인상률 값
  onTotalSummaryChange?: (summary: { avgBaseUp: number; avgMerit: number; totalRate: number }) => void  // 전체 평균 콜백
}

// 빈 데이터 구조 (실제 데이터는 엑셀에서 동적으로 로드)
const EMPTY_EMPLOYEE_DATA: EmployeeData = {
  totalCount: 0,
  levels: {
    'Lv.4': { 
      headcount: 0, 
      averageSalary: 0
    },
    'Lv.3': { 
      headcount: 0, 
      averageSalary: 0
    },
    'Lv.2': { 
      headcount: 0, 
      averageSalary: 0
    },
    'Lv.1': { 
      headcount: 0, 
      averageSalary: 0
    }
  }
}

// 초기 인상률 값 - 모두 0으로 초기화
const DEFAULT_RATES: { [key: string]: LevelRates } = {
  'Lv.4': {
    baseUp: 0,
    merit: 0,
    promotion: 0,
    advancement: 0,
    additional: 0
  },
  'Lv.3': {
    baseUp: 0,
    merit: 0,
    promotion: 0,
    advancement: 0,
    additional: 0
  },
  'Lv.2': {
    baseUp: 0,
    merit: 0,
    promotion: 0,
    advancement: 0,
    additional: 0
  },
  'Lv.1': {
    baseUp: 0,
    merit: 0,
    promotion: 0,
    advancement: 0,
    additional: 0
  }
}

function GradeSalaryAdjustmentTableComponent({
  baseUpRate = 0,
  meritRate = 0,
  employeeData = EMPTY_EMPLOYEE_DATA,
  onRateChange,
  onTotalBudgetChange,
  enableAdditionalIncrease = false,
  onEnableAdditionalIncreaseChange,
  onAdditionalBudgetChange,
  onPromotionBudgetChange,
  onLevelTotalRatesChange,
  onMeritWeightedAverageChange,
  initialRates,
  onTotalSummaryChange
}: GradeSalaryAdjustmentTableProps) {
  
  // 직급별 인상률 상태 관리 - initialRates가 있으면 사용, 없으면 props 기반 기본값 사용
  const getInitialRates = () => {
    if (initialRates) return initialRates
    
    // props 값을 사용한 기본 설정
    const defaultRates = {
      'Lv.4': { baseUp: baseUpRate, merit: meritRate, promotion: 0, advancement: 0, additional: 0 },
      'Lv.3': { baseUp: baseUpRate, merit: meritRate, promotion: 0, advancement: 0, additional: 0 },
      'Lv.2': { baseUp: baseUpRate, merit: meritRate, promotion: 0, advancement: 0, additional: 0 },
      'Lv.1': { baseUp: baseUpRate, merit: meritRate, promotion: 0, advancement: 0, additional: 0 }
    }
    return defaultRates
  }
  
  const [rates, setRates] = useState<{ [key: string]: LevelRates }>(getInitialRates)
  const [additionalMode, setAdditionalMode] = useState<'percentage' | 'fixed'>('percentage')
  const [fixedAmount, setFixedAmount] = useState<number>(0) // 정액 금액 (만원 단위)
  
  // initialRates가 변경되면 rates 상태 업데이트 (시나리오 불러오기 시)
  useEffect(() => {
    if (initialRates) {
      setRates(initialRates)
    }
  }, [initialRates])
  
  // 추가 인상 활성화 상태가 변경되면 업데이트
  useEffect(() => {
    if (!enableAdditionalIncrease) {
      // 추가 인상이 비활성화되면 additional 값만 0으로 리셋
      setRates(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(level => {
          updated[level] = {
            ...updated[level],
            additional: 0
          }
        })
        return updated
      })
      setFixedAmount(0)
    }
  }, [enableAdditionalIncrease])
  
  // 정액 모드에서 금액 변경 시 각 직급별 %로 환산
  useEffect(() => {
    if (additionalMode === 'fixed' && fixedAmount > 0 && enableAdditionalIncrease) {
      setRates(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(level => {
          const data = employeeData.levels[level]
          if (data && data.averageSalary > 0) {
            // 정액을 평균급여로 나누어 %로 환산 (만원 단위로 입력받음)
            const percentage = (fixedAmount * 10000 / data.averageSalary) * 100
            updated[level] = {
              ...updated[level],
              additional: Math.round(percentage * 100) / 100 // 소수점 2자리까지
            }
          }
        })
        return updated
      })
    }
  }, [fixedAmount, additionalMode, employeeData, enableAdditionalIncrease])
  
  // 직급별 총계 계산 (① + ③만, 승급/승격은 제외)
  const calculateLevelTotal = (levelRates: LevelRates): number => {
    // Base-up + 성과 + 추가만 (승급/승격은 일부 대상자만 해당하므로 제외)
    return levelRates.baseUp + levelRates.merit + levelRates.additional
  }
  
  // 직급별 총 금액 계산
  const calculateLevelAmount = (level: string): number => {
    const data = employeeData.levels[level]
    if (!data) return 0
    
    const total = calculateLevelTotal(rates[level])
    return data.headcount * data.averageSalary * (total / 100)
  }
  
  // 전체 가중평균 계산
  const calculateWeightedAverage = (field: keyof LevelRates): number => {
    let weightedSum = 0
    let totalHeadcount = 0
    
    Object.entries(rates).forEach(([level, rate]) => {
      const data = employeeData.levels[level]
      if (data) {
        weightedSum += rate[field] * data.headcount
        totalHeadcount += data.headcount
      }
    })
    
    return totalHeadcount > 0 ? weightedSum / totalHeadcount : 0
  }
  
  // 전체 합계 계산
  const totalSummary = useMemo(() => {
    const avgBaseUp = calculateWeightedAverage('baseUp')
    const avgMerit = calculateWeightedAverage('merit')
    const avgPromotion = calculateWeightedAverage('promotion')
    const avgAdvancement = calculateWeightedAverage('advancement')
    const avgAdditional = calculateWeightedAverage('additional')
    
    const totalRate = avgBaseUp + avgMerit + avgAdditional // ① + ③
    
    let totalAmount = 0
    Object.keys(rates).forEach(level => {
      totalAmount += calculateLevelAmount(level)
    })
    
    return {
      avgBaseUp,
      avgMerit,
      avgPromotion,
      avgAdvancement,
      avgAdditional,
      totalRate,
      totalAmount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates])
  
  // 인상률 변경 핸들러
  const handleRateChange = (level: string, field: keyof LevelRates, value: string) => {
    const numValue = parseFloat(value) || 0
    
    setRates(prev => {
      const updated = {
        ...prev,
        [level]: {
          ...prev[level],
          [field]: numValue
        }
      }
      
      if (onRateChange) {
        onRateChange(level, updated[level])
      }
      
      return updated
    })
  }
  
  // 총 예산 변경 시 상위 컴포넌트에 알림
  useEffect(() => {
    if (onTotalBudgetChange) {
      onTotalBudgetChange(totalSummary.totalAmount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSummary.totalAmount])
  
  // 추가 인상 총액 계산 및 상위 컴포넌트에 알림
  useEffect(() => {
    if (onAdditionalBudgetChange) {
      let additionalTotal = 0
      Object.entries(rates).forEach(([level, rate]) => {
        const data = employeeData.levels[level]
        if (data) {
          additionalTotal += data.headcount * data.averageSalary * (rate.additional / 100)
        }
      })
      onAdditionalBudgetChange(additionalTotal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates])
  
  // 승급/승격 예산 계산 및 상위 컴포넌트에 알림
  useEffect(() => {
    if (onPromotionBudgetChange) {
      const promotionBudgets: {[key: string]: number} = {}
      Object.entries(rates).forEach(([level, rate]) => {
        const data = employeeData.levels[level]
        if (data) {
          // 승급 + 승격 예산 합계 (연간)
          const promotionBudget = data.headcount * data.averageSalary * ((rate.promotion + rate.advancement) / 100)
          promotionBudgets[level] = promotionBudget
        }
      })
      onPromotionBudgetChange(promotionBudgets)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates])
  
  // 직급별 총 인상률 및 가중평균 계산 및 상위 컴포넌트에 알림
  useEffect(() => {
    if (onLevelTotalRatesChange) {
      const levelTotalRates: {[key: string]: number} = {}
      let weightedSum = 0
      let totalHeadcount = 0
      
      Object.entries(rates).forEach(([level, rate]) => {
        const data = employeeData.levels[level]
        if (data) {
          const totalRate = rate.baseUp + rate.merit + rate.additional
          levelTotalRates[level] = totalRate
          weightedSum += totalRate * data.headcount
          totalHeadcount += data.headcount
        }
      })
      
      const weightedAverage = totalHeadcount > 0 ? weightedSum / totalHeadcount : 0
      onLevelTotalRatesChange(levelTotalRates, weightedAverage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates]) // employeeData를 의존성에서 제거
  
  // 성과인상률 가중평균 계산 및 상위 컴포넌트에 알림
  useEffect(() => {
    if (onMeritWeightedAverageChange) {
      let meritWeightedSum = 0
      let totalHeadcount = 0
      
      Object.entries(rates).forEach(([level, rate]) => {
        const data = employeeData.levels[level]
        if (data) {
          meritWeightedSum += rate.merit * data.headcount
          totalHeadcount += data.headcount
        }
      })
      
      const meritWeightedAverage = totalHeadcount > 0 ? meritWeightedSum / totalHeadcount : 0
      onMeritWeightedAverageChange(meritWeightedAverage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates])
  
  // 전체 요약 정보를 상위 컴포넌트에 알림
  useEffect(() => {
    if (onTotalSummaryChange) {
      onTotalSummaryChange({
        avgBaseUp: totalSummary.avgBaseUp,
        avgMerit: totalSummary.avgMerit,
        totalRate: totalSummary.totalRate
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSummary.avgBaseUp, totalSummary.avgMerit, totalSummary.totalRate])
  
  const levels = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1']
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">직급별 고정급 인상률 조정</h2>
        <div className="flex items-center gap-4">
          {/* 추가 인상 활성화 체크박스 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableAdditionalIncrease}
              onChange={(e) => onEnableAdditionalIncreaseChange?.(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">추가 인상 활성화</span>
          </label>
          
          {/* 추가 인상 모드 토글 */}
          {enableAdditionalIncrease && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdditionalMode('percentage')}
                className={`px-3 py-1 text-sm rounded-l-lg border ${
                  additionalMode === 'percentage'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                %
              </button>
              <button
                onClick={() => setAdditionalMode('fixed')}
                className={`px-3 py-1 text-sm rounded-r-lg border ${
                  additionalMode === 'fixed'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                정액
              </button>
            </div>
          )}
          
          {/* 정액 입력란 */}
          {enableAdditionalIncrease && additionalMode === 'fixed' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                placeholder="100"
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">만원 (전 인원 동일)</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full border-collapse md:min-w-[800px]">
          <thead>
            <tr className="bg-gray-50">
              <th rowSpan={2} className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm font-semibold">
                직급
              </th>
              <th colSpan={2} className="border border-gray-300 px-3 py-2 text-center bg-yellow-50 text-sm font-semibold">
                ① AI 적정 인상률 예산
              </th>
              <th colSpan={2} className="border border-gray-300 px-3 py-2 text-center bg-yellow-50 text-sm font-semibold">
                ② 승급/승격 인상
              </th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center bg-yellow-50 text-sm font-semibold">
                ③ 추가 인상
              </th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-center bg-blue-50 text-sm font-semibold">
                총계 (①+③)%
              </th>
              <th rowSpan={2} className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm font-semibold">
                총 금액
              </th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-center text-sm bg-yellow-50">
                Base-up
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center text-sm bg-yellow-50">
                성과 인상률
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center text-sm bg-yellow-50">
                승급 인상률
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center text-sm bg-yellow-50">
                승격 인상률
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 전체 합계 행 */}
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                <div className="text-base font-bold">전체</div>
                <span className="text-sm font-normal text-gray-600">
                  {employeeData.totalCount.toLocaleString()}명
                </span>
              </td>
              <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                <div className="text-sm text-gray-600">Base-up</div>
                <div className="text-base font-semibold text-blue-600">{totalSummary.avgBaseUp.toFixed(2)}%</div>
              </td>
              <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                <div className="text-sm text-gray-600">성과 인상률</div>
                <div className="text-base font-semibold text-blue-600">{totalSummary.avgMerit.toFixed(2)}%</div>
              </td>
              <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                <div className="text-sm text-gray-600">승급 인상률</div>
                <div className="text-base font-semibold text-orange-600">{totalSummary.avgPromotion.toFixed(2)}%</div>
              </td>
              <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                <div className="text-sm text-gray-600">승격 인상률</div>
                <div className="text-base font-semibold text-orange-600">{totalSummary.avgAdvancement.toFixed(2)}%</div>
              </td>
              <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                <div className="text-sm text-gray-600">추가 인상률</div>
                <div className="text-base font-semibold text-orange-600">{totalSummary.avgAdditional.toFixed(2)}%</div>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center bg-blue-50">
                <div className="text-lg font-bold text-blue-700">{totalSummary.totalRate.toFixed(2)}%</div>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                <div className="text-base font-semibold">{formatKoreanCurrency(Math.round(totalSummary.totalAmount))}</div>
              </td>
            </tr>
            
            {/* 각 직급별 행 */}
            {levels.map(level => {
              const levelData = employeeData.levels[level]
              const levelRates = rates[level]
              const levelTotal = calculateLevelTotal(levelRates)
              const levelAmount = calculateLevelAmount(level)
              
              return (
                <tr key={level}>
                  <td className="border border-gray-300 px-1 md:px-3 py-0.5 md:py-2 text-center text-xs md:text-sm">
                    <div className="text-base font-semibold">{level}</div>
                    <span className="text-sm text-gray-600">
                      {levelData.headcount.toLocaleString()}명
                    </span>
                  </td>
                  
                  {/* Base-up (고정) */}
                  <td className="border border-gray-300 px-2 py-2 text-center bg-yellow-50">
                    <div className="text-sm text-gray-600 mb-1">Base-up</div>
                    <div className="flex items-center justify-center">
                      <input
                        type="text"
                        value={`${levelRates.baseUp.toFixed(2)}%`}
                        disabled
                        className="w-20 px-2 py-1.5 text-center text-base bg-gray-100 border border-gray-300 rounded font-medium"
                      />
                    </div>
                  </td>
                  
                  {/* 성과 인상률 */}
                  <td className="border border-gray-300 px-2 py-2 text-center bg-yellow-50">
                    <div className="text-sm text-gray-600 mb-1">성과 인상률</div>
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        value={levelRates.merit}
                        onChange={(e) => handleRateChange(level, 'merit', e.target.value)}
                        step="0.01"
                        min="0"
                        max="10"
                        className="w-16 px-2 py-1.5 text-center text-base border border-gray-300 rounded font-medium"
                      />
                      <span className="ml-1 text-base">%</span>
                    </div>
                  </td>
                  
                  {/* 승급 인상률 */}
                  <td className="border border-gray-300 px-2 py-2 text-center bg-yellow-50">
                    <div className="text-sm text-gray-600 mb-1">승급 인상률</div>
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        value={levelRates.promotion}
                        onChange={(e) => handleRateChange(level, 'promotion', e.target.value)}
                        step="0.01"
                        min="0"
                        max="10"
                        className="w-16 px-2 py-1.5 text-center text-base border border-gray-300 rounded font-medium"
                      />
                      <span className="ml-1 text-base">%</span>
                    </div>
                  </td>
                  
                  {/* 승격 인상률 */}
                  <td className="border border-gray-300 px-2 py-2 text-center bg-yellow-50">
                    <div className="text-sm text-gray-600 mb-1">승격 인상률</div>
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        value={levelRates.advancement}
                        onChange={(e) => handleRateChange(level, 'advancement', e.target.value)}
                        step="0.01"
                        min="0"
                        max="10"
                        className="w-16 px-2 py-1.5 text-center text-base border border-gray-300 rounded font-medium"
                      />
                      <span className="ml-1 text-base">%</span>
                    </div>
                  </td>
                  
                  {/* 추가 인상률 */}
                  <td className="border border-gray-300 px-2 py-2 text-center bg-yellow-50">
                    <div className="text-sm text-gray-600 mb-1">
                      추가 인상률
                      {additionalMode === 'fixed' && enableAdditionalIncrease && (
                        <div className="text-xs text-purple-600">
                          ({fixedAmount}만원)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        value={levelRates.additional}
                        onChange={(e) => {
                          // 정액 모드일 때는 수정 불가
                          if (additionalMode === 'percentage') {
                            handleRateChange(level, 'additional', e.target.value)
                          }
                        }}
                        step="0.01"
                        min="0"
                        max="10"
                        disabled={!enableAdditionalIncrease || additionalMode === 'fixed'}
                        className={`w-16 px-2 py-1.5 text-center text-base border rounded font-medium ${
                          enableAdditionalIncrease && additionalMode === 'percentage'
                            ? 'border-gray-300 bg-white' 
                            : 'border-gray-200 bg-gray-100 text-gray-400'
                        }`}
                      />
                      <span className="ml-1 text-base">%</span>
                    </div>
                  </td>
                  
                  {/* 총계 */}
                  <td className="border border-gray-300 px-3 py-2 text-center bg-blue-50">
                    <div className="text-base font-bold text-blue-700">{levelTotal.toFixed(2)}%</div>
                  </td>
                  
                  {/* 총 금액 */}
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    <div className="text-base font-medium">{formatKoreanCurrency(Math.round(levelAmount))}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
    </div>
  )
}

export const GradeSalaryAdjustmentTable = React.memo(GradeSalaryAdjustmentTableComponent)