# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wage Dashboard (인건비 대시보드) project for displaying real-time salary metrics, compensation planning, and wage distribution analysis. The dashboard is designed to show Korean wage data with various visualizations and metrics.

## Key Features Based on Requirements

1. **AI-Based Wage Planning** (AI 제안 적정 인상률)
   - Base-up percentage: 3.2%
   - Merit increase percentage: 2.5%
   - Total wage increase: 5.7% (Range: 5.7%~5.9%)

2. **Wage Forecast Analysis** (인상 재원 예산 현황)
   - Total budget: 319억 원
   - Base salary: 189억 원
   - Breakdown by employee categories (171명, 43명, 39명)
   - Percentage allocations (79%, 54%, 13%, 12%)

3. **Performance-Based Compensation** (정액 인상 권장 범위)
   - Maximum: 98만 원/연
   - Average: 100만 원/연
   - Minimum: 120만 원/연

4. **Employee Level Distribution** (직급별 분석)
   - Level 1-4 with different wage increase percentages
   - Base-up and Merit increase calculations
   - Total compensation tracking

## Recommended Technology Stack

Since no code exists yet, here are recommended approaches for building this dashboard:

### Frontend Options
1. **React + TypeScript** with Material-UI or Ant Design for Korean UI support
2. **Next.js** for server-side rendering and better SEO
3. **Vue.js** with Vuetify for rapid development

### Backend Options
1. **Node.js + Express** for REST API
2. **Python + FastAPI** for data processing capabilities
3. **Java + Spring Boot** for enterprise-grade applications

### Database
- PostgreSQL or MySQL for structured wage data
- Redis for caching real-time calculations

### Visualization Libraries
- Chart.js or Recharts for React
- D3.js for custom visualizations
- Apache ECharts for comprehensive charting

## Development Setup Commands (To be updated when technology is chosen)

```bash
# After technology selection, add commands like:
# npm install
# npm run dev
# npm test
# npm run build
```

## Data Structure Considerations

The dashboard will need to handle:
- Employee hierarchy (Levels 1-4)
- Wage components (Base salary, Merit increase, Total compensation)
- Department/division data
- Historical wage data for trend analysis
- Budget allocation and forecasting

## Korean Language Support

- Ensure proper UTF-8 encoding throughout the application
- Use Korean-friendly fonts (Noto Sans KR, Spoqa Han Sans)
- Implement proper number formatting for Korean currency (원)
- Consider right-to-left text alignment for numbers in tables

## Security Considerations

- Implement role-based access control for sensitive wage data
- Encrypt salary information in transit and at rest
- Add audit logging for all data access
- Use environment variables for configuration

## Performance Requirements

- Dashboard should load within 2 seconds
- Real-time calculations should update within 500ms
- Support concurrent users viewing different department data
- Implement data pagination for large employee lists