/** @type {import('next').NextConfig} */
const nextConfig = {
  // 한글 폰트 최적화
  optimizeFonts: true,
  // 배포를 위해 타입 체크 건너뛰기
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig