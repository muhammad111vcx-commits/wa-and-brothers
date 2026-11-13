import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false,
};

export const WhatsAppIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3.200 20.800l1.300-4.700a8.600 8.600 0 1 1 3.300 3.200z" />
    <path d="M9 8.300c-.300 1.300.300 2.900 1.700 4.300s3 2.100 4.300 1.800l.900-1.300-1.800-1-.800.700c-.700-.300-1.500-1.100-1.800-1.800l.700-.800-1-1.800z" fill="currentColor" stroke="none" />
  </svg>
);
export const PhoneIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 4h3.500l1.500 4-2 1.500a11 11 0 0 0 6.500 6.500l1.500-2 4 1.500V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
);
export const MailIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="1.500" /><path d="m3.500 6.500 8.500 6.500 8.500-6.500" /></svg>
);
export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3.500" y="3.500" width="17" height="17" rx="4.500" /><circle cx="12" cy="12" r="3.800" /><circle cx="17" cy="7" r=".9" fill="currentColor" stroke="none" /></svg>
);
export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 21s-6.500-5.600-6.500-10.500a6.500 6.500 0 0 1 13 0C18.500 15.400 12 21 12 21z" /><circle cx="12" cy="10.500" r="2.300" /></svg>
);
export const ArrowIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M8 5.500v13l11-6.500z" fill="currentColor" /></svg>
);

/** Eight-point star used as a small ornament between sections. */
export const Ornament = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 120 16" className={className} aria-hidden="true" focusable="false">
    <path d="M0 8h46M74 8h46" stroke="currentColor" strokeWidth=".8" opacity=".6" />
    <path d="M60 1l2.200 4.800L67 8l-4.800 2.200L60 15l-2.200-4.800L53 8l4.800-2.200z" fill="currentColor" />
  </svg>
);
