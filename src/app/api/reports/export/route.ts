import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'summary'
    const format = searchParams.get('format') || 'xlsx'

    let data: any = {}

    switch (type) {
      case 'summary':
        // 전체 요약 데이터
        const employees = await prisma.employee.findMany({
          include: {
            wageCalculations: {
              where: { status: 'draft' },
              orderBy: { calculationDate: 'desc' },
              take: 1,
            },
          },
        })

        const levelStats = await prisma.levelStatistics.findMany({
          where: { fiscalYear: new Date().getFullYear() },
        })

        const budget = await prisma.budget.findFirst({
          where: { fiscalYear: new Date().getFullYear() },
        })

        data = {
          개요: [{
            항목: '총 직원수',
            값: employees.length,
          }, {
            항목: '총 예산',
            값: budget?.totalBudget.toString() || '0',
          }, {
            항목: '사용 예산',
            값: budget?.usedBudget.toString() || '0',
          }, {
            항목: '예산 활용률',
            값: budget ? `${Number((budget.usedBudget * 100n) / budget.totalBudget)}%` : '0%',
          }],
          직급별통계: levelStats.map(stat => ({
            직급: stat.level,
            인원수: stat.employeeCount,
            평균급여: stat.averageSalary.toString(),
            총급여: stat.totalSalary.toString(),
            평균인상률: `${(stat.avgBaseUpPercentage + stat.avgMeritPercentage).toFixed(1)}%`,
          })),
        }
        break

      case 'employees':
        // 직원 상세 데이터
        const allEmployees = await prisma.employee.findMany({
          include: {
            wageCalculations: {
              where: { status: 'draft' },
              orderBy: { calculationDate: 'desc' },
              take: 1,
            },
          },
          orderBy: [{ level: 'asc' }, { employeeNumber: 'asc' }],
        })

        data = {
          직원목록: allEmployees.map(emp => ({
            사번: emp.employeeNumber,
            이름: emp.name,
            부서: emp.department,
            직급: emp.level,
            현재급여: emp.currentSalary,
            성과등급: emp.performanceRating || '-',
            입사일: new Date(emp.hireDate).toLocaleDateString('ko-KR'),
            예상인상률: emp.wageCalculations[0] 
              ? `${emp.wageCalculations[0].totalPercentage}%`
              : '-',
            예상급여: emp.wageCalculations[0]?.suggestedSalary || emp.currentSalary,
          })),
        }
        break

      case 'simulation':
        // 시뮬레이션 결과
        const latestCalculations = await prisma.wageCalculation.findMany({
          where: { status: 'draft' },
          include: { employee: true },
          orderBy: { calculationDate: 'desc' },
          distinct: ['employeeId'],
        })

        const byLevel = latestCalculations.reduce((acc: any, calc) => {
          const level = calc.employee.level
          if (!acc[level]) {
            acc[level] = { count: 0, totalCurrent: 0, totalSuggested: 0 }
          }
          acc[level].count++
          acc[level].totalCurrent += calc.employee.currentSalary
          acc[level].totalSuggested += calc.suggestedSalary
          return acc
        }, {})

        data = {
          시뮬레이션요약: Object.entries(byLevel).map(([level, stats]: any) => ({
            직급: level,
            인원: stats.count,
            현재총액: stats.totalCurrent,
            예상총액: stats.totalSuggested,
            인상액: stats.totalSuggested - stats.totalCurrent,
            평균인상액: Math.round((stats.totalSuggested - stats.totalCurrent) / stats.count),
          })),
        }
        break
    }

    if (format === 'json') {
      return NextResponse.json(data)
    }

    // Excel 파일 생성
    const wb = XLSX.utils.book_new()
    
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const ws = XLSX.utils.json_to_sheet(sheetData as any[])
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=wage-report-${type}-${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    })
  } catch (error) {
    console.error('Export API Error:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}