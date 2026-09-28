import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCrm } from '../../hooks/useCrm';
import { downloadCrmExcelTemplate, exportContactsToExcel, parseCrmExcelFile } from '../../utils/crmExcel';

export const CrmExcelActions: React.FC = () => {
  const { customers, importExcelRows } = useCrm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    try {
      const parsed = parseCrmExcelFile(await file.arrayBuffer(), file.name);
      if (parsed.errors.length) {
        parsed.errors.slice(0, 4).forEach((message) => toast.error(message));
        if (parsed.errors.length > 4) {
          toast.error(`${parsed.errors.length - 4} خطای دیگر در فایل.`);
        }
      }
      if (parsed.rows.length) {
        await importExcelRows(parsed.rows);
      }
    } catch {
      toast.error('خواندن فایل اکسل ممکن نشد. قالب CRM را دانلود و همان ساختار را نگه دارید.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="crm-actions">
      <button type="button" className="crm-btn" onClick={() => downloadCrmExcelTemplate()}>
        قالب اکسل
      </button>
      <button type="button" className="crm-btn" onClick={() => exportContactsToExcel(customers)}>
        خروجی اکسل
      </button>
      <button
        type="button"
        className="crm-btn"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? 'در حال ورود…' : 'ورود اکسل'}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="crm-file-input"
        onChange={handleImport}
      />
    </div>
  );
};
