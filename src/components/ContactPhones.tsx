import React from 'react';
import {
  OFFICE_PHONE_DISPLAY,
  OFFICE_PHONE_LABEL,
  OFFICE_PHONE_TEL,
  SALES_PHONE_ALT_DISPLAY,
  SALES_PHONE_ALT_TEL,
  SALES_PHONE_DISPLAY,
  SALES_PHONE_TEL,
} from '../data/contact';
import { t, tr } from '../i18n';

type ContactPhonesProps = {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export const PhoneLink: React.FC<{ href: string; children: string; className?: string }> = ({ href, children, className = '' }) => (
  <a href={href} dir="ltr" className={`phone-num ${className}`.trim()}>{children}</a>
);

/** Public contact numbers: Estedad, tel: links, selectable. The two mobile lines stay on separate rows. */
export const ContactPhones: React.FC<ContactPhonesProps> = ({ tone = 'light', size = 'md', className = '' }) => (
  <div className={`contact-phones contact-phones--${tone} contact-phones--${size}${className ? ` ${className}` : ''}`}>
    <p className="contact-phones-kicker">{t("مشاوره، فروش و پشتیبانی:")}</p>
    <div className="contact-phones-sales">
      <PhoneLink href={SALES_PHONE_TEL}>{tr(SALES_PHONE_DISPLAY)}</PhoneLink>
      <PhoneLink href={SALES_PHONE_ALT_TEL}>{tr(SALES_PHONE_ALT_DISPLAY)}</PhoneLink>
    </div>
    <p className="contact-phones-kicker contact-phones-kicker--office">{tr(OFFICE_PHONE_LABEL)}:</p>
    <PhoneLink href={OFFICE_PHONE_TEL}>{tr(OFFICE_PHONE_DISPLAY)}</PhoneLink>
  </div>
);
