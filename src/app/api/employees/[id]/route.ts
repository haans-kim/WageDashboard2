import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        salaryHistories: {
          orderBy: { effectiveDate: 'desc' },
          take: 10,
        },
        wageCalculations: {
          orderBy: { calculationDate: 'desc' },
          take: 5,
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // 같은 직급의 평균 급여 계산
    const levelAverage = await prisma.employee.aggregate({
      where: { level: employee.level },
      _avg: { currentSalary: true },
    })

    // 같은 부서의 평균 급여 계산
    const departmentAverage = await prisma.employee.aggregate({
      where: { department: employee.department },
      _avg: { currentSalary: true },
    })

    return NextResponse.json({
      employee,
      comparisons: {
        levelAverage: levelAverage._avg.currentSalary || 0,
        departmentAverage: departmentAverage._avg.currentSalary || 0,
      },
    })
  } catch (error) {
    console.error('Employee API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee data' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { currentSalary, performanceRating } = body

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        currentSalary,
        performanceRating,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Employee Update Error:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}