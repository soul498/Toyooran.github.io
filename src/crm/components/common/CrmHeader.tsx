import React, { useState, useEffect } from 'react';
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
    <header className="crm-header">
      <div className="crm-header-inner">
        <div className="crm-wordmark">
          CRM فروش
          <span>پایپ‌لاین، پیگیری و بانک مخاطبین</span>
        </div>

        <div className="crm-meta">
          <time dateTime={new Date().toISOString()}>
            {shamsiDate.fullText}
            {clock ? ` · ${clock}` : ''}
          </time>
          {urgentCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('followups')}
              className="crm-urgent"
            >
              {toPersianDigits(urgentCount)} پیگیری فوری
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
