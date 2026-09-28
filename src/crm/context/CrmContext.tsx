import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useData } from '../../context/DataContext';
import { 
  CustomerContact, 
  FollowUpRecord, 
  PipelineStage, 
  QuoteRequestItem, 
  ConsultationRequestItem,
  CrmSubTab,
  PriorityFilter,
  CrmStats,
  DuplicateGroup
} from '../types/crm.types';
import { detectAllDuplicateGroups, normalizePhoneNumber } from '../utils/crmPhoneUtils';
import { getFollowUpUrgency, formatToShamsiDateTime } from '../utils/crmDateUtils';
import {
  findContactByPhone,
  isOpenInbound,
  isOpenLead,
  isPersonaContact,
  isPipelineCard,
  resolvePipelineStage
} from '../utils/crmRecords';
import { CrmExcelRowInput } from '../utils/crmExcel';

interface CrmContextType {
  // State
  customers: CustomerContact[];
  quoteRequests: QuoteRequestItem[];
  consultationRequests: ConsultationRequestItem[];
  activeTab: CrmSubTab;
  setActiveTab: (tab: CrmSubTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stageFilter: string;
  setStageFilter: (stage: string) => void;
  priorityFilter: PriorityFilter;
  setPriorityFilter: (p: PriorityFilter) => void;
  provinceFilter: string;
  setProvinceFilter: (prov: string) => void;
  
  // Selected Customer Modal
  selectedCustomer: CustomerContact | null;
  setSelectedCustomer: (customer: CustomerContact | null) => void;
  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (open: boolean) => void;
  openNewCustomerModal: (prefillStage?: PipelineStage) => void;
  openEditCustomerModal: (customer: CustomerContact) => void;
  closeCustomerModal: () => void;
  openLeadFromContact: (customer: CustomerContact, stage?: PipelineStage) => Promise<void>;
  startLeadFromPersona: (persona: CustomerContact) => void;

  // Actions
  addCustomer: (customer: Omit<CustomerContact, 'id' | 'createdAt'>) => Promise<CustomerContact>;
  updateCustomer: (id: string, updates: Partial<CustomerContact>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addFollowUpLog: (customerId: string, record: Omit<FollowUpRecord, 'id'>, customNotes?: string) => Promise<void>;
  updatePipelineStage: (customerId: string, stage: PipelineStage) => Promise<void>;
  convertInboundToCustomer: (
    inbound: QuoteRequestItem | ConsultationRequestItem,
    type: 'quote' | 'consultation',
    targetContactId?: string
  ) => Promise<CustomerContact>;
  mergeDuplicates: (targetId: string, sourceIds: string[]) => Promise<void>;
  findContactByPhoneNumber: (phone?: string) => CustomerContact | undefined;
  importExcelRows: (rows: CrmExcelRowInput[]) => Promise<{ created: number; updated: number; skipped: number }>;

  // Calculated Stats
  stats: CrmStats;
  duplicateGroups: DuplicateGroup[];
  filteredCustomers: CustomerContact[];
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    customers = [],
    addCustomer: persistCustomer,
    updateCustomer: persistCustomerUpdate,
    deleteCustomer: persistCustomerDelete,
    quoteRequests = [],
    consultationRequests = [],
    updateQuoteStatus,
    updateConsultationStatus,
    updateQuoteAdminNotes,
    updateConsultationAdminNotes,
  } = useData();

  const notify = useCallback((payload: { type?: string; message: string }) => {
    if (payload.type === 'success') toast.success(payload.message);
    else if (payload.type === 'info') toast(payload.message);
    else toast.error(payload.message);
  }, []);

  const baseAddCustomer = useCallback(async (customerData: Omit<CustomerContact, 'id' | 'createdAt'>): Promise<CustomerContact> => {
    const created: CustomerContact = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    persistCustomer(created);
    return created;
  }, [persistCustomer]);

  const baseUpdateCustomer = useCallback(async (id: string, updates: Partial<CustomerContact>): Promise<void> => {
    persistCustomerUpdate(id, updates);
  }, [persistCustomerUpdate]);

  const baseDeleteCustomer = useCallback(async (id: string): Promise<void> => {
    persistCustomerDelete(id);
  }, [persistCustomerDelete]);

  // Internal Navigation & Filter State
  const [activeTab, setActiveTab] = useState<CrmSubTab>('pipeline');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');

  // Customer Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerContact | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);

  const openNewCustomerModal = useCallback((prefillStage: PipelineStage = 'new_lead') => {
    setSelectedCustomer({
      id: '',
      fullName: '',
      phoneNumber: '',
      companyName: '',
      role: '',
      source: 'manual',
      notes: '',
      createdAt: new Date().toISOString(),
      pipelineStage: prefillStage,
      dealValue: '',
      farmCapacity: '',
      province: '',
      tags: [],
      followUpPriority: 'medium',
      followUpStatus: 'none',
      followUpHistory: []
    });
    setIsCustomerModalOpen(true);
  }, []);

  const openEditCustomerModal = useCallback((customer: CustomerContact) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  }, []);

