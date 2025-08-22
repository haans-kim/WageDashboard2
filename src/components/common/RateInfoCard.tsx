'use client'

import { useWageContext } from '@/context/WageContext'

export function RateInfoCard() {
  const { baseUpRate, meritRate, levelRates } = useWageContext()
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* 주요 인상률 지표 */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {baseUpRate.toFixed(2)}
                  </span>
                  <span className="text-base text-slate-900 font-medium">%</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">Base-up</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {meritRate.toFixed(2)}
                  </span>
                  <span className="text-base text-slate-900 font-medium">%</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">성과 인상률</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-indigo-700">
                    {(baseUpRate + meritRate).toFixed(2)}
                  </span>
                  <span className="text-base text-indigo-700 font-medium">%</span>
                </div>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">총 인상률</p>
              </div>
            </div>
          </div>
          
          {/* 직급별 인상률 */}
          <div className="md:border-l md:pl-6 border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">직급별 인상률</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(levelRates)
                .sort((a, b) => {
                  const aNum = parseInt(a[0].replace('Lv.', ''))
                  const bNum = parseInt(b[0].replace('Lv.', ''))
                  return aNum - bNum
                })
                .map(([level, rates]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">{level}</span>
                  <span className="text-sm font-bold text-slate-900">
                    {(rates.baseUp + rates.merit).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}