# 인건비 대시보드 (Wage Dashboard)

실시간 인상률 조정 및 인건비 배분 최적화를 위한 대시보드 애플리케이션

## 🚀 Vercel 배포 가이드

### 방법 1: Vercel CLI 사용 (추천)

1. **Vercel CLI 설치**
```bash
npm i -g vercel
```

2. **Vercel 로그인**
```bash
vercel login
```

3. **프로젝트 배포**
```bash
vercel
```

첫 배포 시 프로젝트 설정을 물어봅니다:
- Set up and deploy? **Y**
- Which scope? **개인 계정 선택**
- Link to existing project? **N** (새 프로젝트)
- Project name? **wage-dashboard** (또는 원하는 이름)
- In which directory is your code? **./** (현재 디렉토리)
- Want to modify settings? **N**

### 방법 2: GitHub 연동 (자동 배포)

1. GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wage-dashboard.git
git push -u origin main
```

2. [Vercel 대시보드](https://vercel.com/new) 접속
3. "Import Git Repository" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정 (아래 참고)
6. "Deploy" 클릭

### 🔐 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```
DATABASE_URL=file:./dev.db
```

### 📁 프로젝트 구조

```
WageDashboard/
├── src/
│   ├── app/           # Next.js 앱 라우터 페이지
│   ├── components/    # React 컴포넌트
│   ├── hooks/         # 커스텀 React 훅
│   ├── lib/           # 유틸리티 함수
│   └── types/         # TypeScript 타입 정의
├── prisma/            # 데이터베이스 스키마
├── public/            # 정적 파일
└── vercel.json        # Vercel 배포 설정
```

### 🛠️ 로컬 개발

```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npm run db:generate
npm run db:push
npm run db:seed

# 개발 서버 실행
npm run dev
```

### 📱 주요 기능

- **AI 기반 인상률 추천**: Base-up과 Merit 인상률 자동 계산
- **시나리오 관리**: 다양한 인상 시나리오 저장 및 비교
- **정액 인상 권장 범위**: 커스터마이징 가능한 인상 범위 설정
- **실시간 예산 추적**: 예산 사용률 및 활용도 모니터링
- **직급별 분석**: 직급별 인상률 개별 조정 가능
- **고급 분석**: 직급별, 부서별 상세 분석 차트

### 🔗 배포 후 확인사항

1. **데이터베이스 초기화**: 첫 배포 후 `/api/health` 엔드포인트로 DB 상태 확인
2. **시드 데이터**: 필요시 Vercel 함수를 통해 시드 데이터 추가
3. **성능 모니터링**: Vercel Analytics 활용

### 📝 추가 설정 (선택사항)

- **커스텀 도메인**: Vercel 대시보드에서 도메인 추가
- **환경별 설정**: Production/Preview 환경별 환경 변수 설정
- **팀 협업**: Vercel 팀 계정으로 협업 관리

---

배포 관련 문의사항이 있으시면 Issue를 생성해주세요!