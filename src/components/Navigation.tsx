'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface NavigationProps {
  children?: ReactNode
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '대시보드' },
    { href: '/bands', label: 'Pay Band' },
    { href: '/simulation', label: '시뮬레이션' },
    { href: '/analytics', label: '분석' },
    { href: '/employees', label: '직원 관리' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 mr-8">인건비 대시보드</h1>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {/* 우측 버튼 영역 - 대시보드와 Pay Band 페이지에서 표시 */}
          {(pathname === '/' || pathname === '/bands') && children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}