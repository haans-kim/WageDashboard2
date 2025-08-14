import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDashboardSummary } from '@/services/employeeDataService'

export async function GET() {
  try {
    // 현재 회계연도
    const currentYear = new Date().getFullYear()

    // employeeDataService에서 데이터 가져오기
    const dashboardSummary = await getDashboardSummary()

    // AI 추천 설정 가져오기 (employeeDataService에서 가져온 값 사용)
    const aiRecommendation = dashboardSummary.aiRecommendation

    // 예산 정보 가져오기 (employeeDataService에서 계산된 값 사용)
    const budget = dashboardSummary.budget

    // 전체 직원 수 및 직급별 통계
    const levelStats = dashboardSummary.levelStatistics
    const totalEmployees = dashboardSummary.summary.totalEmployees

    // 부서별 직원 분포
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      _count: {
        id: true,
      },
    })

    // 성과 등급별 분포
    const performanceStats = await prisma.employee.groupBy({
      by: ['performanceRating'],
      _count: {
        id: true,
      },
      where: {
        performanceRating: {
          not: null,
        },
      },
    })

    // 응답 데이터 구성
    const dashboardData = {
      summary: {
        totalEmployees,
        fiscalYear: currentYear,
        lastUpdated: dashboardSummary.summary.lastUpdated,
        averageSalary: dashboardSummary.summary.averageSalary,
        totalPayroll: dashboardSummary.summary.totalPayroll,
      },
      aiRecommendation: aiRecommendation,
      budget: budget ? {
        totalBudget: budget.totalBudget.toString(),
        usedBudget: budget.usedBudget.toString(),
        remainingBudget: budget.remainingBudget.toString(),
        usagePercentage: Math.round((budget.usedBudget / budget.totalBudget) * 100),
      } : null,
      levelStatistics: levelStats.map((stat: any) => ({
        level: stat.level,
        employeeCount: stat.employeeCount,
        averageSalary: stat.averageSalary.toString(),
        totalSalary: stat.totalSalary.toString(),
        avgBaseUpPercentage: 3.2,
        avgMeritPercentage: 2.5,
        totalIncreasePercentage: 5.7,
      })),
      departmentDistribution: departmentStats.map(dept => ({
        department: dept.department,
        count: dept._count.id,
      })),
      performanceDistribution: performanceStats.map(perf => ({
        rating: perf.performanceRating,
        count: perf._count.id,
      })),
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}