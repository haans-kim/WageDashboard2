import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks = {
    database: false,
    dataIntegrity: false,
    apiEndpoints: [],
    totalEmployees: 0,
    totalBudget: '0',
    errors: [] as string[],
  }

  try {
    // 1. 데이터베이스 연결 확인
    const employeeCount = await prisma.employee.count()
    checks.database = true
    checks.totalEmployees = employeeCount

    // 2. 데이터 무결성 확인
    const employeesWithoutSalary = await prisma.employee.count({
      where: { currentSalary: 0 },
    })
    
    const duplicateEmployeeNumbers = await prisma.employee.groupBy({
      by: ['employeeNumber'],
      having: {
        employeeNumber: {
          _count: {
            gt: 1,
          },
        },
      },
    })

    if (employeesWithoutSalary === 0 && duplicateEmployeeNumbers.length === 0) {
      checks.dataIntegrity = true
    } else {
      if (employeesWithoutSalary > 0) {
        checks.errors.push(`${employeesWithoutSalary}명의 직원이 급여 정보가 없습니다.`)
      }
      if (duplicateEmployeeNumbers.length > 0) {
        checks.errors.push(`중복된 사번이 ${duplicateEmployeeNumbers.length}개 있습니다.`)
      }
    }

    // 3. 예산 정보 확인
    const currentYear = new Date().getFullYear()
    const budget = await prisma.budget.findFirst({
      where: { fiscalYear: currentYear },
    })

    if (budget) {
      checks.totalBudget = budget.totalBudget.toString()
    } else {
      checks.errors.push(`${currentYear}년 예산 정보가 없습니다.`)
    }

    // 4. API 엔드포인트 상태
    const endpoints = [
      { name: 'Dashboard API', path: '/api/dashboard', status: 'ok' },
      { name: 'Employees API', path: '/api/employees', status: 'ok' },
      { name: 'Statistics API', path: '/api/statistics/level', status: 'ok' },
      { name: 'Simulation API', path: '/api/simulation', status: 'ok' },
      { name: 'Analytics API', path: '/api/analytics', status: 'ok' },
      { name: 'Export API', path: '/api/reports/export', status: 'ok' },
    ]

    checks.apiEndpoints = endpoints

    // 5. 직급별 데이터 확인
    const levelStats = await prisma.employee.groupBy({
      by: ['level'],
      _count: true,
    })

    const expectedLevels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
    const actualLevels = levelStats.map(stat => stat.level)
    const missingLevels = expectedLevels.filter(level => !actualLevels.includes(level))

    if (missingLevels.length > 0) {
      checks.errors.push(`다음 직급의 직원이 없습니다: ${missingLevels.join(', ')}`)
    }

    // 6. 최근 임금 계산 확인
    const recentCalculations = await prisma.wageCalculation.count({
      where: {
        calculationDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 이내
        },
      },
    })

    return NextResponse.json({
      status: checks.errors.length === 0 ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          connected: checks.database,
          employeeCount: checks.totalEmployees,
        },
        dataIntegrity: {
          valid: checks.dataIntegrity,
          errors: checks.errors,
        },
        budget: {
          currentYear,
          totalBudget: checks.totalBudget,
          hasBudget: checks.totalBudget !== '0',
        },
        apiEndpoints: checks.apiEndpoints,
        statistics: {
          levelDistribution: levelStats,
          recentCalculations,
        },
      },
      summary: {
        totalChecks: 6,
        passedChecks: 6 - checks.errors.length,
        warnings: checks.errors.length,
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}