  const closeCustomerModal = useCallback(() => {
    setSelectedCustomer(null);
    setIsCustomerModalOpen(false);
  }, []);

  const openLeadFromContact = useCallback(async (customer: CustomerContact, stage: PipelineStage = 'new_lead') => {
    if (isPersonaContact(customer)) return;
    const nextStage = stage === 'directory' ? 'new_lead' : stage;
    await baseUpdateCustomer(customer.id, { pipelineStage: nextStage });
    setSelectedCustomer({ ...customer, pipelineStage: nextStage });
    setIsCustomerModalOpen(true);
    notify({
      type: 'success',
      message: `«${customer.fullName}» سرنخ شد و در پایپ‌لاین قرار گرفت.`
    });
  }, [baseUpdateCustomer, notify]);

  const startLeadFromPersona = useCallback((persona: CustomerContact) => {
    setSelectedCustomer({
      id: '',
      fullName: '',
      phoneNumber: '',
      companyName: '',
      role: persona.role || '',
      source: 'manual',
      notes: persona.notes || '',
      createdAt: new Date().toISOString(),
      pipelineStage: 'new_lead',
      dealValue: '',
      farmCapacity: '',
      province: '',
      tags: [...(persona.tags || []).filter((tag) => tag !== 'پرسونا'), 'از پرسونا'],
      followUpPriority: persona.followUpPriority || 'medium',
      followUpStatus: 'none',
      followUpHistory: [],
      nextFollowUpDate: new Date().toISOString().split('T')[0],
      nextFollowUpTime: '10:00',
      nextFollowUpNote: `سرنخ ساخته‌شده از پرسونای «${persona.fullName}»`
    });
    setIsCustomerModalOpen(true);
  }, []);

