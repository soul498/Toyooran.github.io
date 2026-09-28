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

const CrmMainWorkspace: React.FC = () => {
  const { activeTab } = useCrm();

  return (
    <div className="space-y-4">
      <CrmNavTabs />
      <div className="min-h-[500px]">
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950" dir="rtl">
        <CrmHeader />
        <main className="flex-1 w-full max-w-[1650px] mx-auto p-3 sm:p-6 lg:p-8">
          <CrmMainWorkspace />
        </main>
      </div>
    </CrmProvider>
  );
};

export default CrmApp;
