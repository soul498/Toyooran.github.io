import React from "react";
import { Link } from "react-router-dom";
import { PageBanner } from "./PageBanner";
import { UnderConstruction } from "./UnderConstruction";

export const ProjectPage: React.FC<{ onOpenConsultation?: (title: string) => void }> = () => {
  return (
    <div className="min-h-screen bg-blueprint-light">
      <PageBanner
        title="پروژه‌ها"
        subtitle="این بخش در حال بارگزاری هست"
      />
      <UnderConstruction
        title="این بخش در حال بارگزاری هست"
        description="جزئیات پروژه‌ها به‌زودی منتشر می‌شود. برای مشاوره تجهیز سالن از صفحه تماس اقدام کنید."
      />
      <div className="text-center pb-16">
        <Link to="/projects" className="text-sm font-bold text-[#003F86]">بازگشت به پروژه‌ها</Link>
      </div>
    </div>
  );
};
