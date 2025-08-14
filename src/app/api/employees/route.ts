import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const level = searchParams.get('level')
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    // 필터 조건 구성
    const where: any = {}
    if (level) where.level = level
    if (department) where.department = department
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { employeeNumber: { contains: search } },
      ]
    }

    // 전체 개수
    const total = await prisma.employee.count({ where })

    // 페이지네이션된 데이터
    const employees = await prisma.employee.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { level: 'asc' },
        { employeeNumber: 'asc' },
      ],
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

    // 응답 데이터 포맷
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      employeeNumber: emp.employeeNumber,
      name: emp.name,
      department: emp.department,
      level: emp.level,
      currentSalary: emp.currentSalary,
      performanceRating: emp.performanceRating,
      hireDate: emp.hireDate.toISOString(),
      latestCalculation: emp.wageCalculations[0] || null,
    }))

    return NextResponse.json({
      data: formattedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Employees API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}