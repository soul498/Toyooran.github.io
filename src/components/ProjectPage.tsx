import React from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { NotFoundPage } from "./NotFoundPage";
import { SEO } from "./SEO";
import { LazyImage } from "./LazyImage";
import { MapPin, Calendar, Activity } from "lucide-react";

export const ProjectPage: React.FC<{ onOpenConsultation: (title: string) => void }> = ({ onOpenConsultation }) => {
  const { projectId } = useParams();
  const { projects } = useData();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <NotFoundPage />;

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <SEO title={`${project.title} | طیوران صنعت پویا`} description={project.keyOutcome} ogType="article" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <Link to="/projects" className="text-sm font-bold text-[#003F86]">بازگشت به پروژه‌ها</Link>
        <h1 className="text-3xl font-black text-slate-900">{project.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.location}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{project.year}</span>
          <span className="flex items-center gap-1"><Activity className="w-4 h-4" />{project.capacity}</span>
        </div>
        <div className="rounded-3xl overflow-hidden h-56 bg-slate-100">
          <LazyImage src={project.image} alt={project.title} className="w-full h-full" />
        </div>
        <p className="text-slate-700 font-medium">{project.keyOutcome}</p>
        <ul className="list-disc mr-5 text-sm text-slate-700 space-y-1">
          {project.servicesProvided.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <Link to="/contact" onClick={() => onOpenConsultation(project.title)} className="inline-flex bg-[#003F86] text-white font-bold px-6 py-3 rounded-2xl">
          مشاوره پروژه مشابه
        </Link>
      </div>
    </div>
  );
};
