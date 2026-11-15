import React from 'react';

/** Bale Messenger mark: filled chat bubble, same size contract as AparatIcon. */
export const BaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const { role: _ignoredRole, ...rest } = props;
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      {...rest}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19.2 3.2H8.8A4.8 4.8 0 0 0 4 8v6.4A4.8 4.8 0 0 0 8.8 19.2h.7l-2.4 3.2a.72.72 0 0 0 1.14.86L13 19.2h6.2A4.8 4.8 0 0 0 24 14.4V8a4.8 4.8 0 0 0-4.8-4.8z" />
    </svg>
  );
};
