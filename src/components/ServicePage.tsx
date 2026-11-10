import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { DISABLED_PAGE_REDIRECT, isServiceDisabled } from "../data/disabledPages";
import { useData } from "../context/DataContext";
import { NotFoundPage } from "./NotFoundPage";
import { CheckCircle2, PhoneCall } from "../icons";
import { LazyImage } from "./LazyImage";
import { FITOUT_CHECKLIST, FITOUT_LEAD } from "../seo/resolveSeo";

import { t, tr } from '../i18n';
const ALIASES: Record<string, string> = { "poultry-hall-fitout": "srv-turnkey-shed" };

export const ServicePage: React.FC<{ onOpenConsultation: (title: string) => void }> = ({ onOpenConsultation }) => {
  const { serviceId } = useParams();
  const { services } = useData();
  const resolved = ALIASES[serviceId || ""] || serviceId;
  const service = services.find((s) => s.id === resolved);
  // Switched off for now (data/disabledPages.ts); the server answers these URLs with a 301 to /services as well.
  if (isServiceDisabled(serviceId)) return <Navigate to={DISABLED_PAGE_REDIRECT} replace />;
  if (!service) return <NotFoundPage />;
  const isFitout = serviceId === "poultry-hall-fitout" || service.id === "srv-turnkey-shed";
  const h1 = isFitout ? t("تجهیز و نوسازی سالن مرغداری") : service.title;

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <Link to="/services" className="text-sm font-bold text-[#003F86]">{t("بازگشت به خدمات")}</Link>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{h1}</h1>
        <p className="text-slate-700 font-medium leading-relaxed text-base sm:text-lg">
          {isFitout ? tr(FITOUT_LEAD) : service.tagline}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 text-sm">{service.problemSolved}</div>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">{t("دامنه کار")}</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {service.whatWeProvide.map((item) => (
              <li key={item} className="bg-white border border-slate-200 rounded-xl p-3.5 text-sm flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {service.workflow?.length ? (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900">{t("فرایند اجرا")}</h2>
            <ol className="space-y-3">
              {service.workflow.map((step) => (
                <li key={step.stepNumber} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="font-bold text-slate-900">{step.stepNumber}. {step.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  <p className="text-xs text-slate-500 mt-2">{t("خروجی:")}{" "}{step.deliverable}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {isFitout ? (
          <section className="bg-white border border-slate-200 rounded-3xl p-6">
            <h2 className="text-xl font-black mb-3">{t("چک‌لیست ممیزی قبل از نوسازی")}</h2>
            <ul className="list-disc mr-5 text-sm text-slate-700 space-y-1">
              {FITOUT_CHECKLIST.map(tr).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-sm mt-4">
              <Link className="text-[#003F86] font-bold" to="/magazine/before-and-after-renovation">{t("گزارش قبل و بعد از نوسازی")}</Link>
            </p>
          </section>
        ) : null}

        {service.faqs?.length ? (
          <section className="space-y-3">
            <h2 className="text-xl font-black">{t("پرسش‌های متداول")}</h2>
            {service.faqs.map((f) => (
              <div key={f.q} className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-slate-900">{f.q}</h3>
                <p className="text-sm text-slate-600 mt-1">{f.a}</p>
              </div>
            ))}
          </section>
        ) : null}


        <div className="flex flex-wrap gap-3">
          <Link to="/contact" onClick={() => onOpenConsultation(service.title)} className="bg-[#003F86] text-white font-bold px-6 py-3 rounded-2xl inline-flex items-center gap-2">
            <PhoneCall className="w-4 h-4" />
            
            {t("درخواست بازدید و پیشنهاد فنی")}
          </Link>
          {isFitout ? (
            <Link to="/contact?cta=hall-audit" className="border border-[#003F86] text-[#003F86] bg-white font-bold px-6 py-3 rounded-2xl">
              
              {t("درخواست ممیزی سالن")}
            </Link>
          ) : null}
          <Link to="/products" className="border border-slate-200 bg-white font-bold px-6 py-3 rounded-2xl">{t("مشاهده تجهیزات")}</Link>
        </div>
      </div>
    </div>
  );
};
