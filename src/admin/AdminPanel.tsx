import React, { useMemo, useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { OverviewTab } from './tabs/OverviewTab';
import { ProductsTab } from './tabs/ProductsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { ServicesTab } from './tabs/ServicesTab';
import { ArticlesTab } from './tabs/ArticlesTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { QuotesTab } from './tabs/QuotesTab';
import { ConsultationsTab } from './tabs/ConsultationsTab';
import { CustomersTab } from './tabs/CustomersTab';
import { CompanyCmsTab } from './tabs/CompanyCmsTab';
import { HeroCmsTab } from './tabs/HeroCmsTab';
import { AiConfigTab } from './tabs/AiConfigTab';
import { MediaTab } from './tabs/MediaTab';
import { BackupTab } from './tabs/BackupTab';
import { SecurityTab } from './tabs/SecurityTab';
import { UsersTab } from './tabs/UsersTab';
import { LayoutTab } from './tabs/LayoutTab';
import { PagesTab } from './tabs/PagesTab';
import { useData } from '../context/DataContext';

interface AdminPanelProps {
  onViewPublicSite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onViewPublicSite }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const { canAccess } = useData();
  const activeTab = useMemo(() => {
    if (canAccess(currentTab)) return currentTab;
    return (['overview', 'products', 'articles', 'media'] as AdminTab[]).find((tab) => canAccess(tab)) || 'overview';
  }, [canAccess, currentTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Estedad',sans-serif] flex flex-col" dir="rtl">
      
      {/* Top Navigation Bar */}
      <AdminHeader onViewPublicSite={onViewPublicSite} />

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar */}
        <AdminSidebar currentTab={activeTab} onSelectTab={setCurrentTab} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-950/90">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab onNavigateTab={setCurrentTab} />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'services' && <ServicesTab />}
            {activeTab === 'articles' && <ArticlesTab />}
            {activeTab === 'categories' && <CategoriesTab />}
            {activeTab === 'quotes' && <QuotesTab />}
            {activeTab === 'consultations' && <ConsultationsTab />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'company' && <CompanyCmsTab />}
            {activeTab === 'hero' && <HeroCmsTab />}
            {activeTab === 'layout' && <LayoutTab />}
            {activeTab === 'pages' && <PagesTab />}
            {activeTab === 'ai' && <AiConfigTab />}
            {activeTab === 'media' && <MediaTab />}
            {activeTab === 'backup' && <BackupTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'users' && <UsersTab />}
          </div>
        </main>

      </div>

    </div>
  );
};
