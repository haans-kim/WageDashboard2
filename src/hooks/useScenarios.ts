'use client'

import { useState, useEffect } from 'react'
import { Scenario } from '@/types/scenario'

const STORAGE_KEY = 'wage-dashboard-scenarios'

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)

  // Load scenarios from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setScenarios(parsed.scenarios || [])
          setActiveScenarioId(parsed.activeScenarioId || null)
        } catch (error) {
          console.error('Failed to load scenarios:', error)
        }
      }
    }
  }, [])

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        scenarios,
        activeScenarioId
      }))
    }
  }, [scenarios, activeScenarioId])

  const saveScenario = (name: string, data: Scenario['data']) => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data
    }
    
    setScenarios(prev => [...prev, newScenario])
    setActiveScenarioId(newScenario.id)
    
    return newScenario
  }

  const updateScenario = (id: string, data: Partial<Scenario['data']>) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id === id) {
        return {
          ...scenario,
          data: { ...scenario.data, ...data },
          updatedAt: new Date().toISOString()
        }
      }
      return scenario
    }))
  }

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id))
    if (activeScenarioId === id) {
      setActiveScenarioId(null)
    }
  }

  const loadScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id)
    if (scenario) {
      setActiveScenarioId(id)
      return scenario.data
    }
    return null
  }

  const renameScenario = (id: string, newName: string) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id === id) {
        return {
          ...scenario,
          name: newName,
          updatedAt: new Date().toISOString()
        }
      }
      return scenario
    }))
  }

  return {
    scenarios,
    activeScenarioId,
    saveScenario,
    updateScenario,
    deleteScenario,
    loadScenario,
    renameScenario,
    setActiveScenarioId
  }
}