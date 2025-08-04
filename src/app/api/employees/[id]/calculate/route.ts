import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      baseUpPercentage, 
      meritIncreasePercentage,
      applyToSalary = false 
    } = body

    // 직원 정보 가져오기
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // 총 인상률 계산
    const totalPercentage = baseUpPercentage + meritIncreasePercentage
    const suggestedSalary = Math.round(employee.currentSalary * (1 + totalPercentage / 100))

    // 임금 계산 기록 생성
    const calculation = await prisma.wageCalculation.create({
      data: {
        employeeId: params.id,
        calculationDate: new Date(),
        baseUpPercentage,
        meritIncreasePercentage,
        totalPercentage,
        suggestedSalary,
        status: applyToSalary ? 'approved' : 'draft',
      },
    })

    // 급여에 적용하는 경우
    if (applyToSalary) {
      // 급여 이력 생성
      await prisma.salaryHistory.create({
        data: {
          employeeId: params.id,
          effectiveDate: new Date(),
          previousSalary: employee.currentSalary,
          newSalary: suggestedSalary,
          baseUpAmount: Math.round(employee.currentSalary * baseUpPercentage / 100),
          meritIncreaseAmount: Math.round(employee.currentSalary * meritIncreasePercentage / 100),
          totalIncreaseAmount: suggestedSalary - employee.currentSalary,
          increasePercentage: totalPercentage,
          reason: `${new Date().getFullYear()}년 정기 인상`,
        },
      })

      // 직원 급여 업데이트
      await prisma.employee.update({
        where: { id: params.id },
        data: { currentSalary: suggestedSalary },
      })
    }

    return NextResponse.json({
      calculation,
      currentSalary: employee.currentSalary,
      suggestedSalary,
      increaseAmount: suggestedSalary - employee.currentSalary,
      applied: applyToSalary,
    })
  } catch (error) {
    console.error('Wage Calculation Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate wage' },
      { status: 500 }
    )
  }
}