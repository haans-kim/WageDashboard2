import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 기존 데이터 삭제
  await prisma.levelStatistics.deleteMany()
  await prisma.aIRecommendation.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.wageCalculation.deleteMany()
  await prisma.salaryHistory.deleteMany()
  await prisma.employee.deleteMany()

  // AI 추천 설정
  await prisma.aIRecommendation.create({
    data: {
      fiscalYear: 2025,
      baseUpPercentage: 3.2,
      meritIncreasePercentage: 2.5,
      minRange: 5.7,
      maxRange: 5.9,
      industry: '제조업',
      companySize: '대기업',
    },
  })

  // 예산 정보
  await prisma.budget.create({
    data: {
      fiscalYear: 2025,
      totalBudget: BigInt(31900000000), // 319억
      usedBudget: BigInt(18900000000),  // 189억
      department: null, // 전체
    },
  })

  // 샘플 직원 데이터
  const departments = ['영업1팀', '영업2팀', '개발팀', '인사팀', '재무팀', '마케팅팀']
  const levels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
  const levelSalaryRanges = {
    'Lv.1': { min: 120000000, max: 150000000 }, // 1.2억 ~ 1.5억
    'Lv.2': { min: 80000000, max: 120000000 },  // 8천만 ~ 1.2억
    'Lv.3': { min: 50000000, max: 80000000 },   // 5천만 ~ 8천만
    'Lv.4': { min: 35000000, max: 50000000 },   // 3.5천만 ~ 5천만
  }

  const employees = []
  let employeeNumber = 10000

  // 각 직급별로 직원 생성
  for (const level of levels) {
    const employeeCount = level === 'Lv.1' ? 39 : level === 'Lv.2' ? 43 : level === 'Lv.3' ? 171 : 92
    
    for (let i = 0; i < employeeCount; i++) {
      const department = departments[Math.floor(Math.random() * departments.length)]
      const salaryRange = levelSalaryRanges[level as keyof typeof levelSalaryRanges]
      const salary = Math.floor(Math.random() * (salaryRange.max - salaryRange.min) + salaryRange.min)
      
      const employee = await prisma.employee.create({
        data: {
          employeeNumber: `E${employeeNumber++}`,
          name: `직원${employeeNumber}`,
          department,
          level,
          currentSalary: salary,
          hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1),
          performanceRating: ['S', 'A', 'B'][Math.floor(Math.random() * 3)],
        },
      })
      
      employees.push(employee)
      
      // 임금 계산 데이터 추가
      await prisma.wageCalculation.create({
        data: {
          employeeId: employee.id,
          calculationDate: new Date(2025, 5, 1),
          baseUpPercentage: 3.2,
          meritIncreasePercentage: 2.5,
          totalPercentage: 5.7,
          suggestedSalary: Math.floor(salary * 1.057),
          status: 'draft',
        },
      })
    }
  }

  // 직급별 통계 생성
  for (const level of levels) {
    const levelEmployees = await prisma.employee.findMany({
      where: { level },
    })
    
    const totalSalary = levelEmployees.reduce((sum, emp) => sum + emp.currentSalary, 0)
    const avgSalary = Math.floor(totalSalary / levelEmployees.length)
    
    await prisma.levelStatistics.create({
      data: {
        level,
        fiscalYear: 2025,
        employeeCount: levelEmployees.length,
        averageSalary: BigInt(avgSalary),
        totalSalary: BigInt(totalSalary),
        avgBaseUpPercentage: 3.2,
        avgMeritPercentage: 2.5,
      },
    })
  }

  console.log('시드 데이터가 성공적으로 생성되었습니다.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })