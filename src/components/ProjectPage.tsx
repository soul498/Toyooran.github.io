import React from "react";
import { Link, useParams } from "react-router-dom";
import { PageBanner } from "./PageBanner";
import { UnderConstruction } from "./UnderConstruction";
import { useData } from "../context/DataContext";

export const ProjectPage: React.FC<{ onOpenConsultation?: (title: string) => void }> = () => {
  const { projectId } = useParams();
  const { projects } = useData();
  // H1 must equal the server prerender H1 (project title) — see resolveSeo /projects/:id.
  const project = projects.find((p) => p.id === projectId);
  const subtitle = project
    ? [project.location, project.capacity].filter(Boolean).join(" · ")
    : "درحال بارگزاری...";
  return (
    <div className="min-h-screen bg-blueprint-light">
      <PageBanner
        title={project?.title || "پروژه‌ها"}
        subtitle={subtitle}
      />
      <UnderConstruction
        title="درحال بارگزاری..."
        description="جزئیات پروژه‌ها به‌زودی منتشر می‌شود. برای مشاوره تجهیز سالن از صفحه تماس اقدام کنید."
      />
      <div className="text-center pb-16">
        <Link to="/projects" className="text-sm font-bold text-[#003F86]">بازگشت به پروژه‌ها</Link>
      </div>
    </div>
  );
};
