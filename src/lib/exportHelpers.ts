import { formatKoreanCurrency } from './utils'

export interface ExportData {
  // AI 제안 데이터
  aiRecommendation: {
    baseUpRate: number
    meritRate: number
    totalRate: number
    employeeCount: number
  }
  
  // 예산 현황
  budgetStatus: {
    totalBudget: number
    aiRecommendationBudget: number
    promotionBudget: number
    additionalBudget: number
    indirectCostBudget: number
    totalUsedBudget: number
    remainingBudget: number
    usagePercentage: number
  }
  
  // 직급별 상세 인상률
  levelDetails: Array<{
    level: string
    headcount: number
    averageSalary: number
    baseUp: number
    merit: number
    promotion: number
    advancement: number
    additional: number
    totalRate: number
    totalAmount: number
  }>
  
  // 동종업계 비교
  industryComparison: {
    ourCompany: number
    industryAverage: number
    competitiveness: Array<{
      level: string
      ourRate: number
      industryRate: number
      gap: number
    }>
  }
  
  // 시나리오 정보
  scenarioInfo: {
    name: string
    createdAt: string
    baseUpRate: number
    meritRate: number
    weightedAverageRate: number
  }
}

export function prepareExportData(
  state: any,
  budgetDetails: any,
  levelStatistics: any,
  detailedLevelRates: any,
  scenarioName?: string
): ExportData {
  const totalBudget = state.totalBudget || 30000000000
  const totalUsedBudget = budgetDetails.aiRecommendation + 
                         budgetDetails.promotion + 
                         budgetDetails.additional + 
                         budgetDetails.indirect
  
  return {
    aiRecommendation: {
      baseUpRate: state.baseUpRate,
      meritRate: state.meritRate,
      totalRate: state.baseUpRate + state.meritRate,
      employeeCount: 4925
    },
    
    budgetStatus: {
      totalBudget,
      aiRecommendationBudget: budgetDetails.aiRecommendation,
      promotionBudget: budgetDetails.promotion,
      additionalBudget: budgetDetails.additional,
      indirectCostBudget: budgetDetails.indirect,
      totalUsedBudget,
      remainingBudget: totalBudget - totalUsedBudget,
      usagePercentage: (totalUsedBudget / totalBudget) * 100
    },
    
    levelDetails: ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1'].map(level => {
      const rates = detailedLevelRates[level] || {}
      const stats = levelStatistics?.find((s: any) => s.level === level)
      const headcount = stats?.employeeCount || 0
      const avgSalary = parseFloat(stats?.averageSalary || '0')
      const totalRate = rates.baseUp + rates.merit + rates.additional
      
      return {
        level,
        headcount,
        averageSalary: avgSalary,
        baseUp: rates.baseUp || 0,
        merit: rates.merit || 0,
        promotion: rates.promotion || 0,
        advancement: rates.advancement || 0,
        additional: rates.additional || 0,
        totalRate,
        totalAmount: headcount * avgSalary * (totalRate / 100)
      }
    }),
    
    industryComparison: {
      ourCompany: state.weightedAverageRate || (state.baseUpRate + state.meritRate),
      industryAverage: 4.8, // 하드코딩된 업계 평균
      competitiveness: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].map(level => {
        const ourRate = state.levelTotalRates?.[level] || (state.baseUpRate + state.meritRate)
        const industryRate = level === 'Lv.1' ? 5.2 : 
                            level === 'Lv.2' ? 4.8 : 
                            level === 'Lv.3' ? 4.5 : 4.3
        return {
          level,
          ourRate,
          industryRate,
          gap: ourRate - industryRate
        }
      })
    },
    
    scenarioInfo: {
      name: scenarioName || '현재 설정',
      createdAt: new Date().toISOString(),
      baseUpRate: state.baseUpRate,
      meritRate: state.meritRate,
      weightedAverageRate: state.weightedAverageRate || (state.baseUpRate + state.meritRate)
    }
  }
}

