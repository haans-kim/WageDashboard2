'use client'

import { useState } from 'react'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { SimpleExportButton } from '@/components/ExportButton'

export default function EmployeesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')

  const levels = ['', 'Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
  const departments = ['', '영업1팀', '영업2팀', '개발팀', '인사팀', '재무팀', '마케팅팀']

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">직원 관리</h1>
            <p className="text-gray-600 mt-2">직원별 급여 정보 및 인상률 계산</p>
          </div>
          <SimpleExportButton />
        </header>

        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">필터</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직급
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level || '전체'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부서
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept || '전체'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <EmployeeTable 
          level={selectedLevel} 
          department={selectedDepartment}
        />
      </div>
    </main>
  )
}