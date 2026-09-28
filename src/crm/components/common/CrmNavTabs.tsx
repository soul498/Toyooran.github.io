import React from 'react';
import { useCrm } from '../../hooks/useCrm';
import { CrmSubTab } from '../../types/crm.types';
import { toPersianDigits } from '../../utils/crmPhoneUtils';
import { CrmExcelActions } from './CrmExcelActions';

export const CrmNavTabs: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    openNewCustomerModal
  } = useCrm();

  const tabs: { id: CrmSubTab; label: string; count?: number }[] = [
    { id: 'pipeline', label: 'پایپ‌لاین', count: stats.activeLeads },
    { id: 'followups', label: 'پیگیری‌ها', count: (stats.todayFollowUps + stats.overdueFollowUps) || undefined },
    { id: 'contacts', label: 'مخاطبین', count: stats.totalContacts },
    { id: 'inbound', label: 'سرنخ سایت', count: stats.inboundLeadsCount || undefined },
    { id: 'duplicates', label: 'تکراری‌ها', count: stats.duplicateCount > 0 ? stats.duplicateCount : undefined },
    { id: 'reports', label: 'گزارش' }
  ];

  const isDirectoryTab = activeTab === 'contacts';

  return (
    <div className="crm-toolbar">
      <nav className="crm-tabs" aria-label="بخش‌های CRM">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`crm-tab${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="crm-tab-count">{toPersianDigits(tab.count)}</span>
              )}
            </button>
          );
        })}
      </nav>

      <CrmExcelActions />
      <div className="crm-actions">
        <button
          type="button"
          onClick={() => openNewCustomerModal(isDirectoryTab ? 'directory' : 'new_lead')}
          className="crm-btn crm-btn-primary"
        >
          {isDirectoryTab ? 'مخاطب جدید' : 'سرنخ جدید'}
        </button>
      </div>
    </div>
  );
};
