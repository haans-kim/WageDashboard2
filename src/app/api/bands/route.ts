import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 부서를 직군으로 매핑하는 함수
function mapDepartmentToBand(department: string): string {
  const mapping: Record<string, string> = {
    '영업1팀': '영업',
    '영업2팀': '영업',
    '개발팀': '생산기술',
    '인사팀': '경영지원',
    '재무팀': '경영지원',
    '마케팅팀': '기획',
    '생산1팀': '생산',
    '생산2팀': '생산',
    '품질관리팀': '품질보증',
    '구매팀': '구매&물류',
    '물류팀': '구매&물류',
    '시설관리팀': 'Facility'
  }
  return mapping[department] || '경영지원'
}

// GET: 모든 직군 및 직급별 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fiscalYear = searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!)
      : new Date().getFullYear()

    // 기존 직급별 통계 데이터 조회
    const levelStats = await prisma.levelStatistics.findMany({
      where: { fiscalYear },
      orderBy: { level: 'asc' }
    })

    // 부서별 직원 데이터 조회
    const employees = await prisma.employee.findMany({
      select: {
        department: true,
        level: true,
        currentSalary: true
      }
    })

    // 직군별로 데이터 그룹핑
    const bandData = new Map<string, any>()
    const bandNames = ['생산기술', 'Facility', '경영지원', '기획', '구매&물류', '영업', '생산', '품질보증']
    
    // 초기화
    bandNames.forEach((bandName, index) => {
      bandData.set(bandName, {
        id: `band_${index + 1}`,
        name: bandName,
        displayOrder: index + 1,
        levels: new Map()
      })
    })

    // 직원 데이터를 직군×직급별로 집계
    employees.forEach(emp => {
      const band = mapDepartmentToBand(emp.department)
      const bandInfo = bandData.get(band)
      
      if (bandInfo) {
        if (!bandInfo.levels.has(emp.level)) {
          bandInfo.levels.set(emp.level, {
            level: emp.level,
            headcount: 0,
            totalSalary: 0,
            salaries: []
          })
        }
        
        const levelInfo = bandInfo.levels.get(emp.level)
        levelInfo.headcount++
        levelInfo.totalSalary += emp.currentSalary
        levelInfo.salaries.push(emp.currentSalary)
      }
    })

    // 직급별 통계 데이터 활용하여 보완
    const levelStatsMap = new Map(levelStats.map(stat => [stat.level, stat]))

    // 최종 데이터 구성
    const bands = Array.from(bandData.values()).map(band => {
      const levels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].map(level => {
        const levelData = band.levels.get(level) || { headcount: 0, totalSalary: 0, salaries: [] }
        const levelStat = levelStatsMap.get(level)
        
        // 평균 급여 계산
        const meanBasePay = levelData.headcount > 0 
          ? Math.round(levelData.totalSalary / levelData.headcount)
          : (levelStat ? Number(levelStat.averageSalary) : 0)
        
        // Base-up 계산 (직급별 통계의 평균 인상률 사용)
        const baseUpRate = levelStat ? levelStat.avgBaseUpPercentage / 100 : 0.032
        const baseUpKRW = Math.round(meanBasePay * baseUpRate)
        
        // 시장 벤치마크 데이터 생성 (실제로는 외부 데이터 필요)
        // 평균 급여를 기준으로 시장 분포 생성
        const marketMin = meanBasePay * 0.7
        const marketQ1 = meanBasePay * 0.85
        const marketMedian = meanBasePay * 0.95
        const marketQ3 = meanBasePay * 1.05
        const marketMax = meanBasePay * 1.25
        
        // 경쟁사 데이터 (CA)
        const competitorMedian = meanBasePay * (0.9 + Math.random() * 0.2)
        
        // SBL은 우리 회사 데이터
        const sblMedian = meanBasePay // 우리 회사 중위수
        const sblIndex = (sblMedian / marketMedian) * 100  // 시장 대비 우리 회사 수준
        const caIndex = (competitorMedian / marketMedian) * 100  // 시장 대비 경쟁사 수준
        
        return {
          level,
          headcount: levelData.headcount,
          meanBasePay,
          baseUpKRW,
          baseUpRate,
          sblIndex,
          caIndex,
          competitiveness: sblIndex,
          // 시장 벤치마크 데이터
          market: {
            min: marketMin,
            q1: marketQ1,
            median: marketMedian,
            q3: marketQ3,
            max: marketMax
          },
          // 우리 회사 데이터
          company: {
            median: sblMedian,
            mean: meanBasePay,
            values: levelData.salaries || []
          },
          // 경쟁사 데이터
          competitor: {
            median: competitorMedian
          }
        }
      })
      
      // 직군별 요약 계산
      const totalHeadcount = levels.reduce((sum, l) => sum + l.headcount, 0)
      const avgBaseUpRate = totalHeadcount > 0
        ? levels.reduce((sum, l) => sum + l.baseUpRate * l.headcount, 0) / totalHeadcount
        : 0
      const avgSBLIndex = totalHeadcount > 0
        ? levels.reduce((sum, l) => sum + l.sblIndex * l.headcount, 0) / totalHeadcount
        : 0
      const avgCAIndex = totalHeadcount > 0
        ? levels.reduce((sum, l) => sum + l.caIndex * l.headcount, 0) / totalHeadcount
        : 0
      const totalBudgetImpact = levels.reduce((sum, l) => sum + l.baseUpKRW * l.headcount, 0)
      
      return {
        id: band.id,
        name: band.name,
        displayOrder: band.displayOrder,
        totalHeadcount,
        avgBaseUpRate,
        avgSBLIndex,
        avgCAIndex,
        totalBudgetImpact,
        levels: levels.filter(l => l.headcount > 0 || l.meanBasePay > 0) // 데이터가 있는 레벨만 반환
      }
    })


    return NextResponse.json({
      success: true,
      data: {
        fiscalYear,
        bands,
        summary: {
          totalHeadcount: bands.reduce((sum, band) => sum + band.totalHeadcount, 0),
          totalBudgetImpact: bands.reduce((sum, band) => sum + band.totalBudgetImpact, 0),
          avgBaseUpRate: bands.length > 0
            ? bands.reduce((sum, band) => sum + band.avgBaseUpRate * band.totalHeadcount, 0) / 
              bands.reduce((sum, band) => sum + band.totalHeadcount, 0)
            : 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching bands:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bands data' },
      { status: 500 }
    )
  }
}

// POST: 새로운 직군 생성 (관리자 기능)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, displayOrder } = body

    const band = await prisma.band.create({
      data: {
        name,
        description,
        displayOrder: displayOrder || 999
      }
    })

    return NextResponse.json({
      success: true,
      data: band
    })
  } catch (error) {
    console.error('Error creating band:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create band' },
      { status: 500 }
    )
  }
}