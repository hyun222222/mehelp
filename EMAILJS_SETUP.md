# EmailJS 설정 가이드

이메일 전송 기능을 활성화하려면 EmailJS 계정을 설정해야 합니다.

## 1단계: EmailJS 계정 생성
1. https://www.emailjs.com/ 접속
2. 무료 계정 생성 (월 200건 무료)

## 2단계: 이메일 서비스 연결
1. Dashboard → "Add New Service" 클릭
2. Gmail 또는 다른 이메일 서비스 선택
3. 변호사 이메일 (khja@naver.com) 연결
4. Service ID 복사 (예: service_abc123)

## 3단계: 이메일 템플릿 생성
1. Dashboard → "Email Templates" → "Create New Template"
2. 템플릿 내용 예시:
```
신청인 정보: {{applicant_name}}
연락처: {{applicant_phone}}
이메일: {{applicant_email}}

총 채무액: {{total_debt}}원
월 소득: {{monthly_income}}원
월 변제금: {{monthly_payment}}원
변제 기간: {{repayment_period}}개월

채권자 수: {{creditors_count}}개
제출 날짜: {{submission_date}}
```
3. Template ID 복사 (예: template_xyz789)

## 4단계: Public Key 가져오기
1. Dashboard → "Account"
2. Public Key 복사 (예: user_ABC123XYZ)

## 5단계: 코드에 적용
파일: `components/application/step-7-preview.tsx` (53-56번 줄)

아래 부분의 YOUR_XXX를 실제 값으로 교체:
```typescript
await emailjs.send(
    'YOUR_SERVICE_ID',      // Step 2에서 받은 Service ID
    'YOUR_TEMPLATE_ID',     // Step 3에서 받은 Template ID
    emailData,
    'YOUR_PUBLIC_KEY'       // Step 4에서 받은 Public Key
);
```

## 완료!
설정 후 Step 7에서 "변호사에게 이메일 보내기" 버튼이 작동합니다.
