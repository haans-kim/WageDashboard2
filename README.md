# 📊 인건비 대시보드 (Wage Dashboard)

> 실시간 급여 관리 및 인상률 시뮬레이션을 위한 통합 대시보드

## 🌟 주요 기능

### 1. 📈 대시보드 (Dashboard)
- **AI 기반 인상률 추천**: Base-up과 Merit 인상률 자동 제안
- **예산 현황 모니터링**: 실시간 예산 사용률 및 잔여 예산 확인
- **직급별 세부 인상률 조정**: Lv.1~Lv.4 각 직급별 맞춤 인상률 설정
- **C사 대비 경쟁력 분석**: 경쟁사 대비 보상 수준 비교 차트

### 2. 💼 Pay Band 분석 (Bands)
- **8개 직군별 급여 현황**: 생산, 영업, 생산기술, 경영지원, 품질보증, 기획, 구매&물류, Facility
- **직군×직급 매트릭스 분석**: 상세 급여 분포 및 편차 분석
- **경쟁력 지수 시각화**: C사 대비 SBL/CA 지수 히트맵
- **시장 포지셔닝**: 업계 평균 대비 위치 분석

### 3. 👥 직원 관리 (Employees)
- **4,900명+ 직원 데이터 관리**: 실시간 검색 및 필터링
- **개인별 급여 계산**: 성과 가중치 반영 자동 계산
- **성과 등급 관리**: S/A/B/C 등급별 가중치 적용
- **Excel 내보내기**: 분석 결과 다운로드 기능

### 4. 🔮 시뮬레이션 (Simulation)
- **What-if 분석**: 다양한 시나리오별 영향도 분석
- **시나리오 비교**: 여러 안을 동시에 비교 검토
- **독립 모드**: 실제 데이터 영향 없이 테스트

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- 모던 브라우저 (Chrome, Edge, Safari, Firefox)

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/Yarnoo-git/WageDashboard_YW.git
cd WageDashboard2
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 열기**
```
http://localhost:3000
```

## 📁 Excel 데이터 구조

### 필수 시트 구성

#### 1. 직원기본정보 시트
| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| 사번 | 직원 고유 번호 | EMP00001 |
| 이름 | 직원 성명 | 홍길동 |
| 부서 | 소속 부서 | 생산1팀 |
| 직군 | 8개 직군 중 하나 | 생산 |
| 직급 | Lv.1~Lv.4 | Lv.3 |
| 직책 | 직책명 | 과장 |
| 입사일 | YYYY-MM-DD 형식 | 2020-03-15 |
| 현재연봉 | 원 단위 | 65000000 |
| 평가등급 | S/A/B/C | A |

#### 2. C사데이터 시트
| 직군 | Lv.1 | Lv.2 | Lv.3 | Lv.4 |
|------|------|------|------|------|
| 생산 | 50520 | 67833 | 90194 | 101921 |
| 영업 | 51673 | 69438 | 92115 | 110328 |
| ... | ... | ... | ... | ... |

*단위: 천원*

#### 3. AI설정 시트
| 항목 | 값 | 설명 |
|------|-----|------|
| Base-up(%) | 3.2 | 기본 인상률 |
| 성과인상률(%) | 2.5 | Merit 인상률 |
| 총인상률(%) | 5.7 | 전체 인상률 |
| 최소범위(%) | 5.7 | 최소 권장 범위 |
| 최대범위(%) | 5.9 | 최대 권장 범위 |

#### 4. C사인상률 시트
| 항목 | 값 | 설명 |
|------|-----|------|
| C사 인상률(%) | 8.3 | C사 평균 인상률 |

## 💡 주요 사용 시나리오

### 시나리오 1: 연간 급여 인상 계획
1. Excel 파일 업로드 (홈 화면)
2. 대시보드에서 AI 추천 인상률 확인
3. 직급별 세부 조정
4. 예산 영향 실시간 확인
5. 최종안 저장 및 내보내기

### 시나리오 2: 직군별 경쟁력 분석
1. Pay Band 페이지 접속
2. 직군별 현재 수준 확인
3. C사 대비 갭 분석
4. 취약 직군 식별
5. 맞춤형 인상안 수립

### 시나리오 3: 개인별 급여 조정
1. 직원 관리 페이지 접속
2. 대상 직원 검색/필터
3. 성과 등급 조정
4. TO-BE 급여 자동 계산
5. 개인별 조정안 Excel 출력

## 🔧 개발자 가이드

### 프로젝트 구조
```
/src
├── /app              # Next.js App Router
│   ├── /dashboard   # 대시보드 페이지
│   ├── /bands       # Pay Band 분석
│   ├── /employees   # 직원 관리
│   └── /simulation  # 시뮬레이션
├── /components      # React 컴포넌트
├── /context         # 전역 상태 관리 (WageContext)
├── /hooks           # 커스텀 훅
├── /lib             # 유틸리티 함수
├── /services        # 데이터 서비스
└── /utils           # 계산 로직
```

### 주요 기술 스택
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4
- **Charts**: Recharts 3.1
- **Data**: IndexedDB + localStorage
- **Excel**: xlsx 라이브러리

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm run start

# Vercel 배포 (자동)
git push origin main
```

## 📊 성과 가중치 시스템

| 등급 | 가중치 | 설명 |
|------|--------|------|
| S | 1.5 | 최우수 성과 |
| A | 1.2 | 우수 성과 |
| B | 1.0 | 보통 성과 |
| C | 0.8 | 개선 필요 |

**계산식**: 
```
최종 Merit = 기본 Merit(%) × 성과 가중치
```

## 🔐 데이터 보안

- 모든 데이터는 **브라우저 로컬**에만 저장
- 서버 전송 없음 (No Backend)
- IndexedDB 암호화 저장
- 세션 종료 시 선택적 삭제

## 📝 버전 히스토리

### v1.1.2 (2024-08-16)
- ✅ Vercel 빌드 타입 에러 수정
- ✅ WageContext 시나리오 로드 안정성 개선
- ✅ README 문서 전면 개편

### v1.1.1 (2024-08-16)
- ✅ TypeScript 타입 호환성 개선
- ✅ 시나리오 저장/불러오기 오류 수정

### v1.1.0 (2024-08-16)
- ✨ C사 인상률 실시간 반영
- ✨ 시나리오 관리 기능 추가
- ✨ 직급별 세부 조정 기능

### v1.0.0 (2024-08-15)
- 🎉 최초 배포
- 📊 기본 대시보드 구현
- 👥 직원 데이터 관리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의 및 지원

- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/Yarnoo-git/WageDashboard_YW/issues)
- **Email**: losica97@naver.com

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**Made with ❤️ by Yarnoo-git**

*실시간 인건비 관리의 새로운 기준을 제시합니다.*