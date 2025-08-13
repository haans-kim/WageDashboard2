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

  // 직군×직급별 실제 데이터 (총 4,167명 분배)
  const bandLevelData = [
    // 생산기술 (1,648명 - 39.5%)
    { band: '생산기술', level: 'Lv.1', headcount: 612, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '생산기술', level: 'Lv.2', headcount: 431, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '생산기술', level: 'Lv.3', headcount: 416, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '생산기술', level: 'Lv.4', headcount: 189, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // 생산 (884명 - 21.2%)
    { band: '생산', level: 'Lv.1', headcount: 328, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '생산', level: 'Lv.2', headcount: 231, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '생산', level: 'Lv.3', headcount: 223, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '생산', level: 'Lv.4', headcount: 102, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // 품질보증 (410명 - 9.8%)
    { band: '품질보증', level: 'Lv.1', headcount: 153, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '품질보증', level: 'Lv.2', headcount: 107, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '품질보증', level: 'Lv.3', headcount: 103, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '품질보증', level: 'Lv.4', headcount: 47, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // Facility (389명 - 9.3%)
    { band: 'Facility', level: 'Lv.1', headcount: 145, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: 'Facility', level: 'Lv.2', headcount: 101, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: 'Facility', level: 'Lv.3', headcount: 98, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: 'Facility', level: 'Lv.4', headcount: 45, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // 영업 (286명 - 6.9%)
    { band: '영업', level: 'Lv.1', headcount: 107, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '영업', level: 'Lv.2', headcount: 74, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '영업', level: 'Lv.3', headcount: 72, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '영업', level: 'Lv.4', headcount: 33, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // 구매&물류 (209명 - 5.0%)
    { band: '구매&물류', level: 'Lv.1', headcount: 78, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '구매&물류', level: 'Lv.2', headcount: 54, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '구매&물류', level: 'Lv.3', headcount: 53, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '구매&물류', level: 'Lv.4', headcount: 24, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // 경영지원 (173명 - 4.2%)
    { band: '경영지원', level: 'Lv.1', headcount: 64, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '경영지원', level: 'Lv.2', headcount: 45, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '경영지원', level: 'Lv.3', headcount: 44, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '경영지원', level: 'Lv.4', headcount: 20, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
    
    // 기획 (168명 - 4.0%)
    { band: '기획', level: 'Lv.1', headcount: 63, meanBasePay: 51977513, baseUpKRW: 1663280, sblIndex: 91.5, caIndex: 89.8 },
    { band: '기획', level: 'Lv.2', headcount: 44, meanBasePay: 67376032, baseUpKRW: 2156033, sblIndex: 93.2, caIndex: 91.0 },
    { band: '기획', level: 'Lv.3', headcount: 42, meanBasePay: 87599520, baseUpKRW: 2803185, sblIndex: 93.6, caIndex: 92.1 },
    { band: '기획', level: 'Lv.4', headcount: 19, meanBasePay: 108469574, baseUpKRW: 3471026, sblIndex: 94.2, caIndex: 92.8 },
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
        fiscalYear,
      },
    })
  }

  // 총 예산 데이터 생성 (283억원)
  await prisma.budget.create({
    data: {
      fiscalYear: 2025,
      totalBudget: BigInt(283034052564),
      usedBudget: BigInt(24484451897),
      department: null, // 전체
    },
  })

  // AI 추천 설정 생성
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

  // 직급별 통계 생성 (실제 Pay 현황.png 데이터)
  const levelStats = [
    { level: 'Lv.1', employeeCount: 1548, averageSalary: BigInt(51977513), totalSalary: BigInt(80461149924) },
    { level: 'Lv.2', employeeCount: 1089, averageSalary: BigInt(67376032), totalSalary: BigInt(73372498848) },
    { level: 'Lv.3', employeeCount: 1051, averageSalary: BigInt(87599520), totalSalary: BigInt(92067095520) },
    { level: 'Lv.4', employeeCount: 479, averageSalary: BigInt(108469574), totalSalary: BigInt(51956925946) },
  ]

  for (const stat of levelStats) {
    await prisma.levelStatistics.create({
      data: {
        level: stat.level,
        fiscalYear: 2025,
        employeeCount: stat.employeeCount,
        averageSalary: stat.averageSalary,
        totalSalary: stat.totalSalary,
        avgBaseUpPercentage: 3.2,
        avgMeritPercentage: 2.5,
      },
    })
  }

  // 샘플 직원 데이터 생성 (대표적인 몇 명만)
  const employees = [
    { employeeNumber: 'EMP001', name: '김철수', department: '생산기술', level: 'Lv.4', currentSalary: 115200000, performanceRating: 'A' },
    { employeeNumber: 'EMP002', name: '이영희', department: '생산기술', level: 'Lv.3', currentSalary: 93600000, performanceRating: 'B+' },
    { employeeNumber: 'EMP003', name: '박민수', department: '영업', level: 'Lv.3', currentSalary: 89500000, performanceRating: 'A-' },
    { employeeNumber: 'EMP004', name: '최지원', department: '기획', level: 'Lv.4', currentSalary: 112000000, performanceRating: 'A' },
    { employeeNumber: 'EMP005', name: '정현진', department: '품질보증', level: 'Lv.2', currentSalary: 68000000, performanceRating: 'B' },
    { employeeNumber: 'EMP006', name: '강민지', department: 'Facility', level: 'Lv.2', currentSalary: 66500000, performanceRating: 'B+' },
    { employeeNumber: 'EMP007', name: '윤서준', department: '생산', level: 'Lv.1', currentSalary: 52000000, performanceRating: 'B' },
    { employeeNumber: 'EMP008', name: '조은비', department: '구매&물류', level: 'Lv.3', currentSalary: 85000000, performanceRating: 'A-' },
    { employeeNumber: 'EMP009', name: '임도현', department: '경영지원', level: 'Lv.4', currentSalary: 105000000, performanceRating: 'A' },
    { employeeNumber: 'EMP010', name: '한소연', department: '생산기술', level: 'Lv.1', currentSalary: 51000000, performanceRating: 'C+' },
  ]

  for (const emp of employees) {
    await prisma.employee.create({
      data: {
        ...emp,
        hireDate: new Date('2020-01-01'),
      },
    })
  }

  console.log('Seed data created successfully!')
  console.log('총 인원: 4,167명')
  console.log('총 예산: 283,034,052,564원')
  console.log('8개 직군 데이터 생성 완료')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })