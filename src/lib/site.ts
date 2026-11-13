export const SITE = {
  name: 'W.A. AND BROTHERS',
  phoneDisplay: '+91 9214406533',
  phoneHref: 'tel:+919214406533',
  whatsapp: '919214406533',
  email: 'waandbrothers24x7@gmail.com',
  instagram: 'https://instagram.com/w.a.andbrothers24x7',
  instagramHandle: '@w.a.andbrothers24x7',
  address: ['Haji Ganj', 'Kannauj-209725 (U.P.)', 'India'],
} as const;

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

export const formatPrice = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** The exact order message asked for in the brief. */
export const orderMessage = (product: string, quantity: string, price: number) =>
  `Assalamu Alaikum, I want to order ${product} (${quantity}) - Rs.${formatPrice(price)}`;

export const generalMessage = 'Assalamu Alaikum, I want to order attar from W.A. AND BROTHERS.';

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
