# 인건비 대시보드 (Wage Dashboard)

실시간 인상률 조정 및 인건비 배분 최적화를 위한 대시보드 애플리케이션

## 🎯 주요 기능

### 1. 홈 화면 (`/home`)
- 종합 대시보드 뷰
- AI 기반 인상률 추천 (Base-up: 3.2%, Merit: 2.5%)
- 인건비 예산 현황 시각화
- 직급별 인상률 분포
- 실시간 예산 활용도 모니터링

### 2. 대시보드 (`/dashboard`)
- **AI 추천 인상률**: 자동 계산된 Base-up 및 Merit 인상률
- **예산 자원 관리**: 총 319억 예산 관리 및 활용도 추적
- **정액 인상 권장 범위**: 직급별 커스터마이징 가능한 인상 범위
- **직급별 급여 조정 테이블**: 상세 인상률 입력 및 시뮬레이션
- **간접비 영향 분석**: 인건비 변동에 따른 간접비 예측

### 3. Pay Band 관리 (`/bands`)
- **직군별 급여 밴드 분석**
  - 엔지니어링, 영업, 지원, 제조 직군별 관리
  - 직군별 Base-up/Merit 조정 슬라이더 (-2% ~ +2%)
- **경쟁력 히트맵**: 시장 대비 급여 경쟁력 시각화
- **Box Plot 차트**: 직급별 급여 분포 분석
- **시나리오 비교**: 다양한 인상 시나리오 저장 및 비교

### 4. 직원 관리 (`/employees`)
- **직원 목록 및 상세 정보**
- **개인별 TO-BE 급여 계산**
- **성과 가중치 설정**
- **엑셀 데이터 업로드/다운로드**
- **직원별 상세 페이지** (`/employees/[id]`)

### 5. 고급 분석 (`/analytics`)
- **부서별 비교 차트**: 부서간 급여 인상률 비교
- **직급별 성과 히트맵**: 성과 등급별 분포 시각화
- **Pay Band 경쟁력 분석**: 시장 대비 포지셔닝
- **성과-급여 상관관계**: 성과와 급여 인상의 관계 분석
- **근속 연수 분석**: 근속기간별 급여 트렌드
- **급여 분포 차트**: 전체 조직의 급여 분포 현황

### 6. 시뮬레이션 (`/simulation`)
- **What-if 시나리오 분석**
- **예산 영향도 계산**
- **시나리오 저장 및 관리**
- **시뮬레이션 결과 비교**

### 7. 시스템 설정 (`/system`)
- **데이터 관리**: 업로드된 데이터 삭제
- **시스템 정보**: 버전 및 상태 확인

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/Yarnoo-git/WageDashboard_YW.git
cd WageDashboard_YW

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 접속
http://localhost:3000
```

### 빌드 및 프로덕션 실행

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📦 기술 스택

- **Framework**: Next.js 14.2.31 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 3.1
- **Excel**: XLSX 0.18.5
- **PDF Export**: jspdf 3.0.1 + html2canvas 1.4.1
- **Testing**: Jest + React Testing Library

## 📁 프로젝트 구조

```
WageDashboard2/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   │   ├── home/         # 홈 화면
│   │   ├── dashboard/    # 메인 대시보드
│   │   ├── bands/        # Pay Band 관리
│   │   ├── employees/    # 직원 관리
│   │   ├── analytics/    # 고급 분석
│   │   ├── simulation/   # 시뮬레이션
│   │   ├── system/       # 시스템 설정
│   │   └── api/          # API 라우트
│   ├── components/       # React 컴포넌트
│   │   ├── dashboard/    # 대시보드 컴포넌트
│   │   ├── band/         # Pay Band 컴포넌트
│   │   ├── employees/    # 직원 관련 컴포넌트
│   │   ├── analytics/    # 분석 차트 컴포넌트
│   │   ├── simulation/   # 시뮬레이션 컴포넌트
│   │   └── charts/       # 공통 차트 컴포넌트
│   ├── context/          # React Context (상태 관리)
│   ├── hooks/            # 커스텀 React Hooks
│   ├── lib/              # 유틸리티 함수
│   ├── services/         # 비즈니스 로직 서비스
│   ├── scripts/          # 유틸리티 스크립트
│   └── types/            # TypeScript 타입 정의
├── public/               # 정적 파일
├── tests/                # 테스트 파일
└── CLAUDE.md            # AI 어시스턴트 가이드

```

## 🔧 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린팅
npm run lint

# 테스트 실행
npm run test

# 테스트 감시 모드
npm run test:watch

# 테스트 커버리지
npm run test:coverage

# 더미 엑셀 파일 생성
npm run generate:excel

# 테스트용 엑셀 파일 생성
npm run generate:test-excel
```

## 🌐 Vercel 배포

### GitHub 자동 배포 설정 (추천)

1. **GitHub에 푸시**
```bash
git add .
git commit -m "Update"
git push origin main
```

2. **Vercel과 연동**
- [Vercel 대시보드](https://vercel.com) 접속
- "Import Git Repository" 클릭
- GitHub 저장소 선택
- 자동 배포 설정 완료

### Vercel CLI를 통한 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

## 📊 데이터 형식

### 엑셀 업로드 형식
엑셀 파일은 다음 컬럼을 포함해야 합니다:
- 이름 (Name)
- 직급 (Level): Lv.1, Lv.2, Lv.3, Lv.4
- 부서 (Department)
- 직군 (Band): 엔지니어링, 영업, 지원, 제조
- 성과등급 (Performance): S, A, B, C, D
- 현재급여 (Current Salary)
- 근속연수 (Tenure)

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크/라이트 모드**: 사용자 선호도에 따른 테마 (개발 예정)
- **실시간 업데이트**: Context API를 통한 상태 동기화
- **차트 인터랙션**: 호버, 클릭 등 인터랙티브 차트
- **한국어 최적화**: 한국어 UI 및 숫자 포맷팅

## 🔒 보안 고려사항

- 민감한 급여 정보는 서버 사이드에서만 처리
- 클라이언트 사이드 데이터는 세션 기반 관리
- 역할 기반 접근 제어 (RBAC) 구현 예정
- 감사 로깅 기능 구현 예정

## 📈 성능 최적화

- Next.js 자동 코드 스플리팅
- 이미지 최적화 (Next/Image)
- 정적 페이지 사전 렌더링
- API 라우트 캐싱
- React 컴포넌트 메모이제이션

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 비공개 소프트웨어입니다. 무단 복제 및 배포를 금지합니다.

## 👥 개발팀

- **프로젝트 리드**: Yarnoo
- **개발**: WageDashboard Team

## 📞 문의사항

프로젝트 관련 문의사항은 GitHub Issues를 통해 등록해주세요.

---

**Version**: 0.1.0  
**Last Updated**: 2025-08-15  
**Status**: Production Ready 🚀