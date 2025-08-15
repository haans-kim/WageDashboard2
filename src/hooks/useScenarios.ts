'use client'

import { useState, useEffect } from 'react'
import { Scenario } from '@/types/scenario'

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

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([DEFAULT_SCENARIO])
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load scenarios from API on mount
  useEffect(() => {
    loadScenariosFromAPI()
  }, [])

  const loadScenariosFromAPI = async () => {
    try {
      const response = await fetch('/api/scenarios')
      if (response.ok) {
        const data = await response.json()
        // API에서 불러온 시나리오에 기본 시나리오 추가
        const loadedScenarios = data.scenarios || []
        // 기본 시나리오가 없으면 추가
        const hasDefault = loadedScenarios.some((s: Scenario) => s.id === 'default')
        if (!hasDefault) {
          setScenarios([DEFAULT_SCENARIO, ...loadedScenarios])
        } else {
          setScenarios(loadedScenarios)
        }
        setActiveScenarioId(data.activeScenarioId || null)
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error)
      // API 실패시에도 기본 시나리오는 유지
      setScenarios([DEFAULT_SCENARIO])
    } finally {
      setLoading(false)
    }
  }

  const saveToAPI = async (scenariosData: Scenario[], activeId: string | null) => {
    try {
      await fetch('/api/scenarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarios: scenariosData,
          activeScenarioId: activeId
        })
      })
    } catch (error) {
      console.error('Failed to save scenarios:', error)
    }
  }

  const saveScenario = async (name: string, data: Scenario['data']) => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data
    }
    
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newScenario)
      })
      
      if (response.ok) {
        // 기본 시나리오는 항상 첫 번째 위치 유지
        const nonDefaultScenarios = scenarios.filter(s => s.id !== 'default')
        const updatedScenarios = [DEFAULT_SCENARIO, ...nonDefaultScenarios, newScenario]
        setScenarios(updatedScenarios)
        setActiveScenarioId(newScenario.id)
      }
    } catch (error) {
      console.error('Failed to save scenario:', error)
    }
    
    return newScenario
  }

  const updateScenario = async (id: string, data: Partial<Scenario['data']>) => {
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === id) {
        return {
          ...scenario,
          data: { ...scenario.data, ...data },
          updatedAt: new Date().toISOString()
        }
      }
      return scenario
    })
    
    setScenarios(updatedScenarios)
    await saveToAPI(updatedScenarios, activeScenarioId)
  }

  const deleteScenario = async (id: string) => {
    // 기본 시나리오는 삭제 불가
    if (id === 'default') {
      console.warn('Cannot delete default scenario')
      return
    }
    
    try {
      const response = await fetch(`/api/scenarios?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const updatedScenarios = scenarios.filter(s => s.id !== id)
        const newActiveId = activeScenarioId === id ? null : activeScenarioId
        
        setScenarios(updatedScenarios)
        setActiveScenarioId(newActiveId)
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error)
    }
  }

  const loadScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id)
    if (scenario) {
      setActiveScenarioId(id)
      saveToAPI(scenarios, id)
      return scenario.data
    }
    return null
  }

  const renameScenario = async (id: string, newName: string) => {
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === id) {
        return {
          ...scenario,
          name: newName,
          updatedAt: new Date().toISOString()
        }
      }
      return scenario
    })
    
    setScenarios(updatedScenarios)
    await saveToAPI(updatedScenarios, activeScenarioId)
  }

  return {
    scenarios,
    activeScenarioId,
    saveScenario,
    updateScenario,
    deleteScenario,
    loadScenario,
    renameScenario,
    setActiveScenarioId,
    loading
  }
}