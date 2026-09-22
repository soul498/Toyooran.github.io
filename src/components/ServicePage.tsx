import React from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { NotFoundPage } from "./NotFoundPage";
import { CheckCircle2, PhoneCall } from "../icons";

const ALIASES: Record<string, string> = { "poultry-hall-fitout": "srv-turnkey-shed" };

export const ServicePage: React.FC<{ onOpenConsultation: (title: string) => void }> = ({ onOpenConsultation }) => {
  const { serviceId } = useParams();
  const { services, projects } = useData();
  const resolved = ALIASES[serviceId || ""] || serviceId;
  const service = services.find((s) => s.id === resolved);
  if (!service) return <NotFoundPage />;
  const isFitout = serviceId === "poultry-hall-fitout" || service.id === "srv-turnkey-shed";
  const h1 = isFitout ? "نوسازی و تجهیز کامل سالن مرغداری" : service.title;

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <Link to="/services" className="text-sm font-bold text-[#003F86]">بازگشت به خدمات</Link>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{h1}</h1>
        <p className="text-slate-600 font-medium leading-relaxed">{service.tagline}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 text-sm">{service.problemSolved}</div>
        <ul className="grid sm:grid-cols-2 gap-3">
          {service.whatWeProvide.map((item) => (
            <li key={item} className="bg-white border border-slate-200 rounded-xl p-3.5 text-sm flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
        {service.workflow?.length ? (
          <ol className="space-y-3">
            {service.workflow.map((step) => (
              <li key={step.stepNumber} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="font-bold text-slate-900">{step.stepNumber}. {step.title}</p>
                <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                <p className="text-xs text-slate-500 mt-2">خروجی: {step.deliverable}</p>
              </li>
            ))}
          </ol>
        ) : null}
        {isFitout ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h2 className="text-xl font-black mb-3">چک‌لیست ممیزی قبل از نوسازی</h2>
            <ul className="list-disc mr-5 text-sm text-slate-700 space-y-1">
              <li>عایق سقف و دیوار و هوابندی سازه</li>
              <li>برق، دیزل و تابلو متناسب با فن و هیتر</li>
              <li>آب، فشارشکن و شیب خط آبخوری</li>
              <li>تهویه: فن، اینلت، پد و کنترل اقلیم</li>
              <li>گرمایش متناسب با اقلیم و عایق</li>
              <li>خطوط دان و آب و دسترسی شست‌وشو</li>
              <li>ایمنی گاز، اگزوز و خروج اضطراری</li>
            </ul>
          </div>
        ) : null}
        {service.faqs?.length ? (
          <div className="space-y-3">
            <h2 className="text-xl font-black">پرسش‌های متداول</h2>
            {service.faqs.map((f) => (
              <div key={f.q} className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-slate-900">{f.q}</h3>
                <p className="text-sm text-slate-600 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        ) : null}
        {service.sampleProjectIds?.length ? (
          <ul className="text-sm space-y-2">
            {projects.filter((p) => service.sampleProjectIds.includes(p.id)).map((p) => (
              <li key={p.id}><Link className="text-[#003F86] font-bold" to={`/projects/${p.id}`}>{p.title}</Link> — {p.location}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" onClick={() => onOpenConsultation(service.title)} className="bg-[#003F86] text-white font-bold px-6 py-3 rounded-2xl inline-flex items-center gap-2">
            <PhoneCall className="w-4 h-4" />
            درخواست بازدید و پیشنهاد فنی
          </Link>
          <Link to="/products" className="border border-slate-200 bg-white font-bold px-6 py-3 rounded-2xl">مشاهده تجهیزات</Link>
        </div>
      </div>
    </div>
  );
};