  // CRUD Operations Wrapper
  const addCustomer = useCallback(async (customerData: Omit<CustomerContact, 'id' | 'createdAt'>): Promise<CustomerContact> => {
    const existing = findContactByPhone(customers, customerData.phoneNumber);
    if (existing) {
      const keepStage = isOpenLead(existing) && customerData.pipelineStage === 'directory'
        ? resolvePipelineStage(existing)
        : customerData.pipelineStage;
      const updates: Partial<CustomerContact> = {
        ...customerData,
        pipelineStage: keepStage,
        phoneNumber: existing.phoneNumber || customerData.phoneNumber,
        fullName: customerData.fullName || existing.fullName,
        notes: [existing.notes, customerData.notes].filter(Boolean).join('\n---\n'),
        tags: Array.from(new Set([...(existing.tags || []), ...(customerData.tags || [])])),
        followUpHistory: [
          ...(customerData.followUpHistory || []),
          ...(existing.followUpHistory || [])
        ]
      };
      await baseUpdateCustomer(existing.id, updates);
      notify({
        type: 'info',
        message: `شماره تکراری بود؛ اطلاعات روی مخاطب «${existing.fullName}» ذخیره شد.`
      });
      return { ...existing, ...updates };
    }

    const newCustomer = await baseAddCustomer(customerData);
    notify({
      type: 'success',
      message: customerData.pipelineStage === 'directory'
        ? `مخاطب «${customerData.fullName}» در بانک اطلاعاتی ثبت شد.`
        : `سرنخ «${customerData.fullName}» در پایپ‌لاین ثبت شد.`
    });
    return newCustomer;
  }, [baseAddCustomer, baseUpdateCustomer, customers, notify]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<CustomerContact>): Promise<void> => {
    await baseUpdateCustomer(id, updates);
    // If selected customer is currently open, keep it updated
    setSelectedCustomer(prev => (prev && prev.id === id ? { ...prev, ...updates } : prev));
  }, [baseUpdateCustomer]);

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    await baseDeleteCustomer(id);
    if (selectedCustomer?.id === id) {
      closeCustomerModal();
    }
    notify({
      type: 'info',
      message: 'پرونده مخاطب از سیستم حذف شد.'
    });
  }, [baseDeleteCustomer, selectedCustomer, closeCustomerModal, notify]);

  const addFollowUpLog = useCallback(async (
    customerId: string, 
    record: Omit<FollowUpRecord, 'id'>, 
    customNotes?: string
  ): Promise<void> => {
    const targetCustomer = customers.find(c => c.id === customerId);
    if (!targetCustomer) return;

    const recordDate = record.date || new Date().toISOString();
    const formattedDateTime = formatToShamsiDateTime(recordDate);
    const newLogLine = `[گزارش تماس - ${formattedDateTime}]: ${record.note}`;

    const updatedNotes = customNotes !== undefined
      ? customNotes
      : (targetCustomer.notes && targetCustomer.notes.trim()
          ? `${targetCustomer.notes.trim()}\n${newLogLine}`
          : newLogLine);

    const newHistoryItem: FollowUpRecord = {
      id: `fh-${Date.now()}`,
      date: recordDate,
      note: record.note,
      status: record.status || 'completed',
      priority: record.priority || targetCustomer.followUpPriority || 'medium'
    };

    const updatedHistory = [newHistoryItem, ...(targetCustomer.followUpHistory || [])];

    await baseUpdateCustomer(customerId, {
      notes: updatedNotes,
      followUpHistory: updatedHistory,
      lastFollowUpDate: recordDate
    });

    setSelectedCustomer(prev => {
      if (prev && prev.id === customerId) {
        return {
          ...prev,
          notes: updatedNotes,
          followUpHistory: updatedHistory,
          lastFollowUpDate: recordDate
        };
      }
      return prev;
    });

    notify({
      type: 'success',
      message: `گزارش تماس با درج تاریخ (${formattedDateTime}) در سوابق و توضیحات ثبت گردید.`
    });
  }, [customers, baseUpdateCustomer, notify]);

  const updatePipelineStage = useCallback(async (customerId: string, stage: PipelineStage): Promise<void> => {
    const target = customers.find((item) => item.id === customerId);
    if (target && isPersonaContact(target)) {
      notify({ type: 'info', message: 'پرسونا الگو است؛ برای فروش از روی آن سرنخ بسازید، خودش وارد پایپ‌لاین نمی‌شود.' });
      return;
    }
    await baseUpdateCustomer(customerId, { pipelineStage: stage });
  }, [baseUpdateCustomer, customers, notify]);

  const findContactByPhoneNumber = useCallback(
    (phone?: string) => findContactByPhone(customers, phone),
    [customers]
  );

  const importExcelRows = useCallback(async (rows: CrmExcelRowInput[]) => {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const working = [...customers];

    const take = (incoming: string, current?: string) => (incoming !== '' ? incoming : (current || ''));

    for (const [index, row] of rows.entries()) {
      const byId = row.id ? working.find((item) => item.id === row.id) : undefined;
      if (byId && isPersonaContact(byId)) {
        skipped += 1;
        continue;
      }
      const byPhone = findContactByPhone(working, row.phoneNumber);
      if (byPhone && isPersonaContact(byPhone)) {
        skipped += 1;
        continue;
      }
      const target = byId || byPhone;
      const pipelineStage = row.pipelineStage || (target ? resolvePipelineStage(target) : 'directory');
      const payload: Omit<CustomerContact, 'id' | 'createdAt'> = {
        fullName: row.fullName,
        phoneNumber: take(row.phoneNumber, target?.phoneNumber),
        email: take(row.email, target?.email),
        companyName: take(row.companyName, target?.companyName),
        role: take(row.role, target?.role),
        source: target?.source || 'excel-import',
        notes: take(row.notes, target?.notes),
        pipelineStage,
        dealValue: take(row.dealValue, target?.dealValue),
        farmCapacity: take(row.farmCapacity, target?.farmCapacity),
        province: take(row.province, target?.province),
        tags: row.tags.length ? row.tags : (target?.tags || []),
        nextFollowUpDate: take(row.nextFollowUpDate, target?.nextFollowUpDate),
        nextFollowUpTime: take(row.nextFollowUpTime, target?.nextFollowUpTime),
        nextFollowUpNote: take(row.nextFollowUpNote, target?.nextFollowUpNote),
        followUpPriority: row.followUpPriority || target?.followUpPriority || 'medium',
        followUpStatus: take(row.nextFollowUpDate, target?.nextFollowUpDate) ? 'pending' : (target?.followUpStatus || 'none'),
        followUpHistory: target?.followUpHistory || []
      };

      if (target) {
        await baseUpdateCustomer(target.id, payload);
        const idx = working.findIndex((item) => item.id === target.id);
        if (idx >= 0) working[idx] = { ...working[idx], ...payload };
        updated += 1;
      } else {
        const createdRecord: CustomerContact = {
          ...payload,
          id: `cust-imp-${Date.now()}-${index}`,
          createdAt: new Date().toISOString()
        };
        persistCustomer(createdRecord);
        working.unshift(createdRecord);
        created += 1;
      }
    }

    notify({
      type: created || updated ? 'success' : 'info',
      message: `ورود اکسل: ${created} جدید، ${updated} به‌روزرسانی${skipped ? `، ${skipped} نادیده` : ''}.`
    });
    return { created, updated, skipped };
  }, [baseUpdateCustomer, customers, notify, persistCustomer]);

  const markInboundLinked = useCallback((
    inboundId: string,
    type: 'quote' | 'consultation',
    customer: CustomerContact
  ) => {
    const note = `وصل به مخاطب ${customer.fullName} (${customer.id})`;
    if (type === 'quote') {
      updateQuoteStatus(inboundId, 'contacted');
      updateQuoteAdminNotes(inboundId, note);
    } else {
      updateConsultationStatus(inboundId, 'contacted');
      updateConsultationAdminNotes(inboundId, note);
    }
  }, [updateConsultationAdminNotes, updateConsultationStatus, updateQuoteAdminNotes, updateQuoteStatus]);

  const convertInboundToCustomer = useCallback(async (
    inbound: QuoteRequestItem | ConsultationRequestItem,
    type: 'quote' | 'consultation',
    targetContactId?: string
  ): Promise<CustomerContact> => {
    const isQuote = type === 'quote';
    const data = inbound.formData as {
      fullName?: string;
      phoneNumber?: string;
      email?: string;
      companyName?: string;
      additionalNotes?: string;
      message?: string;
      capacity?: string;
      projectCapacity?: string;
      deliveryLocation?: string;
      location?: string;
    };

    const inboundNote = `ثبت فرم سایت (${isQuote ? 'استعلام قیمت' : 'مشاوره'}): ${data.additionalNotes || data.message || 'بدون یادداشت'}\nظرفیت: ${data.capacity || data.projectCapacity || 'مشخص نشده'}\nموقعیت: ${data.deliveryLocation || data.location || ''}`;

    const matched = targetContactId
      ? customers.find((item) => item.id === targetContactId)
      : findContactByPhone(customers, data.phoneNumber);

    if (matched && !isPersonaContact(matched)) {
      const nextStage = isPipelineCard(matched) ? resolvePipelineStage(matched) : 'new_lead';
      const updates: Partial<CustomerContact> = {
        phoneNumber: matched.phoneNumber || data.phoneNumber || '',
        email: matched.email || data.email || '',
        companyName: matched.companyName || data.companyName || '',
        farmCapacity: matched.farmCapacity || data.capacity || data.projectCapacity || '',
        province: matched.province || data.deliveryLocation || data.location || '',
        notes: [matched.notes, inboundNote].filter(Boolean).join('\n---\n'),
        tags: Array.from(new Set([...(matched.tags || []), isQuote ? 'استعلام سایت' : 'مشاوره سایت'])),
        pipelineStage: nextStage,
        linkedInboundIds: Array.from(new Set([...(matched.linkedInboundIds || []), inbound.id])),
        followUpPriority: matched.followUpPriority || 'high',
        followUpStatus: matched.nextFollowUpDate ? matched.followUpStatus : 'pending',
        nextFollowUpDate: matched.nextFollowUpDate || new Date().toISOString().split('T')[0],
        nextFollowUpTime: matched.nextFollowUpTime || '10:00',
        nextFollowUpNote: matched.nextFollowUpNote || 'پیگیری فرم ورودی سایت'
      };
      await baseUpdateCustomer(matched.id, updates);
      markInboundLinked(inbound.id, type, matched);
      const merged = { ...matched, ...updates };
      setSelectedCustomer(merged);
      setIsCustomerModalOpen(true);
      notify({
        type: 'success',
        message: `فرم به مخاطب «${matched.fullName}» وصل شد و در پایپ‌لاین قرار گرفت.`
      });
      return merged;
    }

    const newCustomerData: Omit<CustomerContact, 'id' | 'createdAt'> = {
      fullName: data.fullName || 'سرنخ ورودی وب‌سایت',
      phoneNumber: data.phoneNumber || '',
      email: data.email || '',
      companyName: data.companyName || '',
      role: '',
      source: isQuote ? 'استعلام قیمت سایت' : 'درخواست مشاوره فنی سایت',
      notes: inboundNote,
      pipelineStage: 'new_lead',
      dealValue: '',
      farmCapacity: data.capacity || data.projectCapacity || '',
      province: data.deliveryLocation || data.location || '',
      tags: [isQuote ? 'استعلام سایت' : 'مشاوره سایت'],
      linkedInboundIds: [inbound.id],
      nextFollowUpDate: new Date().toISOString().split('T')[0],
      nextFollowUpTime: '10:00',
      nextFollowUpNote: 'تماس اولیه بابت فرم سایت',
      followUpPriority: 'high',
      followUpStatus: 'pending',
      followUpHistory: [
        {
          id: `fup_${Date.now()}`,
          date: new Date().toISOString(),
          note: `ثبت فرم ورودی وب‌سایت (${isQuote ? 'استعلام قیمت' : 'مشاوره'})`,
          status: 'completed',
          priority: 'high'
        }
      ]
    };

    const created = await baseAddCustomer(newCustomerData);
    markInboundLinked(inbound.id, type, created);
    notify({
      type: 'success',
      message: `سرنخ «${newCustomerData.fullName}» ساخته شد و در پایپ‌لاین قرار گرفت.`
    });
    setSelectedCustomer(created);
    setIsCustomerModalOpen(true);
    return created;
  }, [baseAddCustomer, baseUpdateCustomer, customers, markInboundLinked, notify]);

  // Merge duplicate contacts
  const mergeDuplicates = useCallback(async (targetId: string, sourceIds: string[]): Promise<void> => {
    const target = customers.find(c => c.id === targetId);
    if (!target) return;

    const sources = customers.filter(c => sourceIds.includes(c.id));
    
    // Combine notes and follow-ups
    const combinedNotes = [
      target.notes,
      ...sources.map(s => `[ادغام از ${s.fullName} - ${s.phoneNumber}]: ${s.notes || ''}`)
    ].filter(Boolean).join('\n---\n');

    const combinedTags = Array.from(new Set([
      ...(target.tags || []),
      ...sources.flatMap(s => s.tags || [])
    ]));

    const combinedHistory = [
      ...(target.followUpHistory || []),
      ...sources.flatMap(s => s.followUpHistory || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Update target
    await baseUpdateCustomer(targetId, {
      notes: combinedNotes,
      tags: combinedTags,
      followUpHistory: combinedHistory,
      farmCapacity: target.farmCapacity || sources.find(s => s.farmCapacity)?.farmCapacity,
      dealValue: target.dealValue || sources.find(s => s.dealValue)?.dealValue,
      province: target.province || sources.find(s => s.province)?.province,
      companyName: target.companyName || sources.find(s => s.companyName)?.companyName
    });

    // Delete merged sources
    for (const s of sources) {
      await baseDeleteCustomer(s.id);
    }

    notify({
      type: 'success',
      message: `تعداد ${sources.length} مخاطب تکراری در پرونده «${target.fullName}» با موفقیت ادغام شدند.`
    });
  }, [customers, baseUpdateCustomer, baseDeleteCustomer, notify]);

  // Detected duplicate groups
  const duplicateGroups = useMemo(() => {
    return detectAllDuplicateGroups(customers);
  }, [customers]);

  // Calculated Stats
  const stats = useMemo<CrmStats>(() => {
    const safeList = customers || [];
    let dealSum = 0;
    let wonSum = 0;
    let todayFup = 0;
    let overdueFup = 0;

    safeList.forEach(c => {
      if (isPersonaContact(c) || !isPipelineCard(c)) return;
      const val = parseFloat((c.dealValue || '0').replace(/[^0-9.]/g, '')) || 0;
      if (c.pipelineStage === 'won') {
        wonSum += val;
      } else if (c.pipelineStage !== 'lost') {
        dealSum += val;
      }

      if (c.followUpStatus !== 'completed' && c.nextFollowUpDate) {
        const u = getFollowUpUrgency(c.nextFollowUpDate, c.nextFollowUpTime, c.followUpStatus);
        if (u.urgency === 'today') todayFup++;
        if (u.urgency === 'overdue') overdueFup++;
      }
    });

    const activeLeads = safeList.filter((c) => isOpenLead(c)).length;
    const openInbound =
      (quoteRequests || []).filter((item) => isOpenInbound(item.status)).length +
      (consultationRequests || []).filter((item) => isOpenInbound(item.status)).length;

    return {
      totalContacts: safeList.length,
      activeLeads,
      totalDealValue: dealSum,
      wonDealValue: wonSum,
      todayFollowUps: todayFup,
      overdueFollowUps: overdueFup,
      duplicateCount: duplicateGroups.length,
      inboundLeadsCount: openInbound
    };
  }, [customers, duplicateGroups, quoteRequests, consultationRequests]);

  // Filtered customers for contacts and pipeline
  const filteredCustomers = useMemo(() => {
    return (customers || []).filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (c.fullName || '').toLowerCase().includes(q);
        const matchPhone = (c.phoneNumber || '').includes(q) || normalizePhoneNumber(c.phoneNumber).includes(normalizePhoneNumber(q));
        const matchCompany = (c.companyName || '').toLowerCase().includes(q);
        const matchProvince = (c.province || '').toLowerCase().includes(q);
        const matchNotes = (c.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCompany && !matchProvince && !matchNotes) {
          return false;
        }
      }

      // Stage Filter
      if (stageFilter !== 'all') {
        if ((c.pipelineStage || 'new_lead') !== stageFilter) return false;
      }

      // Priority Filter
      if (priorityFilter !== 'all') {
        if ((c.followUpPriority || 'medium') !== priorityFilter) return false;
      }

      // Province Filter
      if (provinceFilter !== 'all') {
        if (c.province !== provinceFilter) return false;
      }

      return true;
    });
  }, [customers, searchQuery, stageFilter, priorityFilter, provinceFilter]);

  return (
    <CrmContext.Provider
      value={{
        customers,
        quoteRequests,
        consultationRequests,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        stageFilter,
        setStageFilter,
        priorityFilter,
        setPriorityFilter,
        provinceFilter,
        setProvinceFilter,
        selectedCustomer,
        setSelectedCustomer,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        openNewCustomerModal,
        openEditCustomerModal,
        closeCustomerModal,
        openLeadFromContact,
        startLeadFromPersona,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addFollowUpLog,
        updatePipelineStage,
        convertInboundToCustomer,
        mergeDuplicates,
        findContactByPhoneNumber,
        importExcelRows,
        stats,
        duplicateGroups,
        filteredCustomers
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
