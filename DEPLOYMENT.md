# 개인회생 신청서 자동 생성 시스템 - Vercel 배포 가이드

## 🚀 Vercel 배포 단계별 가이드

### 1단계: Vercel 계정 생성
1. [Vercel 웹사이트](https://vercel.com) 접속
2. GitHub 계정으로 회원가입 (무료)

### 2단계: GitHub 저장소 연결 (추천)
```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub에 저장소 생성 후
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 3단계: Vercel에서 프로젝트 Import
1. Vercel 대시보드에서 "Add New Project" 클릭
2. GitHub 저장소 선택
3. Framework Preset: Next.js (자동 감지됨)
4. Root Directory: `./` (기본값)
5. Build Command: `npm run build` (기본값)
6. Output Directory: `.next` (기본값)

### 4단계: 환경변수 설정
Vercel 프로젝트 설정 > Environment Variables에서 다음 추가:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 5단계: 배포
"Deploy" 버튼 클릭 → 자동 배포 시작 (약 2-3분 소요)

배포 완료 후 URL: `https://your-project-name.vercel.app`

---

## 🌐 커스텀 도메인 연결

### 도메인 구매처별 설정

#### 가비아 (Gabia)
1. Vercel 프로젝트 > Settings > Domains
2. 도메인 입력 (예: `my-site.com`)
3. 가비아 관리 콘솔에서 DNS 설정:
   ```
   레코드 타입: CNAME
   호스트명: www
   값: cname.vercel-dns.com
   
   레코드 타입: A
   호스트명: @
   값: 76.76.21.21
   ```

#### Namecheap
1. Vercel에서 도메인 추가
2. Namecheap Advanced DNS 설정:
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   
   Type: A Record
   Host: @
   Value: 76.76.21.21
   ```

#### Cloudflare
1. Cloudflare DNS 관리
2. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy: 황색 구름 (Proxied)
   
   Type: A
   Name: @
   IPv4: 76.76.21.21
   Proxy: 황색 구름 (Proxied)
   ```

### 도메인 연결 확인
- DNS 전파 시간: 최대 48시간 (보통 10분~2시간)
- 확인 도구: https://dnschecker.org

---

## 📊 SEO 설정 (배포 후)

### 1. Google Search Console 등록
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가 > URL 접두어 입력
3. 소유권 확인:
   - Vercel에서 제공하는 메타 태그 복사
   - `config/site.ts`의 verification 코드 업데이트
   - 재배포
4. Sitemap 제출: `https://your-domain.com/sitemap.xml`

### 2. Naver 서치어드바이저 (선택)
1. [Naver 서치어드바이저](https://searchadvisor.naver.com) 접속
2. 사이트 등록
3. 메타 태그 인증
4. sitemap 제출

### 3. Google Analytics (선택)
1. [Google Analytics](https://analytics.google.com) 계정 생성
2. 측정 ID (G-XXXXXXXXXX) 복사
3. Vercel 환경변수에 `NEXT_PUBLIC_GA_ID` 추가
4. 재배포

---

## 🔄 자동 배포 설정

Vercel은 Git 저장소와 연결 시 **자동 배포**가 설정됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push

# Vercel이 자동으로 감지하고 배포 시작
# 5-10분 후 프로덕션 반영 완료
```

---

## ⚙️ 필수 설정 파일 업데이트

배포 전 다음 파일들을 실제 도메인으로 업데이트하세요:

### `config/site.ts`
```typescript
export const siteConfig = {
  url: "https://your-actual-domain.com", // 실제 도메인으로 변경
  // ...
};
```

### `app/robots.ts`
```typescript
sitemap: 'https://your-actual-domain.com/sitemap.xml', // 실제 도메인으로 변경
```

---

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 후 수정
# git push로 재배포
```

### 환경변수 적용 안 됨
- Vercel 대시보드에서 환경변수 재확인
- "Redeploy" 버튼으로 재배포

### 도메인 연결 안 됨
- DNS 설정 재확인
- 24-48시간 대기
- `dig your-domain.com` 명령어로 확인

---

## 📞 지원

문제 발생 시:
- Vercel 문서: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Next.js 문서: https://nextjs.org/docs
