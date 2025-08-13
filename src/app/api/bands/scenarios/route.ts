import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 시나리오 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fiscalYear = searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!)
      : new Date().getFullYear()

    const scenarios = await prisma.payBandScenario.findMany({
      where: { fiscalYear },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: scenarios.map(scenario => ({
        ...scenario,
        budgetCap: scenario.budgetCap ? Number(scenario.budgetCap) : null
      }))
    })
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenarios' },
      { status: 500 }
    )
  }
}

// POST: 새 시나리오 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      scenarioName,
      weightPerf = 0.6,
      weightBase = 0.4,
      budgetCap,
      competitivenessTarget = 'SBL',
      fiscalYear = new Date().getFullYear(),
      createdBy,
      note,
      bandAdjustments = [] // 직군×직급별 조정 데이터
    } = body

    // 시나리오 ID 생성
    const scenarioId = `SCN_${fiscalYear}_${Date.now()}`

    // 현재 직군 레벨 데이터 조회
    const currentBandLevels = await prisma.bandLevel.findMany({
      where: { fiscalYear },
      include: { band: true }
    })

    // 조정된 값 적용 및 계산
    let totalBudgetImpact = 0
    let totalHeadcount = 0
    const adjustmentMap = new Map()
    
    bandAdjustments.forEach((adj: any) => {
      adjustmentMap.set(`${adj.bandId}-${adj.level}`, adj.baseUpRate)
    })

    currentBandLevels.forEach(level => {
      const key = `${level.bandId}-${level.level}`
      const adjustedRate = adjustmentMap.get(key) || level.baseUpRate
      const impact = Number(level.meanBasePay) * adjustedRate * level.headcount
      totalBudgetImpact += impact
      totalHeadcount += level.headcount
    })

    // 평균 인상률 계산
    const avgIncrease = totalHeadcount > 0 
      ? totalBudgetImpact / (currentBandLevels.reduce((sum, l) => 
          sum + Number(l.meanBasePay) * l.headcount, 0))
      : 0

    // 시나리오 저장
    const scenario = await prisma.payBandScenario.create({
      data: {
        scenarioId,
        scenarioName,
        currency: 'KRW',
        rounding: 100,
        weightPerf,
        weightBase,
        budgetCap: budgetCap ? BigInt(budgetCap) : null,
        avgIncreaseSBL: competitivenessTarget === 'SBL' ? avgIncrease : null,
        avgIncreaseCA: competitivenessTarget === 'CA' ? avgIncrease : null,
        competitivenessTarget,
        fiscalYear,
        createdBy,
        note
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...scenario,
        budgetCap: scenario.budgetCap ? Number(scenario.budgetCap) : null,
        totalBudgetImpact,
        adjustments: bandAdjustments
      }
    })
  } catch (error) {
    console.error('Error creating scenario:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create scenario' },
      { status: 500 }
    )
  }
}