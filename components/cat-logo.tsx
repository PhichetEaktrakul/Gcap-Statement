type Props = {
  className?: string;
  size?: number;
};

// A small cute cat face used as the GCAP brand mark.
// Tan body, pink ears, dark navy facial features.
export default function CatLogo({ className, size = 32 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="GCAP">
      {/* Ears */}
      <path d="M14 24 L22 8 L28 22 Z" fill="#e8a878" />
      <path d="M18 22 L22 13 L25 21 Z" fill="#f5b8b8" />
      <path d="M50 24 L42 8 L36 22 Z" fill="#e8a878" />
      <path d="M46 22 L42 13 L39 21 Z" fill="#f5b8b8" />

      {/* Head */}
      <circle cx="32" cy="36" r="20" fill="#e8a878" />

      {/* Cheek stripes */}
      <path
        d="M22 22 Q 24 26 22 30"
        fill="none"
        stroke="#c08658"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M42 22 Q 40 26 42 30"
        fill="none"
        stroke="#c08658"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Eyes + sparkles */}
      <circle cx="25" cy="34" r="3" fill="#0b1a3a" />
      <circle cx="39" cy="34" r="3" fill="#0b1a3a" />
      <circle cx="26" cy="33" r="0.9" fill="white" />
      <circle cx="40" cy="33" r="0.9" fill="white" />

      {/* Nose */}
      <path d="M29 40 L35 40 L32 43 Z" fill="#f5b8b8" />

      {/* Mouth (cute ω) */}
      <path
        d="M32 43 Q 30 46 28 45"
        fill="none"
        stroke="#0b1a3a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M32 43 Q 34 46 36 45"
        fill="none"
        stroke="#0b1a3a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <line x1="10" y1="36" x2="22" y2="38" stroke="#0b1a3a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="10" y1="40" x2="22" y2="40" stroke="#0b1a3a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="10" y1="44" x2="22" y2="42" stroke="#0b1a3a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="54" y1="36" x2="42" y2="38" stroke="#0b1a3a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="54" y1="40" x2="42" y2="40" stroke="#0b1a3a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="54" y1="44" x2="42" y2="42" stroke="#0b1a3a" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
