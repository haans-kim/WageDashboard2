import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 기존 데이터 삭제
  await prisma.payBandScenario.deleteMany()
  await prisma.externalBenchmark.deleteMany()
  await prisma.bandLevel.deleteMany()
  await prisma.band.deleteMany()
  await prisma.levelStatistics.deleteMany()
  await prisma.aIRecommendation.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.wageCalculation.deleteMany()
  await prisma.salaryHistory.deleteMany()
  await prisma.employee.deleteMany()

  // 8개 직군 생성
  const bands = [
    { name: '생산기술', description: '생산 기술 관련 직군', displayOrder: 1 },
    { name: 'Facility', description: '시설 관리 직군', displayOrder: 2 },
    { name: '경영지원', description: '경영 지원 직군', displayOrder: 3 },
    { name: '기획', description: '기획 직군', displayOrder: 4 },
    { name: '구매&물류', description: '구매 및 물류 직군', displayOrder: 5 },
    { name: '영업', description: '영업 직군', displayOrder: 6 },
    { name: '생산', description: '생산 직군', displayOrder: 7 },
    { name: '품질보증', description: '품질 보증 직군', displayOrder: 8 },
  ]

  const createdBands = []
  for (const band of bands) {
    const created = await prisma.band.create({ data: band })
    createdBands.push(created)
  }

  // 직군×직급별 테스트 데이터 (pay_band_dashboard_spec.md 참조)
  const bandLevelData = [
    // 생산기술
    { band: '생산기술', level: 'Lv.1', headcount: 30, meanBasePay: 52000000, baseUpKRW: 700000, sblIndex: 98.2, caIndex: 95.7 },
    { band: '생산기술', level: 'Lv.2', headcount: 35, meanBasePay: 68000000, baseUpKRW: 900000, sblIndex: 99.1, caIndex: 96.5 },
    { band: '생산기술', level: 'Lv.3', headcount: 28, meanBasePay: 85000000, baseUpKRW: 1100000, sblIndex: 100.2, caIndex: 98.1 },
    { band: '생산기술', level: 'Lv.4', headcount: 20, meanBasePay: 105000000, baseUpKRW: 1400000, sblIndex: 101.5, caIndex: 99.8 },
    // Facility
    { band: 'Facility', level: 'Lv.1', headcount: 22, meanBasePay: 51000000, baseUpKRW: 650000, sblIndex: 98.8, caIndex: 96.2 },
    { band: 'Facility', level: 'Lv.2', headcount: 18, meanBasePay: 66000000, baseUpKRW: 850000, sblIndex: 99.3, caIndex: 97.1 },
    { band: 'Facility', level: 'Lv.3', headcount: 15, meanBasePay: 82000000, baseUpKRW: 1050000, sblIndex: 99.8, caIndex: 97.8 },
    { band: 'Facility', level: 'Lv.4', headcount: 12, meanBasePay: 100000000, baseUpKRW: 1300000, sblIndex: 100.5, caIndex: 98.5 },
    // 경영지원
    { band: '경영지원', level: 'Lv.1', headcount: 18, meanBasePay: 50000000, baseUpKRW: 600000, sblIndex: 99.0, caIndex: 97.0 },
    { band: '경영지원', level: 'Lv.2', headcount: 22, meanBasePay: 65000000, baseUpKRW: 800000, sblIndex: 99.5, caIndex: 97.5 },
    { band: '경영지원', level: 'Lv.3', headcount: 20, meanBasePay: 80000000, baseUpKRW: 1000000, sblIndex: 100.0, caIndex: 98.0 },
    { band: '경영지원', level: 'Lv.4', headcount: 15, meanBasePay: 95000000, baseUpKRW: 1200000, sblIndex: 100.8, caIndex: 99.0 },
    // 기획
    { band: '기획', level: 'Lv.1', headcount: 15, meanBasePay: 53000000, baseUpKRW: 700000, sblIndex: 100.5, caIndex: 107.0 },
    { band: '기획', level: 'Lv.2', headcount: 18, meanBasePay: 70000000, baseUpKRW: 950000, sblIndex: 101.2, caIndex: 108.5 },
    { band: '기획', level: 'Lv.3', headcount: 16, meanBasePay: 88000000, baseUpKRW: 1150000, sblIndex: 102.1, caIndex: 109.2 },
    { band: '기획', level: 'Lv.4', headcount: 10, meanBasePay: 110000000, baseUpKRW: 1500000, sblIndex: 103.5, caIndex: 110.0 },
    // 구매&물류
    { band: '구매&물류', level: 'Lv.1', headcount: 20, meanBasePay: 49500000, baseUpKRW: 600000, sblIndex: 98.0, caIndex: 96.0 },
    { band: '구매&물류', level: 'Lv.2', headcount: 25, meanBasePay: 64000000, baseUpKRW: 800000, sblIndex: 98.5, caIndex: 96.8 },
    { band: '구매&물류', level: 'Lv.3', headcount: 22, meanBasePay: 78000000, baseUpKRW: 980000, sblIndex: 99.0, caIndex: 97.2 },
    { band: '구매&물류', level: 'Lv.4', headcount: 18, meanBasePay: 92000000, baseUpKRW: 1180000, sblIndex: 99.5, caIndex: 97.8 },
    // 영업
    { band: '영업', level: 'Lv.1', headcount: 25, meanBasePay: 54000000, baseUpKRW: 750000, sblIndex: 101.0, caIndex: 104.0 },
    { band: '영업', level: 'Lv.2', headcount: 30, meanBasePay: 72000000, baseUpKRW: 1000000, sblIndex: 102.0, caIndex: 105.5 },
    { band: '영업', level: 'Lv.3', headcount: 28, meanBasePay: 90000000, baseUpKRW: 1200000, sblIndex: 103.0, caIndex: 106.8 },
    { band: '영업', level: 'Lv.4', headcount: 22, meanBasePay: 115000000, baseUpKRW: 1550000, sblIndex: 104.2, caIndex: 107.5 },
    // 생산
    { band: '생산', level: 'Lv.1', headcount: 40, meanBasePay: 48000000, baseUpKRW: 550000, sblIndex: 97.5, caIndex: 95.0 },
    { band: '생산', level: 'Lv.2', headcount: 45, meanBasePay: 62000000, baseUpKRW: 750000, sblIndex: 98.0, caIndex: 95.5 },
    { band: '생산', level: 'Lv.3', headcount: 38, meanBasePay: 75000000, baseUpKRW: 920000, sblIndex: 98.5, caIndex: 96.0 },
    { band: '생산', level: 'Lv.4', headcount: 30, meanBasePay: 88000000, baseUpKRW: 1100000, sblIndex: 99.0, caIndex: 96.5 },
    // 품질보증
    { band: '품질보증', level: 'Lv.1', headcount: 28, meanBasePay: 50000000, baseUpKRW: 600000, sblIndex: 99.2, caIndex: 97.1 },
    { band: '품질보증', level: 'Lv.2', headcount: 32, meanBasePay: 65000000, baseUpKRW: 800000, sblIndex: 99.8, caIndex: 97.8 },
    { band: '품질보증', level: 'Lv.3', headcount: 26, meanBasePay: 80000000, baseUpKRW: 1000000, sblIndex: 100.3, caIndex: 98.5 },
    { band: '품질보증', level: 'Lv.4', headcount: 20, meanBasePay: 95000000, baseUpKRW: 1200000, sblIndex: 101.0, caIndex: 99.2 },
  ]

  // BandLevel 데이터 생성
  const bandMap = new Map(createdBands.map(b => [b.name, b.id]))
  const fiscalYear = 2025

  for (const data of bandLevelData) {
    const bandId = bandMap.get(data.band)
    if (!bandId) continue

    const baseUpRate = data.baseUpKRW / data.meanBasePay
    const competitiveness = data.sblIndex // 기본값은 SBL 지수

    await prisma.bandLevel.create({
      data: {
        bandId,
        level: data.level,
        headcount: data.headcount,
        meanBasePay: BigInt(data.meanBasePay),
        baseUpKRW: BigInt(data.baseUpKRW),
        baseUpRate,
        sblIndex: data.sblIndex,
        caIndex: data.caIndex,
        competitiveness,
        fiscalYear
      }
    })
  }

  // 외부 벤치마크 데이터 생성
  for (const data of bandLevelData) {
    const bandId = bandMap.get(data.band)
    if (!bandId) continue

    // SBL 벤치마크
    await prisma.externalBenchmark.create({
      data: {
        bandId,
        level: data.level,
        extRefType: 'SBL',
        extMeanBasePay: BigInt(Math.round(data.meanBasePay / (data.sblIndex / 100))),
        fiscalYear,
        source: 'Market Survey 2025'
      }
    })

    // CA 벤치마크
    await prisma.externalBenchmark.create({
      data: {
        bandId,
        level: data.level,
        extRefType: 'CA',
        extMeanBasePay: BigInt(Math.round(data.meanBasePay / (data.caIndex / 100))),
        fiscalYear,
        source: 'Competitor Analysis 2025'
      }
    })
  }

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
    'Lv.1': { min: 35000000, max: 50000000 },   // 3.5천만 ~ 5천만 (주니어)
    'Lv.2': { min: 50000000, max: 80000000 },   // 5천만 ~ 8천만
    'Lv.3': { min: 80000000, max: 120000000 },  // 8천만 ~ 1.2억
    'Lv.4': { min: 120000000, max: 150000000 }, // 1.2억 ~ 1.5억 (부장급)
  }

  const employees = []
  let employeeNumber = 10000

  // 각 직급별로 직원 생성
  for (const level of levels) {
    const employeeCount = level === 'Lv.1' ? 92 : level === 'Lv.2' ? 171 : level === 'Lv.3' ? 43 : 39
    
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