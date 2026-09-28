import React from 'react';
import { BarChart3, TrendingUp, Award, Layers, MapPin } from '../../lucide';
import { useCrm } from '../../hooks/useCrm';
import { PIPELINE_STAGES } from '../common/crmConstants';
import { toPersianDigits } from '../../utils/crmPhoneUtils';
import { isPipelineCard, isPersonaContact, resolvePipelineStage } from '../../utils/crmRecords';

export const CrmReportsView: React.FC = () => {
  const { customers, stats } = useCrm();

  const dealCustomers = (customers || []).filter((c) => isPipelineCard(c));

  const provinceCounts = (customers || []).reduce<{ [key: string]: number }>((acc, c) => {
    if (!c.province || isPersonaContact(c)) return acc;
    acc[c.province] = (acc[c.province] || 0) + 1;
    return acc;
  }, {});

  const sortedProvinces = (Object.entries(provinceCounts) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const wonCount = dealCustomers.filter(c => c.pipelineStage === 'won').length;
  const lostCount = dealCustomers.filter(c => c.pipelineStage === 'lost').length;
  const closedCount = wonCount + lostCount;
  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold">ارزش فرصت‌های فعال</span>
            <div className="text-base font-black text-white mt-0.5 font-mono">
              {toPersianDigits(stats.totalDealValue.toLocaleString())} <span className="text-xs font-normal text-slate-400">تومان</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold">قراردادهای موفق</span>
            <div className="text-base font-black text-emerald-400 mt-0.5 font-mono">
              {toPersianDigits(stats.wonDealValue.toLocaleString())} <span className="text-xs font-normal text-slate-400">تومان</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold">نرخ موفقیت</span>
            <div className="text-base font-black text-white mt-0.5 font-mono">
              {toPersianDigits(winRate)}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold">پرونده فعال</span>
            <div className="text-base font-black text-purple-300 mt-0.5 font-mono">
              {toPersianDigits(stats.activeLeads)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white">توزیع قیف فروش</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianDigits(dealCustomers.length)} فرصت
            </span>
          </div>

          <div className="space-y-3">
            {PIPELINE_STAGES.map(stage => {
              const count = dealCustomers.filter((c) => resolvePipelineStage(c) === stage.id).length;
              const pct = dealCustomers.length > 0 ? Math.round((count / dealCustomers.length) * 100) : 0;

              return (
                <div key={stage.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold">{stage.title}</span>
                    <span className="font-mono text-slate-400">
                      {toPersianDigits(count)} ({toPersianDigits(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${stage.color.replace('text-', 'bg-')} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white">مخاطبین بر اساس استان</h3>
          </div>

          <div className="space-y-3">
            {sortedProvinces.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">هنوز استانی روی پرونده‌ها ثبت نشده است.</div>
            ) : (
              sortedProvinces.map(([prov, cnt], i) => (
                <div key={prov} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                      {toPersianDigits(i + 1)}
                    </span>
                    <span className="text-white font-bold">{prov}</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">
                    {toPersianDigits(cnt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
