import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUpPercentage, meritIncreasePercentage, filters } = body

    // 필터 조건 구성
    const where: any = {}
    if (filters?.level) where.level = filters.level
    if (filters?.department) where.department = filters.department
    if (filters?.performanceRating) where.performanceRating = filters.performanceRating

    // 직원 데이터 가져오기
    const employees = await prisma.employee.findMany({
      where,
      include: {
        wageCalculations: {
          where: {
            status: 'draft',
          },
          orderBy: {
            calculationDate: 'desc',
          },
          take: 1,
        },
      },
    })

    // 시뮬레이션 결과 계산
    const results = employees.map(employee => {
      const currentSalary = employee.currentSalary
      const totalPercentage = baseUpPercentage + meritIncreasePercentage
      const suggestedSalary = Math.round(currentSalary * (1 + totalPercentage / 100))
      const increaseAmount = suggestedSalary - currentSalary

      return {
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
        name: employee.name,
        department: employee.department,
        level: employee.level,
        performanceRating: employee.performanceRating,
        currentSalary,
        suggestedSalary,
        increaseAmount,
        baseUpAmount: Math.round(currentSalary * baseUpPercentage / 100),
        meritAmount: Math.round(currentSalary * meritIncreasePercentage / 100),
        totalPercentage,
      }
    })

    // 통계 계산
    const totalCurrentSalary = results.reduce((sum, r) => sum + r.currentSalary, 0)
    const totalSuggestedSalary = results.reduce((sum, r) => sum + r.suggestedSalary, 0)
    const totalIncreaseAmount = totalSuggestedSalary - totalCurrentSalary

    // 직급별 통계
    const levelStats = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].map(level => {
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
        employeeCount: results.length,
        totalCurrentSalary,
        totalSuggestedSalary,
        totalIncreaseAmount,
        averageIncreaseAmount: results.length > 0 ? Math.round(totalIncreaseAmount / results.length) : 0,
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

// 시뮬레이션 결과 저장
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { employees, applyToAll } = body

    if (applyToAll) {
      // 모든 직원에게 적용
      for (const emp of employees) {
        // 임금 계산 기록 생성
        await prisma.wageCalculation.create({
          data: {
            employeeId: emp.employeeId,
            calculationDate: new Date(),
            baseUpPercentage: emp.baseUpAmount * 100 / emp.currentSalary,
            meritIncreasePercentage: emp.meritAmount * 100 / emp.currentSalary,
            totalPercentage: emp.totalPercentage,
            suggestedSalary: emp.suggestedSalary,
            status: 'approved',
          },
        })

        // 급여 이력 생성
        await prisma.salaryHistory.create({
          data: {
            employeeId: emp.employeeId,
            effectiveDate: new Date(),
            previousSalary: emp.currentSalary,
            newSalary: emp.suggestedSalary,
            baseUpAmount: emp.baseUpAmount,
            meritIncreaseAmount: emp.meritAmount,
            totalIncreaseAmount: emp.increaseAmount,
            increasePercentage: emp.totalPercentage,
            reason: `${new Date().getFullYear()}년 정기 인상 (일괄 적용)`,
          },
        })

        // 직원 급여 업데이트
        await prisma.employee.update({
          where: { id: emp.employeeId },
          data: { currentSalary: emp.suggestedSalary },
        })
      }

      return NextResponse.json({
        success: true,
        appliedCount: employees.length,
        message: `${employees.length}명의 직원에게 인상률이 적용되었습니다.`,
      })
    } else {
      // 시뮬레이션 결과만 저장 (draft 상태)
      for (const emp of employees) {
        await prisma.wageCalculation.create({
          data: {
            employeeId: emp.employeeId,
            calculationDate: new Date(),
            baseUpPercentage: emp.baseUpAmount * 100 / emp.currentSalary,
            meritIncreasePercentage: emp.meritAmount * 100 / emp.currentSalary,
            totalPercentage: emp.totalPercentage,
            suggestedSalary: emp.suggestedSalary,
            status: 'draft',
          },
        })
      }

      return NextResponse.json({
        success: true,
        savedCount: employees.length,
        message: `${employees.length}명의 시뮬레이션 결과가 저장되었습니다.`,
      })
    }
  } catch (error) {
    console.error('Simulation Save Error:', error)
    return NextResponse.json(
      { error: 'Failed to save simulation' },
      { status: 500 }
    )
  }
}