'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PerformanceWeights {
  S: number
  A: number
  B: number
  C: number
}

interface WageContextType {
  // 대시보드에서 설정한 기본 인상률
  baseUpRate: number
  meritRate: number
  
  // 평가등급별 Merit 가중치
  performanceWeights: PerformanceWeights
  
  // 직급별 개별 인상률
  levelRates: {
    [level: string]: {
      baseUp: number
      merit: number
    }
  }
  
  // 직급별 상세 인상률 (promotion, advancement, additional 포함)
  detailedLevelRates: {
    [level: string]: {
      baseUp: number
      merit: number
      promotion: number
      advancement: number
      additional: number
    }
  }
  
  // 직군별 최종 인상률 (Pay Band에서 조정된 값)
  bandFinalRates: {
    [bandName: string]: {
      [level: string]: {
        baseUp: number
        merit: number
      }
    }
  }
  
  // 총 예산
  totalBudget: number
  
  // 설정 업데이트 함수들
  setBaseUpRate: (rate: number) => void
  setMeritRate: (rate: number) => void
  setPerformanceWeights: (weights: PerformanceWeights) => void
  setLevelRates: (rates: any) => void
  setDetailedLevelRates: (rates: any) => void
  setBandFinalRates: React.Dispatch<React.SetStateAction<{
    [bandName: string]: {
      [level: string]: {
        baseUp: number
        merit: number
      }
    }
  }>>
  setTotalBudget: (budget: number) => void
  
  // TO-BE 급여 계산 함수
  calculateToBeSalary: (
    currentSalary: number,
    level: string,
    performanceRating?: string,
    band?: string
  ) => number
}

const WageContext = createContext<WageContextType | undefined>(undefined)

export function WageProvider({ children }: { children: ReactNode }) {
  // 기본값 설정 - 모두 0으로 초기화
  const [baseUpRate, setBaseUpRate] = useState(0)
  const [meritRate, setMeritRate] = useState(0)
  const [performanceWeights, setPerformanceWeights] = useState<PerformanceWeights>({
    S: 1.5,
    A: 1.2,
    B: 1.0,
    C: 0.8
  })
  const [levelRates, setLevelRates] = useState({
    'Lv.1': { baseUp: 0, merit: 0 },
    'Lv.2': { baseUp: 0, merit: 0 },
    'Lv.3': { baseUp: 0, merit: 0 },
    'Lv.4': { baseUp: 0, merit: 0 }
  })
  const [detailedLevelRates, setDetailedLevelRates] = useState({
    'Lv.1': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 },
    'Lv.2': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 },
    'Lv.3': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 },
    'Lv.4': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 }
  })
  const [bandFinalRates, setBandFinalRates] = useState<{
    [bandName: string]: {
      [level: string]: {
        baseUp: number
        merit: number
      }
    }
  }>({})
  const [totalBudget, setTotalBudget] = useState(0)
  
  // localStorage에서 저장된 값 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('wageSettings')
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          setBaseUpRate(parsed.baseUpRate ?? 0)
          setMeritRate(parsed.meritRate ?? 0)
          setPerformanceWeights(parsed.performanceWeights ?? {
            S: 1.5, A: 1.2, B: 1.0, C: 0.8
          })
          setLevelRates(parsed.levelRates ?? {
            'Lv.1': { baseUp: 0, merit: 0 },
            'Lv.2': { baseUp: 0, merit: 0 },
            'Lv.3': { baseUp: 0, merit: 0 },
            'Lv.4': { baseUp: 0, merit: 0 }
          })
          setDetailedLevelRates(parsed.detailedLevelRates ?? {
            'Lv.1': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 },
            'Lv.2': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 },
            'Lv.3': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 },
            'Lv.4': { baseUp: 0, merit: 0, promotion: 0, advancement: 0, additional: 0 }
          })
          setBandFinalRates(parsed.bandFinalRates ?? {})
          setTotalBudget(parsed.totalBudget ?? 0)
        } catch (e) {
          console.error('Failed to parse saved wage settings:', e)
        }
      }
    }
  }, [])
  
  // 값이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        baseUpRate,
        meritRate,
        performanceWeights,
        levelRates,
        detailedLevelRates,
        bandFinalRates,
        totalBudget
      }
      localStorage.setItem('wageSettings', JSON.stringify(stateToSave))
    }
  }, [baseUpRate, meritRate, performanceWeights, levelRates, detailedLevelRates, bandFinalRates, totalBudget])
  
  // TO-BE 급여 계산 함수
  const calculateToBeSalary = (
    currentSalary: number,
    level: string,
    performanceRating?: string,
    band?: string
  ): number => {
    // 1. 우선순위: 직군별 최종 인상률 (Pay Band에서 조정된 값)
    let levelRate
    if (band && bandFinalRates[band] && bandFinalRates[band][level]) {
      levelRate = bandFinalRates[band][level]
    } else {
      // 2. 차선책: 대시보드 직급별 인상률
      levelRate = levelRates[level as keyof typeof levelRates] || { baseUp: baseUpRate, merit: meritRate }
    }
    
    let effectiveMeritRate = levelRate.merit
    
    // 평가등급별 가중치 적용
    if (performanceRating && performanceWeights[performanceRating as keyof PerformanceWeights]) {
      effectiveMeritRate = levelRate.merit * performanceWeights[performanceRating as keyof PerformanceWeights]
    }
    
    const totalRate = levelRate.baseUp + effectiveMeritRate
    return Math.round(currentSalary * (1 + totalRate / 100))
  }
  
  const value: WageContextType = {
    baseUpRate,
    meritRate,
    performanceWeights,
    levelRates,
    detailedLevelRates,
    bandFinalRates,
    totalBudget,
    setBaseUpRate,
    setMeritRate,
    setPerformanceWeights,
    setLevelRates,
    setDetailedLevelRates,
    setBandFinalRates,
    setTotalBudget,
    calculateToBeSalary
  }
  
  return <WageContext.Provider value={value}>{children}</WageContext.Provider>
}

export function useWageContext() {
  const context = useContext(WageContext)
  if (context === undefined) {
    throw new Error('useWageContext must be used within a WageProvider')
  }
  return context
}