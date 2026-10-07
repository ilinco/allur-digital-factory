export interface IllustrationProps {
  className?: string;
}

// 1. Склад комплектующих (Логистика, паллеты с деталями, изометрия)
export const WarehouseInIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-warehouse" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.32" filter="url(#shadow-warehouse)">
      <polygon points="35,45 85,22 110,40 60,63" fill="#0d9488" />
      <polygon points="35,45 60,63 60,92 35,74" fill="#0d9488" />
      <polygon points="60,63 110,40 110,69 60,92" fill="#0d9488" />
    </g>
    <g stroke="#0f766e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="32,42 82,19 107,37 57,60" fill="#f0fdfa" fillOpacity="0.8" />
      <polygon points="32,42 57,60 57,89 32,71" fill="#ccfbf1" fillOpacity="0.5" />
      <line x1="39" y1="49" x2="39" y2="76" strokeDasharray="3 3" opacity="0.7" />
      <line x1="48" y1="55" x2="48" y2="83" strokeDasharray="3 3" opacity="0.7" />
      <polygon points="57,60 107,37 107,66 57,89" fill="#99f6e4" fillOpacity="0.35" />
      <path d="M48 44 L78 30 M78 30 L68 28 M78 30 L74 38" strokeWidth="2.5" />
      <polygon points="68,24 93,12 108,22 83,34" fill="#f0fdfa" />
      <polygon points="68,24 83,34 83,44 68,34" fill="#ccfbf1" />
      <polygon points="83,34 108,22 108,32 83,44" fill="#99f6e4" />
      <line x1="28" y1="73" x2="53" y2="91" />
      <line x1="53" y1="91" x2="103" y2="68" />
      <line x1="34" y1="79" x2="59" y2="97" strokeWidth="1.8" />
      <line x1="59" y1="97" x2="109" y2="74" strokeWidth="1.8" />
    </g>
  </svg>
);

// 6. Склад готовой продукции (Выходной терминал, готовое авто, аппарель отгрузки)
export const WarehouseOutIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-out" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.32" filter="url(#shadow-out)">
      <rect x="36" y="32" width="68" height="52" rx="14" fill="#f97316" />
      <path d="M84 78 L98 96 L70 96 Z" fill="#f97316" />
    </g>
    <g stroke="#c2410c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect
        x="32"
        y="26"
        width="72"
        height="54"
        rx="14"
        fill="#fff7ed"
        fillOpacity="0.9"
      />
      <path
        d="M86 74 L86 86 L98 86 L74 102 L50 86 L62 86 L62 74"
        fill="#ffedd5"
      />
      <path
        d="M44 58 L52 46 L76 46 L86 54 L92 56 C94 56 95 58 95 60 L95 64 L41 64 L41 60 C41 58 42 58 44 58 Z"
        fill="#fed7aa"
        fillOpacity="0.7"
      />
      <circle cx="53" cy="65" r="4.5" fill="#c2410c" />
      <circle cx="81" cy="65" r="4.5" fill="#c2410c" />
      <line x1="38" y1="46" x2="46" y2="46" strokeWidth="1.8" />
      <line x1="34" y1="52" x2="42" y2="52" strokeWidth="1.8" />
    </g>
  </svg>
);

// Fallback: Универсальный конвейерный передел
export const FallbackConveyorIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-fallback" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.25" filter="url(#shadow-fallback)">
      <polygon points="30,50 80,25 105,45 55,70" fill="#64748b" />
    </g>
    <g stroke="#334155" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="28,48 78,23 103,43 53,68" fill="#f8fafc" />
      <polygon points="28,48 53,68 53,88 28,68" fill="#e2e8f0" />
      <polygon points="53,68 103,43 103,63 53,88" fill="#cbd5e1" />
      <line x1="42" y1="54" x2="72" y2="39" strokeWidth="2.5" />
      <circle cx="65" cy="78" r="6" strokeWidth="2" fill="#ffffff" />
    </g>
  </svg>
);
