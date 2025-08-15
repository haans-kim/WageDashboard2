/** @type {import('next').NextConfig} */
const nextConfig = {
  // 한글 폰트 최적화
  optimizeFonts: true,
  // 타입 체크 활성화 (에러 수정 후)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig