import * as XLSX from 'xlsx';
import { CustomerContact, PipelineStage } from '../types/crm.types';
import { CONTACT_STAGE_OPTIONS, DIRECTORY_STAGE } from '../components/common/crmConstants';
import { isPersonaContact, resolvePipelineStage } from './crmRecords';
import { normalizePhoneNumber } from './crmPhoneUtils';

export const CRM_EXCEL_SHEET = 'مخاطبین';
export const CRM_EXCEL_GUIDE_SHEET = 'راهنما';

export const CRM_EXCEL_HEADERS = [
  'شناسه',
  'نام کامل',
  'شماره تماس',
  'شرکت یا فارم',
  'نقش',
  'ایمیل',
  'استان',
  'مرحله فروش',
  'ارزش معامله',
  'ظرفیت سالن',
  'تاریخ پیگیری',
  'ساعت پیگیری',
  'یادداشت پیگیری',
  'اولویت پیگیری',
  'برچسب‌ها',
  'توضیحات'
] as const;

const STAGE_LABELS: Record<string, string> = {
  directory: DIRECTORY_STAGE.title,
  new_lead: 'سرنخ جدید',
  contacted: 'ارزیابی',
  consulting: 'مشاوره',
  proposal: 'پیش‌فاکتور',
  negotiation: 'مذاکره',
  won: 'قرارداد',
  lost: 'لغو'
};

const STAGE_ALIASES: Record<string, PipelineStage> = {
  directory: 'directory',
  'بانک': 'directory',
  'بانک مخاطبین': 'directory',
  'بانک مخاطبین (بدون سرنخ)': 'directory',
  مخاطب: 'directory',
  new_lead: 'new_lead',
  'سرنخ': 'new_lead',
  'سرنخ جدید': 'new_lead',
  contacted: 'contacted',
  ارزیابی: 'contacted',
  'ارزیابی و صلاحیت‌سنجی': 'contacted',
  consulting: 'consulting',
  مشاوره: 'consulting',
  'مشاوره فنی و طراحی': 'consulting',
  proposal: 'proposal',
  'پیش‌فاکتور': 'proposal',
  'پیش‌فاکتور و استعلام': 'proposal',
  negotiation: 'negotiation',
  مذاکره: 'negotiation',
  'مذاکره نهایی و مالی': 'negotiation',
  won: 'won',
  قرارداد: 'won',
  'قرارداد و تحویل موفق': 'won',
  lost: 'lost',
  لغو: 'lost',
  'عدم توافق / لغو': 'lost'
};

const PRIORITY_ALIASES: Record<string, 'high' | 'medium' | 'low'> = {
  high: 'high',
  فوری: 'high',
  'فوری / حساس': 'high',
  medium: 'medium',
  معمولی: 'medium',
  عادی: 'medium',
  low: 'low',
  کم: 'low',
  کم‌اهمیت: 'low'
};

export interface CrmExcelRowInput {
  fullName: string;
  phoneNumber: string;
  companyName: string;
  role: string;
  email: string;
  province: string;
  pipelineStage: PipelineStage;
  dealValue: string;
  farmCapacity: string;
  nextFollowUpDate: string;
  nextFollowUpTime: string;
  nextFollowUpNote: string;
  followUpPriority: 'high' | 'medium' | 'low';
  tags: string[];
  notes: string;
  id: string;
}

export interface CrmExcelParseResult {
  rows: CrmExcelRowInput[];
  errors: string[];
}

function cell(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function normalizeHeader(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
}

function lookup(record: Record<string, unknown>, names: string[]): string {
  const map: Record<string, unknown> = {};
  Object.keys(record).forEach((key) => {
    map[normalizeHeader(key)] = record[key];
  });
  for (const name of names) {
    const found = map[normalizeHeader(name)];
    if (found !== undefined && found !== null && String(found).trim() !== '') {
      return cell(found);
    }
  }
  return '';
}

function parseStage(raw: string): PipelineStage {
  const key = normalizeHeader(raw).toLowerCase();
  if (!key) return 'directory';
  const fromAlias = STAGE_ALIASES[raw] || STAGE_ALIASES[normalizeHeader(raw)] || STAGE_ALIASES[key];
  if (fromAlias) return fromAlias;
  const fromConfig = CONTACT_STAGE_OPTIONS.find(
    (item) => item.id === raw || item.title === raw || item.title === normalizeHeader(raw)
  );
  return (fromConfig?.id as PipelineStage) || 'new_lead';
}

function parsePriority(raw: string): 'high' | 'medium' | 'low' {
  const key = normalizeHeader(raw);
  return PRIORITY_ALIASES[key] || PRIORITY_ALIASES[key.toLowerCase()] || 'medium';
}

function parseTags(raw: string): string[] {
  if (!raw) return [];
  return raw.split(/[,،;؛|]/).map((item) => item.trim()).filter(Boolean);
}

function parseFollowUpDate(raw: string): string {
  const value = cell(raw);
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const excelDate = Number(value);
  if (Number.isFinite(excelDate) && excelDate > 20000) {
    const parsed = XLSX.SSF.parse_date_code(excelDate);
    if (parsed) {
      const month = String(parsed.m).padStart(2, '0');
      const day = String(parsed.d).padStart(2, '0');
      return `${parsed.y}-${month}-${day}`;
    }
  }
  return value;
}

function toRow(customer: CustomerContact): (string | number)[] {
  const stage = resolvePipelineStage(customer);
  return [
    customer.id || '',
    customer.fullName || '',
    customer.phoneNumber || '',
    customer.companyName || '',
    customer.role || '',
    customer.email || '',
    customer.province || '',
    STAGE_LABELS[stage] || stage,
    customer.dealValue || '',
    customer.farmCapacity || '',
    customer.nextFollowUpDate || '',
    customer.nextFollowUpTime || '',
    customer.nextFollowUpNote || '',
    customer.followUpPriority === 'high' ? 'فوری' : customer.followUpPriority === 'low' ? 'کم' : 'معمولی',
    (customer.tags || []).filter((tag) => tag !== 'پرسونا').join('، '),
    customer.notes || ''
  ];
}

function buildGuideSheet(): XLSX.WorkSheet {
  const lines: (string | number)[][] = [
    ['قالب ورود داده CRM طیوران'],
    ['برگه «مخاطبین» را پر کنید و همان فایل را از داخل CRM وارد کنید.'],
    [''],
    ['مخاطب چیست؟', 'فرد یا فارم در بانک اطلاعاتی. مرحله فروش = بانک مخاطبین'],
    ['سرنخ چیست؟', 'همان مخاطب وقتی فرصت فروش باز است. یکی از مراحل قیف را بگذارید.'],
    ['شناسه', 'خالی بگذارید تا رکورد جدید ساخته شود. اگر شناسه یا شماره تماس موجود باشد، همان پرونده به‌روز می‌شود.'],
    ['شماره تماس', 'برای سرنخ الزامی است. فارسی یا انگلیسی پذیرفته می‌شود.'],
    ['تاریخ پیگیری', 'میلادی به‌صورت 2026-09-28'],
    ['ساعت پیگیری', 'مثلاً 10:00'],
    ['برچسب‌ها', 'با ویرگول جدا کنید'],
    [''],
    ['مقادیر مجاز مرحله فروش'],
    ...CONTACT_STAGE_OPTIONS.map((item) => [STAGE_LABELS[item.id] || item.title, item.id, item.desc]),
    [''],
    ['اولویت پیگیری', 'فوری', 'معمولی', 'کم']
  ];
  return XLSX.utils.aoa_to_sheet(lines);
}

function buildContactsSheet(customers: CustomerContact[], includeSamples: boolean): XLSX.WorkSheet {
  const body = customers.filter((item) => !isPersonaContact(item)).map(toRow);
  if (includeSamples && body.length === 0) {
    body.push([
      'sample-contact',
      'نمونه مخاطب — این ردیف را پاک کنید',
      '09120000000',
      'مرغداری نمونه',
      '',
      '',
      'مازندران',
      STAGE_LABELS.directory,
      '',
      '30000',
      '',
      '',
      '',
      'معمولی',
      'نمونه',
      'فقط دفترچه تماس؛ وارد پایپ‌لاین نمی‌شود.'
    ]);
    body.push([
      'sample-lead',
      'نمونه سرنخ — این ردیف را پاک کنید',
      '09121111111',
      'پروژه تجهیز سالن',
      '',
      '',
      'گلستان',
      STAGE_LABELS.new_lead,
      '',
      '40000',
      '2026-10-01',
      '10:00',
      'تماس اولیه و ارسال کاتالوگ',
      'فوری',
      'نمونه، استعلام',
      'سرنخ یعنی فرصت فروش روی همین مخاطب.'
    ]);
  }
  const sheet = XLSX.utils.aoa_to_sheet([
    [...CRM_EXCEL_HEADERS],
    ...body
  ]);
  sheet['!cols'] = CRM_EXCEL_HEADERS.map((header) => ({
    wch: Math.max(14, header.length + 4)
  }));
  return sheet;
}

function workbookFromCustomers(customers: CustomerContact[], includeSamples: boolean): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildContactsSheet(customers, includeSamples), CRM_EXCEL_SHEET);
  XLSX.utils.book_append_sheet(workbook, buildGuideSheet(), CRM_EXCEL_GUIDE_SHEET);
  return workbook;
}

