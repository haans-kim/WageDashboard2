import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Scenario } from '@/types/scenario'

const SCENARIOS_DIR = path.join(process.cwd(), 'data', 'scenarios')
const SCENARIOS_FILE = path.join(SCENARIOS_DIR, 'scenarios.json')

// 기본 초기화 시나리오
const DEFAULT_SCENARIO: Scenario = {
  id: 'default',
  name: '초기화 (기본)',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  data: {
    baseUpRate: 3.2,
    meritRate: 2.5,
    levelRates: {
      'Lv.1': { baseUp: 3.2, merit: 2.5 },
      'Lv.2': { baseUp: 3.2, merit: 2.5 },
      'Lv.3': { baseUp: 3.2, merit: 2.5 },
      'Lv.4': { baseUp: 3.2, merit: 2.5 }
    },
    totalBudget: 30000000000,
    promotionBudgets: { lv1: 0, lv2: 0, lv3: 0, lv4: 0 },
    additionalBudget: 0,
    enableAdditionalIncrease: false,
    calculatedAdditionalBudget: 0,
    levelTotalRates: {
      'Lv.1': 5.7,
      'Lv.2': 5.7,
      'Lv.3': 5.7,
      'Lv.4': 5.7
    },
    weightedAverageRate: 5.7,
    meritWeightedAverage: 2.5,
    detailedLevelRates: {
      'Lv.4': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
      'Lv.3': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
      'Lv.2': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
      'Lv.1': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 }
    }
  }
}

interface ScenariosData {
  scenarios: Scenario[]
  activeScenarioId: string | null
}

async function ensureDirectoryExists() {
  try {
    await fs.mkdir(SCENARIOS_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create scenarios directory:', error)
  }
}

async function readScenarios(): Promise<ScenariosData> {
  try {
    await ensureDirectoryExists()
    const data = await fs.readFile(SCENARIOS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    
    // 기본 시나리오가 없으면 추가
    const hasDefault = parsed.scenarios.some((s: Scenario) => s.id === 'default')
    if (!hasDefault) {
      parsed.scenarios.unshift(DEFAULT_SCENARIO)
    }
    
    return parsed
  } catch (error) {
    // Return default data if file doesn't exist
    return {
      scenarios: [DEFAULT_SCENARIO],
      activeScenarioId: null
    }
  }
}

async function writeScenarios(data: ScenariosData): Promise<void> {
  await ensureDirectoryExists()
  await fs.writeFile(SCENARIOS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// GET /api/scenarios
export async function GET() {
  try {
    const data = await readScenarios()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to read scenarios:', error)
    return NextResponse.json({ error: 'Failed to read scenarios' }, { status: 500 })
  }
}

// POST /api/scenarios
export async function POST(request: NextRequest) {
  try {
    const newScenario: Scenario = await request.json()
    const data = await readScenarios()
    
    // 기본 시나리오를 제외한 시나리오들만 저장
    const nonDefaultScenarios = data.scenarios.filter(s => s.id !== 'default')
    
    // Add new scenario (기본 시나리오는 저장하지 않음)
    nonDefaultScenarios.push(newScenario)
    data.scenarios = nonDefaultScenarios
    data.activeScenarioId = newScenario.id
    
    await writeScenarios(data)
    
    return NextResponse.json({ success: true, scenario: newScenario })
  } catch (error) {
    console.error('Failed to save scenario:', error)
    return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 })
  }
}

// PUT /api/scenarios
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenarios, activeScenarioId } = body
    
    const data: ScenariosData = {
      scenarios: scenarios || [],
      activeScenarioId: activeScenarioId || null
    }
    
    await writeScenarios(data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update scenarios:', error)
    return NextResponse.json({ error: 'Failed to update scenarios' }, { status: 500 })
  }
}

// DELETE /api/scenarios/[id]
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 })
    }
    
    // 기본 시나리오는 삭제 불가
    if (id === 'default') {
      return NextResponse.json({ error: 'Cannot delete default scenario' }, { status: 400 })
    }
    
    const data = await readScenarios()
    
    // Remove scenario (기본 시나리오 제외)
    data.scenarios = data.scenarios.filter(s => s.id !== id && s.id !== 'default')
    
    // Update active scenario if deleted
    if (data.activeScenarioId === id) {
      data.activeScenarioId = null
    }
    
    await writeScenarios(data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete scenario:', error)
    return NextResponse.json({ error: 'Failed to delete scenario' }, { status: 500 })
  }
}