# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wage Dashboard (인건비 대시보드) project for displaying real-time salary metrics, compensation planning, and wage distribution analysis. The dashboard is designed to show Korean wage data with various visualizations and metrics.

## Current Architecture

### Technology Stack (실제 구현)
- **Frontend Framework**: Next.js 14.2 (App Router)
- **UI Library**: React 18.3 + TypeScript 5
- **Styling**: TailwindCSS 3.4 with Pretendard font
- **Charts**: Recharts 3.1
- **Data Storage**: Client-side only (IndexedDB + localStorage)
- **File Processing**: xlsx for Excel, jsPDF for PDF export
- **Testing**: Jest + React Testing Library

### Data Flow Architecture
1. **Client-Side First**: All data processing happens in the browser
2. **No Database**: Uses IndexedDB for persistent storage
3. **Excel-Based**: Primary data source is Excel file upload
4. **Server-Less**: Minimal API routes, mainly for data transformation

## Key Features (현재 구현 상태)

1. **AI-Based Wage Planning** (AI 제안 적정 인상률)
   - Base-up/Merit percentages loaded from Excel
   - Default values: 0% (changed from hardcoded 3.2%/2.5%)
   - Dynamic calculation based on uploaded data

2. **Budget Management** (예산 관리)
   - Total budget from Excel data
   - Default: 0원 (changed from hardcoded 300억원)
   - Indirect costs: 17.8% (retirement 4.5% + insurance 11.3% + pension 2.0%)

3. **Performance Weights** (평가 가중치)
   - S: 1.5, A: 1.2, B: 1.0, C: 0.8 (필수 유지)
   - Applied to merit increase calculations

4. **Data Sources**
   - Employee data from Excel
   - Competitor (C사) data from Excel
   - All calculations done client-side

## Development Setup Commands

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start development server (http://localhost:3000)

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Excel Generation (for testing)
npm run generate:excel      # Generate dummy Excel file
npm run generate:test-excel # Generate test Excel file
```

## Project Structure

```
/src
├── /app              # Next.js App Router pages
│   ├── /api         # API routes (minimal usage)
│   ├── /dashboard   # Main dashboard page
│   ├── /bands       # Pay band analysis
│   ├── /employees   # Employee management
│   └── /simulation  # Wage simulation
├── /components      # React components
│   ├── /dashboard   # Dashboard-specific components
│   ├── /band        # Pay band components
│   └── /charts      # Chart components
├── /context         # React Context (WageContext)
├── /hooks           # Custom hooks
├── /lib             # Utility functions
│   └── clientStorage.ts # IndexedDB management
├── /services        # Data services
│   └── employeeDataService.ts # Excel data processing
└── /utils           # Calculation utilities
```

## Data Flow

1. **Excel Upload** → `useClientExcelData` hook
2. **IndexedDB Storage** → `clientStorage.ts`
3. **Context Distribution** → `WageContext`
4. **Component Rendering** → Dashboard/Bands/Employees pages
5. **Export** → PDF/Excel generation

## Important Implementation Notes

- **No Server Database**: All data stored in browser (IndexedDB)
- **Excel as Primary Source**: All data comes from Excel upload
- **Dynamic Calculations**: All values calculated from Excel data
- **Zero Defaults**: Most values default to 0 until Excel is uploaded
- **Client-Side Processing**: Heavy calculations done in browser

## Korean Language Support

- UTF-8 encoding throughout
- Pretendard font for Korean text
- Number formatting: `toLocaleString('ko-KR')`
- Currency: 원, 만원, 억원 units

## Current Limitations & Known Issues

1. **No Pagination**: All 4,925+ employees render at once (performance issue)
2. **No Error Boundaries**: Missing global error handling
3. **Test Coverage**: Some tests still reference removed Prisma mocks
4. **Hardcoded Values**: Some indirect cost rates (17.8%) still hardcoded

## Environment Variables (Optional)

```bash
# .env.local (example)
NEXT_PUBLIC_BASE_UP_PERCENTAGE=0
NEXT_PUBLIC_MERIT_INCREASE_PERCENTAGE=0
NEXT_PUBLIC_TOTAL_BUDGET=0
NEXT_PUBLIC_TOTAL_EMPLOYEES=0
```

Note: Currently not implemented, values are loaded from Excel

## Pages Overview

### 1. Home (`/home`)
- Excel file upload interface
- Stored data management
- Entry point to dashboard

### 2. Dashboard (`/dashboard`)
- AI recommendation display
- Budget status monitoring
- Level-wise salary adjustment
- Industry comparison

### 3. Pay Bands (`/bands`)
- 8 bands (생산, 영업, 생산기술, 경영지원, 품질보증, 기획, 구매&물류, Facility)
- Band×Level matrix analysis
- Competitiveness index (SBL/CA)
- Market positioning

### 4. Employees (`/employees`)
- Employee list with filters
- Individual salary calculations
- Performance weight management
- Export functionality

### 5. Simulation (`/simulation`)
- What-if analysis
- Scenario comparison
- Independent mode for testing

## Key Algorithms

### Merit Calculation
```typescript
merit = baseSalary * meritRate * performanceWeight[rating]
```

### Budget Calculation
```typescript
directCost = totalSalary * (baseUp + merit) / 100
indirectCost = directCost * 0.178
totalBudget = directCost + indirectCost
```

### Competitiveness Index
```typescript
competitiveness = (ourAvgSalary / competitorAvgSalary) * 100
```