import React, { useMemo, useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  MessageSquareText, 
  Check, 
  UserPlus
} from '../../lucide';
import { useCrm } from '../../hooks/useCrm';
import { formatPhoneNumberDisplay, toPersianDigits } from '../../utils/crmPhoneUtils';
import { formatToShamsi } from '../../utils/crmDateUtils';
import { isOpenInbound, isPersonaContact } from '../../utils/crmRecords';
import { CustomerContact, QuoteRequestItem, ConsultationRequestItem } from '../../types/crm.types';

type InboundKind = 'quote' | 'consultation';

export const CrmInboundView: React.FC = () => {
  const {
    quoteRequests,
    consultationRequests,
    convertInboundToCustomer,
    customers,
    findContactByPhoneNumber,
    openEditCustomerModal
  } = useCrm();

  const [pickerFor, setPickerFor] = useState<{ id: string; type: InboundKind } | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const directoryContacts = useMemo(
    () => customers.filter((item) => !isPersonaContact(item)),
    [customers]
  );

  const pickerResults = useMemo(() => {
    if (!pickerQuery.trim()) return directoryContacts.slice(0, 8);
    const q = pickerQuery.toLowerCase().trim();
    return directoryContacts
      .filter((item) =>
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.phoneNumber || '').includes(q) ||
        (item.companyName || '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [directoryContacts, pickerQuery]);

  const renderActions = (
    item: QuoteRequestItem | ConsultationRequestItem,
    type: InboundKind,
    phone?: string
  ) => {
    const matched = findContactByPhoneNumber(phone);
    const converted = !isOpenInbound(item.status) || Boolean(matched && (matched.linkedInboundIds || []).includes(item.id));

    if (converted && matched) {
      return (
        <button
          type="button"
          onClick={() => openEditCustomerModal(matched)}
          className="flex items-center gap-1 text-emerald-400 text-xs font-bold"
        >
          <Check className="w-3.5 h-3.5" />
          <span>وصل به {matched.fullName}</span>
        </button>
      );
    }

    if (!isOpenInbound(item.status)) {
      return (
        <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
          <Check className="w-3.5 h-3.5" />
          <span>پردازش شده</span>
        </span>
      );
    }

    const isPicking = pickerFor?.id === item.id && pickerFor.type === type;

    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {matched ? (
            <button
              type="button"
              onClick={() => convertInboundToCustomer(item, type, matched.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>وصل به {matched.fullName}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => convertInboundToCustomer(item, type)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت سرنخ جدید</span>
            </button>
          )}
          <button
            type="button"
            className="text-[11px] text-slate-400"
            onClick={() => {
              setPickerFor(isPicking ? null : { id: item.id, type });
              setPickerQuery('');
            }}
          >
            {isPicking ? 'بستن فهرست' : 'انتخاب از مخاطبین'}
          </button>
        </div>
        {isPicking && (
          <div className="crm-picker w-72 max-w-full">
            <input
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="جستجوی مخاطب موجود..."
            />
            <div className="crm-picker-list">
              {pickerResults.length === 0 ? (
                <p className="text-[11px] text-slate-500">مخاطبی پیدا نشد.</p>
              ) : (
                pickerResults.map((contact: CustomerContact) => (
                  <button
                    key={contact.id}
                    type="button"
                    className="crm-picker-item"
                    onClick={() => {
                      convertInboundToCustomer(item, type, contact.id);
                      setPickerFor(null);
                    }}
                  >
                    {contact.fullName}
                    <span className="block text-[10px] text-slate-500">
                      {formatPhoneNumberDisplay(contact.phoneNumber)} {contact.companyName || ''}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">فرم‌های سایت، هنوز مخاطب نیستند</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            اگر شماره از قبل در بانک باشد به همان مخاطب وصل می‌شود؛ وگرنه سرنخ جدید ساخته می‌شود.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">استعلام‌های پیش‌فاکتور و کاتالوگ</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              {toPersianDigits(quoteRequests.length)} مورد
            </span>
          </div>

          <div className="space-y-2.5">
            {quoteRequests.length === 0 ? (
              <div className="py-10 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                هیچ استعلام قیمتی ثبت نشده است.
              </div>
            ) : (
              quoteRequests.map((item) => {
                const formData = item.formData;
                return (
                  <div key={item.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-white">{formData.fullName || 'کاربر وب‌سایت'}</h4>
                        {formData.companyName && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{formData.companyName}</div>
                        )}
                      </div>
                      <span className="font-mono text-xs text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {formatPhoneNumberDisplay(formData.phoneNumber)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 space-y-1">
                      {formData.projectType && <div>نوع پروژه: {formData.projectType}</div>}
                      {formData.capacity && <div>ظرفیت سالن: {toPersianDigits(formData.capacity)}</div>}
                      {formData.deliveryLocation && <div>محل تحویل: {formData.deliveryLocation}</div>}
                      {formData.additionalNotes && <div className="text-slate-400 mt-1 italic">«{formData.additionalNotes}»</div>}
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] gap-3">
                      <span className="text-slate-500 text-[10px]">
                        {item.createdAt ? formatToShamsi(item.createdAt.split('T')[0]) : ''}
                      </span>
                      {renderActions(item, 'quote', formData.phoneNumber)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white">درخواست‌های مشاوره فنی و طراحی</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              {toPersianDigits(consultationRequests.length)} مورد
            </span>
          </div>

          <div className="space-y-2.5">
            {consultationRequests.length === 0 ? (
              <div className="py-10 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                هیچ درخواست مشاوره‌ای ثبت نشده است.
              </div>
            ) : (
              consultationRequests.map((item) => {
                const formData = item.formData;
                return (
                  <div key={item.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-white">{formData.fullName || 'کاربر وب‌سایت'}</h4>
                        {formData.projectType && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{formData.projectType}</div>
                        )}
                      </div>
                      <span className="font-mono text-xs text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {formatPhoneNumberDisplay(formData.phoneNumber)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 space-y-1">
                      {formData.projectCapacity && <div>ظرفیت سالن: {toPersianDigits(formData.projectCapacity)}</div>}
                      {formData.location && <div>موقعیت مزرعه: {formData.location}</div>}
                      {formData.message && <div className="text-slate-400 mt-1 italic">«{formData.message}»</div>}
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] gap-3">
                      <span className="text-slate-500 text-[10px]">
                        {item.createdAt ? formatToShamsi(item.createdAt.split('T')[0]) : ''}
                      </span>
                      {renderActions(item, 'consultation', formData.phoneNumber)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
