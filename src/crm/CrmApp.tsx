import React, { useEffect } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { CrmHeader } from './components/common/CrmHeader';
import { CrmNavTabs } from './components/common/CrmNavTabs';
import { CrmPipelineView } from './components/views/CrmPipelineView';
import { CrmFollowUpsView } from './components/views/CrmFollowUpsView';
import { CrmContactsView } from './components/views/CrmContactsView';
import { CrmInboundView } from './components/views/CrmInboundView';
import { CrmDuplicatesView } from './components/views/CrmDuplicatesView';
import { CrmReportsView } from './components/views/CrmReportsView';
import { CustomerModal } from './components/modals/CustomerModal';
import './crm.css';

const CrmMainWorkspace: React.FC = () => {
  const { activeTab } = useCrm();

  return (
    <div className="flex flex-col gap-4">
      <p className="crm-glossary">
        <strong>مخاطب</strong> فرد یا فارم در بانک اطلاعاتی است.
        {' '}
        <strong>سرنخ</strong> همان مخاطب است وقتی فرصت فروش باز دارد؛ از لیست مخاطبین انتخاب می‌شود، پرونده جدا ساخته نمی‌شود.
        {' '}
        <strong>سرنخ سایت</strong> فرم پرشده است تا به یک مخاطب وصل شود.
      </p>
      <CrmNavTabs />
      <div className="min-h-[480px]">
        {activeTab === 'pipeline' && <CrmPipelineView />}
        {activeTab === 'followups' && <CrmFollowUpsView />}
        {activeTab === 'contacts' && <CrmContactsView />}
        {activeTab === 'inbound' && <CrmInboundView />}
        {activeTab === 'duplicates' && <CrmDuplicatesView />}
        {activeTab === 'reports' && <CrmReportsView />}
      </div>
      <CustomerModal />
    </div>
  );
};

export const CrmApp: React.FC = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'CRM فروش | طیوران صنعت پویا';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <CrmProvider>
      <div className="crm-app flex flex-col" dir="rtl">
        <CrmHeader />
        <main className="crm-shell flex-1">
          <CrmMainWorkspace />
        </main>
      </div>
    </CrmProvider>
  );
};

export default CrmApp;
