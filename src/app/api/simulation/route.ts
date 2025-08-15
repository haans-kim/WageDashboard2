import { NextRequest, NextResponse } from 'next/server'
import { simulateSalaryIncrease } from '@/services/employeeDataService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      baseUpPercentage = 3.2, 
      meritIncreasePercentage = 2.5, 
      performanceWeights = { S: 1.5, A: 1.2, B: 1.0, C: 0.8 },
      filters 
    } = body

    // employeeDataService의 시뮬레이션 기능 사용
    const simulation = await simulateSalaryIncrease({
      level: filters?.level,
      department: filters?.department,
      baseUpPercentage,
      meritIncreasePercentage
    })

    // API 응답 형식에 맞게 변환
    const results = simulation.details.map(detail => ({
      employeeId: detail.employeeId,
      employeeNumber: detail.employeeId,
      name: detail.name,
      department: detail.department,
      level: detail.level,
      performanceRating: null,
      currentSalary: detail.currentSalary,
      suggestedSalary: detail.suggestedSalary,
      increaseAmount: detail.increaseAmount,
      baseUpAmount: Math.round(detail.currentSalary * baseUpPercentage / 100),
      meritAmount: Math.round(detail.currentSalary * meritIncreasePercentage / 100),
      totalPercentage: baseUpPercentage + meritIncreasePercentage,
    }))

    // 직급별 통계
    const levelStats = Array.from(new Set(results.map(r => r.level))).map(level => {
      const levelEmployees = results.filter(r => r.level === level)
      const count = levelEmployees.length
      const currentTotal = levelEmployees.reduce((sum, r) => sum + r.currentSalary, 0)
      const suggestedTotal = levelEmployees.reduce((sum, r) => sum + r.suggestedSalary, 0)
      
      return {
        level,
        employeeCount: count,
        currentTotal,
        suggestedTotal,
        increaseAmount: suggestedTotal - currentTotal,
        averageIncrease: count > 0 ? Math.round((suggestedTotal - currentTotal) / count) : 0,
      }
    })

    // 부서별 통계
    const departmentStats = Array.from(new Set(results.map(r => r.department))).map(dept => {
      const deptEmployees = results.filter(r => r.department === dept)
      const count = deptEmployees.length
      const currentTotal = deptEmployees.reduce((sum, r) => sum + r.currentSalary, 0)
      const suggestedTotal = deptEmployees.reduce((sum, r) => sum + r.suggestedSalary, 0)
      
      return {
        department: dept,
        employeeCount: count,
        currentTotal,
        suggestedTotal,
        increaseAmount: suggestedTotal - currentTotal,
        averageIncrease: count > 0 ? Math.round((suggestedTotal - currentTotal) / count) : 0,
      }
    })

    return NextResponse.json({
      simulation: {
        baseUpPercentage,
        meritIncreasePercentage,
        totalPercentage: baseUpPercentage + meritIncreasePercentage,
        employeeCount: simulation.affectedEmployees,
        totalCurrentSalary: simulation.currentTotal,
        totalSuggestedSalary: simulation.projectedTotal,
        totalIncreaseAmount: simulation.totalIncrease,
        averageIncreaseAmount: simulation.affectedEmployees > 0 ? Math.round(simulation.totalIncrease / simulation.affectedEmployees) : 0,
      },
      levelStatistics: levelStats,
      departmentStatistics: departmentStats,
      employees: results,
    })
  } catch (error) {
    console.error('Simulation API Error:', error)
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { wageCalculations } = body

    if (!wageCalculations || !Array.isArray(wageCalculations)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // 시뮬레이션 적용 (메모리에만 저장)
    const results = []
    for (const calc of wageCalculations) {
      if (calc.applyCalculation) {
        // employeeDataService의 updateEmployee 사용
        const { updateEmployee } = await import('@/services/employeeDataService')
        const updatedEmployee = await updateEmployee(calc.employeeId, {
          currentSalary: calc.suggestedSalary
        })
        
        if (updatedEmployee) {
          results.push({
            employeeId: calc.employeeId,
            previousSalary: calc.currentSalary,
            newSalary: calc.suggestedSalary,
            status: 'applied'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      appliedCount: results.length,
      results,
      message: `${results.length}명의 급여가 업데이트되었습니다 (메모리에만 저장됨).`
    })
  } catch (error) {
    console.error('Simulation Apply Error:', error)
    return NextResponse.json(
      { error: 'Failed to apply simulation' },
      { status: 500 }
    )
  }
}