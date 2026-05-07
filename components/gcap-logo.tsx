type Props = {
  className?: string;
  size?: number;
};

export default function GcapLogo({ className, size = 32 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="GCAP">
      <circle cx="50" cy="50" r="42" fill="#c9a24a" />
      <text
        x="52"
        y="74"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="74"
        fill="#0b1a3a">
        G
      </text>
    </svg>
  );
}
