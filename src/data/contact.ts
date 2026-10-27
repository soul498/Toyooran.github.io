/**
 * Public phone numbers. Every visible number and tel: link uses these constants:
 * the mobile line for consultation, sales and support, plus the Mashhad office landline.
 * Retired numbers (e.g. 0915…) must not come back as fallbacks.
 */
export const SALES_PHONE_DISPLAY = '۰۹۱۱ ۵۱۱ ۶۲۵۸';
export const SALES_PHONE_E164 = '+989115116258';
export const SALES_PHONE_TEL = `tel:${SALES_PHONE_E164}`;

export const OFFICE_PHONE_LABEL = 'تلفن دفتر';
export const OFFICE_PHONE_DISPLAY = '۰۵۱ ۳۶۶۶ ۵۶۰۰';
export const OFFICE_PHONE_E164 = '+985136665600';
export const OFFICE_PHONE_TEL = `tel:${OFFICE_PHONE_E164}`;
