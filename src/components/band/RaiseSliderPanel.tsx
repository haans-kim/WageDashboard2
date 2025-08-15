'use client'

import React from 'react'
import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'

interface RaiseSliderPanelProps {
  bandId: string
  baseUpRate: number
  additionalRate: number
  meritMultipliers: {
    'Lv.1': number
    'Lv.2': number
    'Lv.3': number
    'Lv.4': number
  }
  onBaseUpChange: (value: number) => void
  onAdditionalChange: (value: number) => void
  onMeritMultiplierChange: (level: string, value: number) => void
  onReset?: () => void
  budgetImpact?: number
}

export function RaiseSliderPanel({
  bandId,
  baseUpRate,
  additionalRate,
  meritMultipliers,
  onBaseUpChange,
  onAdditionalChange,
  onMeritMultiplierChange,
  onReset,
  budgetImpact = 0
}: RaiseSliderPanelProps) {
  return (
    <div className="w-full space-y-4">
      {/* Base-up 슬라이더 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <label className="text-base font-semibold text-gray-700">Base-up (전체)</label>
          <span className="text-base font-bold text-primary-600">
            {formatPercentage(baseUpRate * 100)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={baseUpRate * 100}
          onChange={(e) => onBaseUpChange(parseFloat(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-primary"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>0%</span>
          <span>5%</span>
          <span>10%</span>
        </div>
      </div>

      {/* 추가인상 슬라이더 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <label className="text-base font-semibold text-gray-700">추가인상 (전체)</label>
          <span className="text-base font-bold text-green-600">
            {formatPercentage(additionalRate * 100)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={additionalRate * 100}
          onChange={(e) => onAdditionalChange(parseFloat(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${additionalRate * 20}%, #e5e7eb ${additionalRate * 20}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>0%</span>
          <span>2.5%</span>
          <span>5%</span>
        </div>
      </div>

      {/* 성과인상 배수 슬라이더 (직급별) */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <h4 className="text-base font-semibold text-gray-700 mb-3">성과인상 배수 (직급별)</h4>
        <div className="space-y-3">
          {Object.entries(meritMultipliers).reverse().map(([level, multiplier]) => (
            <div key={level}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-600">{level}</label>
                <span className="text-sm font-bold text-blue-600">×{multiplier.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={multiplier}
                onChange={(e) => onMeritMultiplierChange(level, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${multiplier * 50}%, #e5e7eb ${multiplier * 50}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-0.5">
                <span>×0</span>
                <span>×1</span>
                <span>×2</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 예산 영향 표시 */}
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-700">예산 영향</span>
          <span className="text-xl font-bold text-yellow-700">
            +{formatKoreanCurrency(budgetImpact, '억원', 100000000)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          인상률 조정에 따른 추가 예산
        </p>
      </div>
    </div>
  )
}