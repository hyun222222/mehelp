import { attorneys, officeInfo } from '@/data/attorneys';
import { MapPin, Phone, Mail, Printer, GraduationCap, Briefcase, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '김앤현 법률사무소 소개 | K&H Law Office',
    description: '김앤현 법률사무소는 부동산, 건설분쟁, 상속·증여, 행정소송 등 다양한 법률분야에서 의뢰인의 권리를 보호하고 있습니다.',
};

export default function AboutPage() {
    return (
        <>
            {/* Hero / Intro */}
            <section className="relative overflow-hidden py-16 md:py-24 px-4" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                        {officeInfo.name}
                    </h1>
                    <p className="text-lg md:text-xl font-light text-white/80 mb-6">
                        {officeInfo.nameEn}
                    </p>
                    <div className="w-16 h-0.5 bg-white/40 mx-auto mb-6" />
                    <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl mx-auto">
                        {officeInfo.description}
                    </p>
                </div>
            </section>

            {/* Attorneys Section */}
            <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">변호사 소개</h2>
                    <p className="text-sm text-gray-500">풍부한 경험과 전문성으로 의뢰인의 권리를 보호합니다</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {attorneys.map((attorney, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                        >
                            {/* Photo + Name Header */}
                            <div className="flex items-center gap-4 p-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, var(--color-primary-lighter) 0%, #FFFFFF 100%)' }}>
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-md relative" style={{ backgroundColor: 'var(--color-primary-lighter)' }}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{attorney.name[0]}</span>
                                    </div>
                                    <img
                                        src={attorney.photo}
                                        alt={`${attorney.name} ${attorney.title}`}
                                        className="w-full h-full object-cover relative z-10"
                                    />
                                </div>
                                <div>
                                    <span
                                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white mb-1.5"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        {attorney.title}
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{attorney.name}</h3>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 space-y-4">
                                {/* Education */}
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                                        <GraduationCap className="w-3.5 h-3.5" /> 학력
                                    </h4>
                                    <ul className="space-y-1">
                                        {attorney.education.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Career */}
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                                        <Briefcase className="w-3.5 h-3.5" /> 주요 경력
                                    </h4>
                                    <ul className="space-y-1">
                                        {attorney.career.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Specialties */}
                                <div>
                                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                                        <Scale className="w-3.5 h-3.5" /> 주요 업무분야
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {attorney.specialties.map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Office Info Section */}
            <section className="bg-gray-50 border-t border-gray-200 py-12 md:py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">사무소 안내</h2>
                        <p className="text-sm text-gray-500">언제든 편하게 연락해 주세요</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                            <InfoItem icon={<MapPin className="w-5 h-5" />} label="주소" value={officeInfo.address} />
                            <InfoItem
                                icon={<Phone className="w-5 h-5" />}
                                label="전화"
                                value={
                                    <>
                                        <a href={`tel:${officeInfo.phone}`} className="hover:text-[var(--color-primary)] transition-colors no-underline">{officeInfo.phone}</a>
                                        {' / '}
                                        <a href={`tel:${officeInfo.mobile}`} className="hover:text-[var(--color-primary)] transition-colors no-underline">{officeInfo.mobile}</a>
                                    </>
                                }
                            />
                            <InfoItem icon={<Printer className="w-5 h-5" />} label="팩스" value={officeInfo.fax} />
                            <InfoItem
                                icon={<Mail className="w-5 h-5" />}
                                label="이메일"
                                value={
                                    <a href={`mailto:${officeInfo.email}`} className="hover:text-[var(--color-primary)] transition-colors no-underline">
                                        {officeInfo.email}
                                    </a>
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 p-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">{label}</p>
                <p className="text-sm text-gray-700">{value}</p>
            </div>
        </div>
    );
}
