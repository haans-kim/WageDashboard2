import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()

    // 1. 급여 분포 분석
    const salaryRanges = [
      { min: 0, max: 40000000, label: '4천만 미만' },
      { min: 40000000, max: 60000000, label: '4-6천만' },
      { min: 60000000, max: 80000000, label: '6-8천만' },
      { min: 80000000, max: 100000000, label: '8천만-1억' },
      { min: 100000000, max: 150000000, label: '1-1.5억' },
      { min: 150000000, max: Infinity, label: '1.5억 이상' },
    ]

    const salaryDistribution = await Promise.all(
      salaryRanges.map(async (range) => {
        const count = await prisma.employee.count({
          where: {
            currentSalary: {
              gte: range.min,
              lt: range.max === Infinity ? undefined : range.max,
            },
          },
        })
        return {
          range: range.label,
          count,
          min: range.min,
          max: range.max,
        }
      })
    )

    // 2. 부서별 급여 분석
    const departments = await prisma.employee.groupBy({
      by: ['department'],
      _avg: { currentSalary: true },
      _min: { currentSalary: true },
      _max: { currentSalary: true },
      _count: { id: true },
    })

    const departmentAnalysis = departments.map(dept => ({
      department: dept.department,
      averageSalary: Math.round(dept._avg.currentSalary || 0),
      minSalary: dept._min.currentSalary || 0,
      maxSalary: dept._max.currentSalary || 0,
      employeeCount: dept._count.id,
      salaryRange: (dept._max.currentSalary || 0) - (dept._min.currentSalary || 0),
    }))

    // 3. 인상률 효과 분석
    const projections = []
    for (let rate = 0; rate <= 10; rate += 0.5) {
      const employees = await prisma.employee.findMany()
      const totalCurrent = employees.reduce((sum, emp) => sum + emp.currentSalary, 0)
      const totalProjected = employees.reduce((sum, emp) => 
        sum + Math.round(emp.currentSalary * (1 + rate / 100)), 0
      )
      
      projections.push({
        rate,
        totalCurrent,
        totalProjected,
        increase: totalProjected - totalCurrent,
        budgetImpact: ((totalProjected - totalCurrent) / totalCurrent) * 100,
      })
    }

    // 4. 성과 등급별 급여 분석
    const performanceAnalysis = await prisma.employee.groupBy({
      by: ['performanceRating', 'level'],
      _avg: { currentSalary: true },
      _count: { id: true },
      where: {
        performanceRating: {
          not: null,
        },
      },
    })

    // 5. 근속년수별 분석
    const employees = await prisma.employee.findMany({
      select: {
        currentSalary: true,
        hireDate: true,
        level: true,
      },
    })

    const tenureAnalysis = employees.map(emp => {
      const yearsOfService = currentYear - new Date(emp.hireDate).getFullYear()
      return {
        yearsOfService,
        salary: emp.currentSalary,
        level: emp.level,
      }
    })

    const tenureGroups = [
      { min: 0, max: 2, label: '2년 미만' },
      { min: 2, max: 5, label: '2-5년' },
      { min: 5, max: 10, label: '5-10년' },
      { min: 10, max: Infinity, label: '10년 이상' },
    ]

    const tenureStats = tenureGroups.map(group => {
      const groupEmployees = tenureAnalysis.filter(
        emp => emp.yearsOfService >= group.min && 
               (group.max === Infinity || emp.yearsOfService < group.max)
      )
      
      const avgSalary = groupEmployees.length > 0
        ? Math.round(groupEmployees.reduce((sum, emp) => sum + emp.salary, 0) / groupEmployees.length)
        : 0

      return {
        tenure: group.label,
        employeeCount: groupEmployees.length,
        averageSalary: avgSalary,
      }
    })

    // 6. 예산 활용률 추이
    const budget = await prisma.budget.findFirst({
      where: { fiscalYear: currentYear },
    })

    const budgetUtilization = {
      totalBudget: budget?.totalBudget.toString() || '0',
      usedBudget: budget?.usedBudget.toString() || '0',
      utilizationRate: budget 
        ? Number((budget.usedBudget * BigInt(100)) / budget.totalBudget)
        : 0,
    }

    return NextResponse.json({
      salaryDistribution,
      departmentAnalysis,
      projections,
      performanceAnalysis: performanceAnalysis.map(item => ({
        performanceRating: item.performanceRating,
        level: item.level,
        averageSalary: Math.round(item._avg.currentSalary || 0),
        count: item._count.id,
      })),
      tenureStats,
      budgetUtilization,
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}