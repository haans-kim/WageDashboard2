'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWageContext } from '@/context/WageContext'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { SalaryDistributionChart } from '@/components/analytics/SalaryDistributionChart'
import { ProjectionChart } from '@/components/analytics/ProjectionChart'
import { DepartmentComparisonChart } from '@/components/analytics/DepartmentComparisonChart'
import { TenureAnalysisChart } from '@/components/analytics/TenureAnalysisChart'
import { PerformanceDistributionChart } from '@/components/analytics/PerformanceDistributionChart'
import { PerformanceSalaryChart } from '@/components/analytics/PerformanceSalaryChart'
import { LevelPerformanceHeatmap } from '@/components/analytics/LevelPerformanceHeatmap'
import { BudgetBarChart } from '@/components/charts/BudgetBarChart'
import { IncreaseTrendChart } from '@/components/charts/IncreaseTrendChart'
import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'
import { SimpleExportButton } from '@/components/ExportButton'
import { RateInfoCard } from '@/components/common/RateInfoCard'

export default function AnalyticsPage() {
  const router = useRouter()
  const { baseUpRate, meritRate, performanceWeights, levelRates } = useWageContext()
  const { data, loading, error } = useAnalyticsData()

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow h-96"></div>
              <div className="bg-white rounded-lg shadow h-96"></div>
              <div className="bg-white rounded-lg shadow h-96"></div>
              <div className="bg-white rounded-lg shadow h-96"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-200">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">분석 데이터를 불러올 수 없습니다.</p>
        </div>
      </main>
    )
  }

  // 성과 등급별 평균 급여 계산
  const performanceByRating = data.performanceAnalysis.reduce((acc: any, item: any) => {
    if (!acc[item.performanceRating]) {
      acc[item.performanceRating] = { total: 0, count: 0 }
    }
    acc[item.performanceRating].total += item.averageSalary * item.count
    acc[item.performanceRating].count += item.count
    return acc
  }, {})

  const performanceSummary = Object.entries(performanceByRating).map(([rating, data]: any) => ({
    rating,
    averageSalary: data.count > 0 ? Math.round(data.total / data.count) : 0,
    count: data.count,
  })).filter(item => !isNaN(item.averageSalary) && isFinite(item.averageSalary))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 아래에 버튼 영역 추가 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-12 gap-2">
            <SimpleExportButton isNavigation={true} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <RateInfoCard />
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">예산 활용률</h3>
            <p className="text-3xl font-bold text-primary-600">
              {formatPercentage(data.budgetUtilization.utilizationRate)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {formatKoreanCurrency(Number(data.budgetUtilization.usedBudget), '억원')} / 
              {formatKoreanCurrency(Number(data.budgetUtilization.totalBudget), '억원')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">평균 급여 (전체)</h3>
            <p className="text-3xl font-bold">
              {formatKoreanCurrency(
                data.departmentAnalysis.reduce((sum: number, dept: any) => 
                  sum + dept.averageSalary * dept.employeeCount, 0
                ) / data.departmentAnalysis.reduce((sum: number, dept: any) => 
                  sum + dept.employeeCount, 0
                ),
                '만원'
              )}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">급여 격차 (최대-최소)</h3>
            <p className="text-3xl font-bold">
              {formatKoreanCurrency(
                Math.max(...data.departmentAnalysis.map((d: any) => d.maxSalary)) -
                Math.min(...data.departmentAnalysis.map((d: any) => d.minSalary)),
                '만원'
              )}
            </p>
          </div>
        </div>

        {/* 직급별 분석 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BudgetBarChart 
            data={data.levelStatistics || []} 
          />
          <IncreaseTrendChart 
            data={data.levelStatistics || []} 
          />
        </div>

        {/* 평가등급 분석 섹션 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">평가등급 분석</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {data.performanceDistribution && (
            <PerformanceDistributionChart 
              data={data.performanceDistribution.map((item: any) => {
                const total = data.performanceDistribution.reduce((sum: number, p: any) => sum + p.count, 0)
                return {
                  rating: item.rating,
                  count: item.count,
                  percentage: total > 0 ? (item.count / total) * 100 : 0
                }
              })}
            />
          )}
          {data.performanceSalary && (
            <PerformanceSalaryChart 
              data={data.performanceSalary}
            />
          )}
        </div>
        
        {/* 직급×평가등급 히트맵 */}
        {data.levelPerformance && (
          <div className="mb-8">
            <LevelPerformanceHeatmap 
              data={data.levelPerformance}
            />
          </div>
        )}

        {/* 기존 차트 그리드 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">급여 및 부서 분석</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalaryDistributionChart data={data.salaryDistribution} />
          <DepartmentComparisonChart data={data.departmentAnalysis} />
          <ProjectionChart data={data.projections} />
          <TenureAnalysisChart data={data.tenureStats} />
        </div>
      </div>
    </main>
  )
}