import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { DISABLED_PAGE_REDIRECT, isServiceDisabled } from "../data/disabledPages";
import { useData } from "../context/DataContext";
import { NotFoundPage } from "./NotFoundPage";
import { CheckCircle2, PhoneCall } from "../icons";
import { LazyImage } from "./LazyImage";
import { FITOUT_CHECKLIST, FITOUT_LEAD, servicePageRelated } from "../seo/resolveSeo";
import { SERVICE_PAGES, SERVICE_PAGE_LABELS, findServicePage, servicePagePath, type ServicePageData } from "../data/servicePages";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_TEL, SALES_PHONE_DISPLAY, SALES_PHONE_TEL } from "../data/contact";
import { SitePicture } from "./SitePicture";
import { ProductName } from "./ProductName";

import { t, tr } from '../i18n';
const ALIASES: Record<string, string> = { "poultry-hall-fitout": "srv-turnkey-shed" };

export const ServicePage: React.FC<{ onOpenConsultation: (title: string) => void }> = ({ onOpenConsultation }) => {
  const { serviceId } = useParams();
  const { services, products } = useData();
  const page = findServicePage(serviceId);
  if (page) return <ServiceDetail page={page} products={products} onOpenConsultation={onOpenConsultation} />;
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

/** One of the six service pages (src/data/servicePages.ts). Body text is the user's copy only. */
const ServiceDetail: React.FC<{
  page: ServicePageData;
  products: Parameters<typeof servicePageRelated>[1];
  onOpenConsultation: (title: string) => void;
}> = ({ page, products, onOpenConsultation }) => {
  const title = tr(page.title);
  const related = servicePageRelated(page, products);
  const others = SERVICE_PAGES.filter((s) => s.slug !== page.slug);
  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-slate-50 min-h-screen">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <nav aria-label={t("مسیر صفحه")} className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-[#003F86]">{t("خانه")}</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/services" className="hover:text-[#003F86]">{t("خدمات")}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-800 font-bold" aria-current="page">{title}</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-snug">{title}</h1>

        {page.photo ? (
          <SitePicture
            photo={page.photo}
            sizes="(min-width: 896px) 848px, calc(100vw - 2rem)"
            eager
            className={`block overflow-hidden rounded-[2rem] shadow-lg bg-slate-100 ${page.photo.height / page.photo.width > 0.7 ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}
          />
        ) : null}

        <div className="space-y-4">
          {page.intro.map((text) => (
            <p key={text} className="text-slate-700 font-medium leading-loose text-base sm:text-lg">{tr(text)}</p>
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">{tr(page.listHeading)}</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {page.items.map((item) => (
              <li key={item} className="bg-white border border-slate-200 rounded-xl p-3.5 text-sm leading-relaxed flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{tr(item)}</span>
              </li>
            ))}
          </ul>
        </section>

        {page.outro?.map((text) => (
          <p key={text} className="text-slate-700 leading-loose">{tr(text)}</p>
        ))}

        {page.feature ? (
          <section className="bg-white border border-amber-200 rounded-3xl p-6 space-y-3">
            <h2 className="text-xl font-black text-slate-900">{tr(page.feature.heading)}</h2>
            <p className="text-slate-700 leading-loose">{tr(page.feature.text)}</p>
            <Link to={page.feature.href} className="inline-flex font-bold text-[#003F86] underline underline-offset-4">{tr(page.feature.cta)}</Link>
          </section>
        ) : null}

        {page.sections?.map((sec) => (
          <section key={sec.heading} className="space-y-3">
            <h2 className="text-xl font-black text-slate-900">{tr(sec.heading)}</h2>
            {sec.paragraphs.map((text) => (
              <p key={text} className="text-slate-700 leading-loose">{tr(text)}</p>
            ))}
            {sec.items?.length ? (
              <ul className="space-y-3">
                {sec.items.map((item) => (
                  <li key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 text-sm leading-relaxed">
                    <strong className="text-slate-900">{tr(item.label)}:</strong> {tr(item.text)}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {related.length ? (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900">{tr(SERVICE_PAGE_LABELS.related)}</h2>
            <ul className="flex flex-wrap gap-3">
              {related.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="inline-flex border border-[#003F86]/30 bg-white text-[#003F86] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50">
                    <ProductName name={l.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="bg-[#001c3d] text-white rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black">{tr(SERVICE_PAGE_LABELS.ctaHeading)}</h2>
          <Link
            to="/contact"
            onClick={() => onOpenConsultation(title)}
            className="bg-amber-400 text-[#001c3d] font-black px-6 py-3 rounded-2xl inline-flex items-center gap-2 hover:bg-amber-300"
          >
            <PhoneCall className="w-4 h-4" />
            {tr(SERVICE_PAGE_LABELS.cta)}
          </Link>
          <p className="text-sm text-blue-100 leading-loose">
            {tr(SERVICE_PAGE_LABELS.phones)}{" "}
            <a href={SALES_PHONE_TEL} dir="ltr" className="font-bold text-white">{tr(SALES_PHONE_DISPLAY)}</a>
            <span className="mx-2" aria-hidden="true">·</span>
            {tr(SERVICE_PAGE_LABELS.office)}{" "}
            <a href={OFFICE_PHONE_TEL} dir="ltr" className="font-bold text-white">{tr(OFFICE_PHONE_DISPLAY)}</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">{tr(SERVICE_PAGE_LABELS.others)}</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link to={servicePagePath(s)} className="block h-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 hover:border-[#003F86] hover:text-[#003F86]">
                  {tr(s.title)}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/services" className="inline-flex text-sm font-bold text-[#003F86]">{tr(SERVICE_PAGE_LABELS.back)}</Link>
        </section>
      </article>
    </div>
  );
};