function downloadWorkbook(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx', compression: true });
}

export function downloadCrmExcelTemplate(): void {
  downloadWorkbook(workbookFromCustomers([], true), 'toyooran-crm-template.xlsx');
}

export function exportContactsToExcel(customers: CustomerContact[]): void {
  const real = (customers || []).filter((item) => !isPersonaContact(item));
  downloadWorkbook(
    workbookFromCustomers(real, real.length === 0),
    `toyooran-crm-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

function isSampleRow(row: CrmExcelRowInput): boolean {
  const id = row.id.toLowerCase();
  const name = row.fullName;
  return (
    id.startsWith('sample-') ||
    name.includes('نمونه مخاطب') ||
    name.includes('نمونه سرنخ') ||
    name.startsWith('نمونه ')
  );
}

export function parseCrmExcelFile(data: ArrayBuffer, fileName = ''): CrmExcelParseResult {
  const errors: string[] = [];
  const rows: CrmExcelRowInput[] = [];
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const preferred =
    workbook.SheetNames.find((name) => name === CRM_EXCEL_SHEET) ||
    workbook.SheetNames.find((name) => name.includes('مخاطب')) ||
    workbook.SheetNames[0];

  if (!preferred || preferred === CRM_EXCEL_GUIDE_SHEET) {
    return { rows: [], errors: ['برگه مخاطبین در فایل پیدا نشد.'] };
  }

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[preferred], {
    defval: '',
    raw: false
  });

  json.forEach((record, index) => {
    const line = index + 2;
    const fullName = lookup(record, ['نام کامل', 'نام و نام خانوادگی', 'نام', 'fullName']);
    const id = lookup(record, ['شناسه', 'id']);
    if (!fullName && !id) return;

    if (!fullName) {
      errors.push(`ردیف ${line}: نام کامل خالی است.`);
      return;
    }

    const phoneNumber = lookup(record, ['شماره تماس', 'موبایل', 'phone']);
    const pipelineStage = parseStage(lookup(record, ['مرحله فروش', 'مرحله', 'pipelineStage', 'stage']));
    const parsed: CrmExcelRowInput = {
      id,
      fullName,
      phoneNumber: normalizePhoneNumber(phoneNumber) || phoneNumber,
      companyName: lookup(record, ['شرکت یا فارم', 'نام واحد / فارم', 'شرکت', 'فارم']),
      role: lookup(record, ['نقش', 'سمت']),
      email: lookup(record, ['ایمیل', 'email']),
      province: lookup(record, ['استان']),
      pipelineStage,
      dealValue: lookup(record, ['ارزش معامله', 'ارزش معامله (تومان)']),
      farmCapacity: lookup(record, ['ظرفیت سالن', 'ظرفیت سالن (قطعه)']),
      nextFollowUpDate: parseFollowUpDate(lookup(record, ['تاریخ پیگیری', 'موعد پیگیری بعدی'])),
      nextFollowUpTime: lookup(record, ['ساعت پیگیری']) || (lookup(record, ['تاریخ پیگیری']) ? '10:00' : ''),
      nextFollowUpNote: lookup(record, ['یادداشت پیگیری']),
      followUpPriority: parsePriority(lookup(record, ['اولویت پیگیری', 'اولویت'])),
      tags: parseTags(lookup(record, ['برچسب‌ها', 'برچسب'])),
      notes: lookup(record, ['توضیحات', 'یادداشت'])
    };

    if (isSampleRow(parsed)) return;

    if (pipelineStage !== 'directory' && !parsed.phoneNumber) {
      errors.push(`ردیف ${line} (${fullName}): سرنخ بدون شماره تماس وارد نشد.`);
      return;
    }

    rows.push(parsed);
  });

  if (!rows.length && !errors.length) {
    errors.push(fileName ? `در «${fileName}» ردیف قابل ورود پیدا نشد.` : 'ردیف قابل ورود پیدا نشد.');
  }

  return { rows, errors };
}
