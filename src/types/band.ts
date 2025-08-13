// 직군 관련 타입 정의

// 직군명 열거형
export type BandName = 
  | '생산기술' 
  | 'Facility' 
  | '경영지원' 
  | '기획' 
  | '구매&물류' 
  | '영업' 
  | '생산' 
  | '품질보증'

// 직급 레벨 (기존과 동일)
export type LevelType = 'Lv.1' | 'Lv.2' | 'Lv.3' | 'Lv.4'

// 벤치마크 유형
export type BenchmarkType = 'SBL' | 'CA'

// 직군 정보
export interface Band {
  id: string
  name: BandName
  description?: string
  displayOrder: number
  bandLevels?: BandLevel[]
}

// 직군×직급별 데이터
export interface BandLevel {
  id: string
  bandId: string
  band?: Band
  level: LevelType
  headcount: number
  meanBasePay: number
  baseUpKRW: number
  baseUpRate: number
  sblIndex: number
  caIndex: number
  competitiveness: number
  fiscalYear: number
}

// 외부 벤치마크 데이터
export interface ExternalBenchmark {
  id: string
  bandId: string
  band?: Band
  level: LevelType
  extRefType: BenchmarkType
  extMeanBasePay: number
  fiscalYear: number
  source?: string
}

// Pay Band 시나리오
export interface PayBandScenario {
  scenarioId: string
  scenarioName: string
  currency: string
  rounding: number
  weightPerf: number
  weightBase: number
  budgetCap?: number
  avgIncreaseSBL?: number
  avgIncreaseCA?: number
  competitivenessTarget: BenchmarkType
  fiscalYear: number
  createdBy?: string
  note?: string
  createdAt?: string
  updatedAt?: string
  bands?: BandScenarioData[]
}

// 시나리오 내 직군 데이터
export interface BandScenarioData {
  band: BandName
  headcount: number
  totalBudgetImpact: number
  baseUpRateWeighted: number
  bandIndexSBL: number
  bandIndexCA: number
  levels: BandLevelScenarioData[]
}

// 시나리오 내 직군×직급 데이터
export interface BandLevelScenarioData {
  level: LevelType
  headcount: number
  meanBasePay: number
  baseUpKRW: number
  baseUpRate: number
  sblIndex: number
  caIndex: number
  competitiveness: number
  adjustedBaseUpRate?: number // 사용자 조정 값
}

// 직군 요약 정보
export interface BandSummary {
  band: BandName
  totalHeadcount: number
  totalBudget: number
  avgBaseUpRate: number
  avgSBLIndex: number
  avgCAIndex: number
  avgCompetitiveness: number
}

// Heatmap 데이터
export interface HeatmapData {
  band: BandName
  levels: {
    [key in LevelType]: {
      competitiveness: number
      headcount: number
      color: 'red' | 'neutral' | 'green'
    }
  }
}

// 슬라이더 조정 데이터
export interface SliderAdjustment {
  bandId: string
  level: LevelType
  baseUpRate: number
}

// 제약 조건
export interface Constraints {
  sliderMin: number // -5%
  sliderMax: number // +10%
  budgetCap?: number
  levelGapMin: number // 레벨 간 최소 격차 비율
}

// 계산 결과
export interface CalculationResult {
  totalImpact: number
  budgetUsage: number
  constraintViolations: ConstraintViolation[]
}

// 제약 위반
export interface ConstraintViolation {
  type: 'budget_exceeded' | 'level_gap_violation' | 'slider_range'
  message: string
  severity: 'warning' | 'error'
  details?: any
}