export function formatExportDataForExcel(data: ExportData) {
  return {
    '요약': [{
      '항목': 'AI 제안 인상률',
      '값': `${data.aiRecommendation.totalRate.toFixed(1)}%`
    }, {
      '항목': 'Base-up',
      '값': `${data.aiRecommendation.baseUpRate.toFixed(1)}%`
    }, {
      '항목': '성과인상률',
      '값': `${data.aiRecommendation.meritRate.toFixed(1)}%`
    }, {
      '항목': '총 직원수',
      '값': `${data.aiRecommendation.employeeCount.toLocaleString('ko-KR')}명`
    }, {
      '항목': '총 예산',
      '값': formatKoreanCurrency(data.budgetStatus.totalBudget)
    }, {
      '항목': '사용 예산',
      '값': formatKoreanCurrency(data.budgetStatus.totalUsedBudget)
    }, {
      '항목': '잔여 예산',
      '값': formatKoreanCurrency(data.budgetStatus.remainingBudget)
    }, {
      '항목': '예산 활용률',
      '값': `${data.budgetStatus.usagePercentage.toFixed(1)}%`
    }],
    
    '예산상세': [{
      '구분': 'AI 적정 인상률 예산',
      '금액': formatKoreanCurrency(data.budgetStatus.aiRecommendationBudget),
      '비중': `${((data.budgetStatus.aiRecommendationBudget / data.budgetStatus.totalBudget) * 100).toFixed(1)}%`
    }, {
      '구분': '승급/승격 인상률 예산',
      '금액': formatKoreanCurrency(data.budgetStatus.promotionBudget),
      '비중': `${((data.budgetStatus.promotionBudget / data.budgetStatus.totalBudget) * 100).toFixed(1)}%`
    }, {
      '구분': '추가 인상 예산',
      '금액': formatKoreanCurrency(data.budgetStatus.additionalBudget),
      '비중': `${((data.budgetStatus.additionalBudget / data.budgetStatus.totalBudget) * 100).toFixed(1)}%`
    }, {
      '구분': '간접비용 Impact',
      '금액': formatKoreanCurrency(data.budgetStatus.indirectCostBudget),
      '비중': `${((data.budgetStatus.indirectCostBudget / data.budgetStatus.totalBudget) * 100).toFixed(1)}%`
    }, {
      '구분': '합계',
      '금액': formatKoreanCurrency(data.budgetStatus.totalUsedBudget),
      '비중': `${data.budgetStatus.usagePercentage.toFixed(1)}%`
    }],
    
    '직급별인상률': data.levelDetails.map(level => ({
      '직급': level.level,
      '인원': `${level.headcount.toLocaleString('ko-KR')}명`,
      '평균급여': formatKoreanCurrency(level.averageSalary),
      'Base-up(%)': level.baseUp.toFixed(2),
      '성과인상률(%)': level.merit.toFixed(2),
      '승급인상률(%)': level.promotion.toFixed(2),
      '승격인상률(%)': level.advancement.toFixed(2),
      '추가인상률(%)': level.additional.toFixed(2),
      '총인상률(%)': level.totalRate.toFixed(2),
      '총금액': formatKoreanCurrency(level.totalAmount)
    })),
    
    '동종업계비교': data.industryComparison.competitiveness.map(comp => ({
      '직급': comp.level,
      '우리회사(%)': comp.ourRate.toFixed(1),
      '동종업계(%)': comp.industryRate.toFixed(1),
      '격차(%)': comp.gap > 0 ? `+${comp.gap.toFixed(1)}` : comp.gap.toFixed(1),
      '경쟁력': comp.gap >= 0 ? '우위' : '열위'
    })),
    
    '시나리오정보': [{
      '항목': '시나리오명',
      '값': data.scenarioInfo.name
    }, {
      '항목': '생성일시',
      '값': new Date(data.scenarioInfo.createdAt).toLocaleString('ko-KR')
    }, {
      '항목': 'Base-up',
      '값': `${data.scenarioInfo.baseUpRate.toFixed(1)}%`
    }, {
      '항목': '성과인상률',
      '값': `${data.scenarioInfo.meritRate.toFixed(1)}%`
    }, {
      '항목': '가중평균 인상률',
      '값': `${data.scenarioInfo.weightedAverageRate.toFixed(1)}%`
    }]
  }
}