'use client'

import { useState, useEffect } from 'react'
import { Scenario } from '@/types/scenario'

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
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
        setScenarios(data.scenarios || [])
        setActiveScenarioId(data.activeScenarioId || null)
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error)
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
        const updatedScenarios = [...scenarios, newScenario]
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