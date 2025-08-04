import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Scenario } from '@/types/scenario'

const SCENARIOS_DIR = path.join(process.cwd(), 'data', 'scenarios')
const SCENARIOS_FILE = path.join(SCENARIOS_DIR, 'scenarios.json')

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
    return JSON.parse(data)
  } catch (error) {
    // Return default data if file doesn't exist
    return {
      scenarios: [],
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
    
    // Add new scenario
    data.scenarios.push(newScenario)
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
    
    const data = await readScenarios()
    
    // Remove scenario
    data.scenarios = data.scenarios.filter(s => s.id !== id)
    
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