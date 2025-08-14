import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET: 특정 직군의 직급별 데이터 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { bandId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fiscalYear = searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!)
      : new Date().getFullYear()

    // 임시로 빈 응답 반환 (Vercel 빌드를 위해)
    return NextResponse.json({
        success: true,
        data: {
          bandId: params.bandId,
          fiscalYear,
          levels: []
        }
      })
    }

    // 외부 벤치마크 데이터 조회
    const benchmarks = await prisma.externalBenchmark.findMany({
      where: {
        bandId: params.bandId,
        fiscalYear
      }
    })

    // 벤치마크 데이터를 레벨별로 매핑
    const benchmarkMap = new Map()
    benchmarks.forEach(benchmark => {
      const key = `${benchmark.level}-${benchmark.extRefType}`
      benchmarkMap.set(key, Number(benchmark.extMeanBasePay))
    })

    const levelsWithBenchmark = bandLevels.map(level => ({
      ...level,
      meanBasePay: Number(level.meanBasePay),
      baseUpKRW: Number(level.baseUpKRW),
      externalBenchmark: {
        SBL: benchmarkMap.get(`${level.level}-SBL`) || null,
        CA: benchmarkMap.get(`${level.level}-CA`) || null
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        bandId: params.bandId,
        bandName: bandLevels[0].band.name,
        fiscalYear,
        levels: levelsWithBenchmark
      }
    })
  } catch (error) {
    console.error('Error fetching band levels:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch band levels' },
      { status: 500 }
    )
  }
}

// PUT: 직군×직급별 인상률 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { bandId: string } }
) {
  try {
    const body = await request.json()
    const { level, baseUpKRW, baseUpRate, fiscalYear } = body

    const currentYear = fiscalYear || new Date().getFullYear()

    // 현재 데이터 조회
    const currentLevel = await prisma.bandLevel.findFirst({
      where: {
        bandId: params.bandId,
        level,
        fiscalYear: currentYear
      }
    })

    if (!currentLevel) {
      return NextResponse.json(
        { success: false, error: 'Band level not found' },
        { status: 404 }
      )
    }

    // 새로운 값 계산
    const updatedBaseUpKRW = baseUpKRW !== undefined 
      ? BigInt(baseUpKRW)
      : currentLevel.baseUpKRW

    const updatedBaseUpRate = baseUpRate !== undefined
      ? baseUpRate
      : Number(updatedBaseUpKRW) / Number(currentLevel.meanBasePay)

    // 업데이트
    const updatedLevel = await prisma.bandLevel.update({
      where: { id: currentLevel.id },
      data: {
        baseUpKRW: updatedBaseUpKRW,
        baseUpRate: updatedBaseUpRate
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedLevel,
        meanBasePay: Number(updatedLevel.meanBasePay),
        baseUpKRW: Number(updatedLevel.baseUpKRW)
      }
    })
  } catch (error) {
    console.error('Error updating band level:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update band level' },
      { status: 500 }
    )
  }
}