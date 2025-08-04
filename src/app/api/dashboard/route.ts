import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 현재 회계연도
    const currentYear = new Date().getFullYear()

    // AI 추천 설정 가져오기
    const aiRecommendation = await prisma.aIRecommendation.findFirst({
      where: { fiscalYear: currentYear },
      orderBy: { createdAt: 'desc' },
    })

    // 예산 정보 가져오기
    const budget = await prisma.budget.findFirst({
      where: {
        fiscalYear: currentYear,
        department: null, // 전체 예산
      },
    })

    // 전체 직원 수
    const totalEmployees = await prisma.employee.count()

    // 직급별 통계
    const levelStats = await prisma.levelStatistics.findMany({
      where: { fiscalYear: currentYear },
      orderBy: { level: 'asc' },
    })

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
        lastUpdated: new Date().toISOString(),
      },
      aiRecommendation: aiRecommendation ? {
        baseUpPercentage: aiRecommendation.baseUpPercentage,
        meritIncreasePercentage: aiRecommendation.meritIncreasePercentage,
        totalPercentage: aiRecommendation.baseUpPercentage + aiRecommendation.meritIncreasePercentage,
        minRange: aiRecommendation.minRange,
        maxRange: aiRecommendation.maxRange,
      } : null,
      budget: budget ? {
        totalBudget: budget.totalBudget.toString(),
        usedBudget: budget.usedBudget.toString(),
        remainingBudget: (budget.totalBudget - budget.usedBudget).toString(),
        usagePercentage: Number((budget.usedBudget * 100n) / budget.totalBudget),
      } : null,
      levelStatistics: levelStats.map(stat => ({
        level: stat.level,
        employeeCount: stat.employeeCount,
        averageSalary: stat.averageSalary.toString(),
        totalSalary: stat.totalSalary.toString(),
        avgBaseUpPercentage: stat.avgBaseUpPercentage,
        avgMeritPercentage: stat.avgMeritPercentage,
        totalIncreasePercentage: stat.avgBaseUpPercentage + stat.avgMeritPercentage,
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