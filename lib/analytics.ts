// Google Analytics 4 설정
// 환경변수 NEXT_PUBLIC_GA_ID에 측정 ID 설정 필요

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            targetId: string,
            config?: Record<string, any>
        ) => void;
    }
}

export const pageview = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID as string, {
            page_path: url,
        })
    }
}

export const event = ({ action, category, label, value }: {
    action: string
    category: string
    label: string
    value?: number
}) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        })
    }
}

// 사용 예시:
// import * as gtag from '@/lib/analytics'
//
// // 페이지뷰 추적
// gtag.pageview(window.location.pathname)
//
// // 이벤트 추적
// gtag.event({
//   action: 'submit_application',
//   category: 'Application',
//   label: 'Step 7 Complete',
// })
