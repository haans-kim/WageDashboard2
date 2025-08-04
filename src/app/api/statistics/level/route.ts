import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()

    // 직급별 실시간 통계 계산
    const levels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
    const levelStats = await Promise.all(
      levels.map(async (level) => {
        const employees = await prisma.employee.findMany({
          where: { level },
          include: {
            wageCalculations: {
              where: {
                status: 'draft',
                calculationDate: {
                  gte: new Date(currentYear, 0, 1),
                  lt: new Date(currentYear + 1, 0, 1),
                },
              },
              orderBy: {
                calculationDate: 'desc',
              },
              take: 1,
            },
          },
        })

        const employeeCount = employees.length
        const totalCurrentSalary = employees.reduce((sum, emp) => sum + emp.currentSalary, 0)
        const avgCurrentSalary = employeeCount > 0 ? Math.floor(totalCurrentSalary / employeeCount) : 0

        // 제안된 인상률 기반 계산
        const totalSuggestedSalary = employees.reduce((sum, emp) => {
          const calc = emp.wageCalculations[0]
          return sum + (calc ? calc.suggestedSalary : emp.currentSalary)
        }, 0)
        const avgSuggestedSalary = employeeCount > 0 ? Math.floor(totalSuggestedSalary / employeeCount) : 0

        // 평균 인상률 계산
        const avgBaseUp = employees.reduce((sum, emp) => {
          const calc = emp.wageCalculations[0]
          return sum + (calc ? calc.baseUpPercentage : 0)
        }, 0) / (employeeCount || 1)

        const avgMerit = employees.reduce((sum, emp) => {
          const calc = emp.wageCalculations[0]
          return sum + (calc ? calc.meritIncreasePercentage : 0)
        }, 0) / (employeeCount || 1)

        return {
          level,
          employeeCount,
          currentSalary: {
            total: totalCurrentSalary,
            average: avgCurrentSalary,
          },
          suggestedSalary: {
            total: totalSuggestedSalary,
            average: avgSuggestedSalary,
          },
          increaseRates: {
            baseUp: Number(avgBaseUp.toFixed(2)),
            merit: Number(avgMerit.toFixed(2)),
            total: Number((avgBaseUp + avgMerit).toFixed(2)),
          },
          budgetImpact: totalSuggestedSalary - totalCurrentSalary,
        }
      })
    )

    // 전체 통계
    const totalStats = {
      totalEmployees: levelStats.reduce((sum, stat) => sum + stat.employeeCount, 0),
      totalCurrentSalary: levelStats.reduce((sum, stat) => sum + stat.currentSalary.total, 0),
      totalSuggestedSalary: levelStats.reduce((sum, stat) => sum + stat.suggestedSalary.total, 0),
      totalBudgetImpact: levelStats.reduce((sum, stat) => sum + stat.budgetImpact, 0),
    }

    return NextResponse.json({
      levelStatistics: levelStats,
      summary: totalStats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Level Statistics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch level statistics' },
      { status: 500 }
    )
  }
}