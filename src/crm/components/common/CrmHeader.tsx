import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Users } from '../../lucide';
import { useCrm } from '../../hooks/useCrm';
import { getTodayShamsiFullDate } from '../../utils/crmDateUtils';
import { toPersianDigits } from '../../utils/crmPhoneUtils';

export const CrmHeader: React.FC = () => {
  const { stats, setActiveTab } = useCrm();
  const shamsiDate = getTodayShamsiFullDate();
  const urgentCount = (stats.todayFollowUps || 0) + (stats.overdueFollowUps || 0);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setClock(`${toPersianDigits(hh)}:${toPersianDigits(mm)}`);
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-[1650px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              CRM فروش طیوران
            </h1>
            <p className="text-xs text-slate-400">پایپ‌لاین، پیگیری و بانک مخاطبین</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{shamsiDate.fullText}</span>
            {clock ? (
              <>
                <span className="text-slate-600">|</span>
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-amber-300 font-bold">{clock}</span>
              </>
            ) : null}
          </div>

          {urgentCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('followups')}
              className="flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl px-2.5 py-1.5 text-xs hover:bg-rose-500/25 transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              <span>{toPersianDigits(urgentCount)} پیگیری فوری</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
