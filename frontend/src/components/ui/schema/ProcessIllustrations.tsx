import type { IllustrationProps } from './LogisticsIllustrations';

// 2. Сварка кузовов (Роботизированная сварка, электрическая дуга, молнии)
export const WeldingIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-weld" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.35" filter="url(#shadow-weld)">
      <path
        d="M62 18 L94 44 L78 52 L106 82 L76 74 L84 62 L52 36 Z"
        fill="#f59e0b"
      />
    </g>
    <g stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 24 L44 38 L40 48 L18 34 Z" fill="#fef3c7" />
      <line x1="32" y1="30" x2="28" y2="40" />
      <line x1="44" y1="38" x2="52" y2="43" strokeWidth="2.8" />
      <polygon
        points="58,16 92,44 76,51 108,84 76,76 84,63 50,34"
        fill="#fef9c3"
        fillOpacity="0.85"
      />
      <polygon
        points="50,34 84,63 76,76 108,84 104,88 68,79 78,65 44,38"
        fill="#fde68a"
        fillOpacity="0.9"
      />
      <line x1="68" y1="34" x2="60" y2="42" strokeDasharray="2 3" opacity="0.8" />
      <line x1="82" y1="46" x2="74" y2="54" strokeDasharray="2 3" opacity="0.8" />
      <path d="M106 38 L112 34 M108 44 L116 46" strokeWidth="1.8" />
      <path d="M96 90 L102 96 M86 92 L88 100" strokeWidth="1.8" />
    </g>
  </svg>
);

// 3. Окрасочный цех (Распылитель, капли глянцевого лака, аэродинамика)
export const PaintingIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-paint" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.32" filter="url(#shadow-paint)">
      <path
        d="M74 24 C94 24, 108 38, 108 58 C108 78, 88 88, 70 88 C52 88, 44 76, 44 60 C44 42, 56 24, 74 24 Z"
        fill="#84cc16"
      />
    </g>
    <g stroke="#3f6212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M72 20 C92 20 106 34 106 52 C106 62 100 70 90 76 C86 86 78 94 66 94 C54 94 46 86 46 76 C36 70 32 60 32 50 C32 34 48 20 72 20 Z"
        fill="#f7fee7"
        fillOpacity="0.85"
      />
      <path d="M48 42 C64 48 84 48 98 40" strokeWidth="2" />
      <ellipse cx="60" cy="62" rx="4.5" ry="7" fill="#ecfccb" />
      <circle cx="76" cy="74" r="3" fill="#ecfccb" />
      <circle cx="84" cy="58" r="2.5" fill="#ecfccb" />
      <path d="M106 32 C114 36 118 42 118 50" strokeWidth="1.8" strokeDasharray="3 3" />
      <path d="M26 38 C22 44 20 52 24 62" strokeWidth="1.8" strokeDasharray="3 3" />
      <path d="M60 94 L60 104 M72 94 L72 104" strokeWidth="2.4" />
      <line x1="56" y1="104" x2="76" y2="104" strokeWidth="2.4" />
    </g>
  </svg>
);

// 4. Сборка-1 (Шасси, зубчатые передачи, крепеж, технический планшет)
export const AssemblyIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-assembly" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.32" filter="url(#shadow-assembly)">
      <rect x="42" y="24" width="60" height="72" rx="8" fill="#f43f5e" />
    </g>
    <g stroke="#881337" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="38" y="22" width="62" height="74" rx="8" fill="#fff1f2" fillOpacity="0.85" />
      <rect x="58" y="16" width="22" height="10" rx="3" fill="#ffe4e6" />
      <line x1="64" y1="16" x2="64" y2="24" />
      <line x1="74" y1="16" x2="74" y2="24" />
      <circle cx="69" cy="60" r="16" fill="#ffe4e6" fillOpacity="0.5" />
      <circle cx="69" cy="60" r="7" fill="#fff1f2" />
      <line x1="69" y1="40" x2="69" y2="44" strokeWidth="3" />
      <line x1="69" y1="76" x2="69" y2="80" strokeWidth="3" />
      <line x1="49" y1="60" x2="53" y2="60" strokeWidth="3" />
      <line x1="85" y1="60" x2="89" y2="60" strokeWidth="3" />
      <line x1="55" y1="46" x2="58" y2="49" strokeWidth="3" />
      <line x1="80" y1="71" x2="83" y2="74" strokeWidth="3" />
      <line x1="83" y1="46" x2="80" y2="49" strokeWidth="3" />
      <line x1="58" y1="71" x2="55" y2="74" strokeWidth="3" />
      <circle cx="48" cy="84" r="1.5" fill="#881337" />
      <circle cx="90" cy="84" r="1.5" fill="#881337" />
    </g>
  </svg>
);

// 5. Контроль качества (Лазерный 3D сканер, контур кузова, папка ОТК)
export const QualityControlIllustration = ({ className = 'w-28 h-24' }: IllustrationProps) => (
  <svg
    viewBox="0 0 130 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <filter id="shadow-qc" x="-10%" y="-10%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g opacity="0.32" filter="url(#shadow-qc)">
      <path
        d="M34 38 L54 38 L64 48 L104 48 C108 48 112 52 112 56 L112 90 C112 94 108 98 104 98 L34 98 C30 98 26 94 26 90 L26 46 C26 42 30 38 34 38 Z"
        fill="#3b82f6"
      />
    </g>
    <g stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 34 L54 34 L62 42 L98 42" fill="#dbeafe" fillOpacity="0.4" />
      <path
        d="M28 42 L56 42 L64 50 L104 50 C108 50 111 53 111 57 L105 92 C104 95 101 98 97 98 L23 98 C19 98 16 95 17 91 L24 47 C25 44 26 42 28 42 Z"
        fill="#eff6ff"
        fillOpacity="0.9"
      />
      <polygon
        points="38,30 84,24 88,44 42,48"
        fill="#ffffff"
        strokeWidth="1.8"
      />
      <circle cx="64" cy="72" r="11" strokeDasharray="3 2" strokeWidth="1.6" />
      <line x1="64" y1="58" x2="64" y2="86" strokeWidth="1.8" />
      <line x1="50" y1="72" x2="78" y2="72" strokeWidth="1.8" />
      <circle cx="64" cy="72" r="2.5" fill="#1d4ed8" />
    </g>
  </svg>
);
