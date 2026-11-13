import { useEffect, useState } from 'react';
import { media } from '../data/media';
import { SITE, generalMessage, waLink } from '../lib/site';
import { WhatsAppIcon } from './Icons';

const links = [
  ['Collection', '#collection'],
  ['Scent Finder', '#finder'],
  ['Our Story', '#story'],
  ['Contact', '#contact'],
] as const;

export default function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${solid ? 'border-b border-line/70 bg-ink/85 backdrop-blur-md' : 'border-b border-transparent'}`}>
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 no-underline" aria-label="W.A. AND BROTHERS, back to top">
          {media.logo
            ? <img src={media.logo} alt="" className="h-10 w-auto" />
            : <span className="gold-text font-display whitespace-nowrap text-[0.86rem] tracking-[0.16em] sm:text-lg">{SITE.name}</span>}
        </a>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-ivory/80 no-underline transition-colors hover:text-gold-hi">{label}</a>
          ))}
        </nav>
        <a href={waLink(generalMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10 !px-4 !py-2 !text-[0.7rem]">
          <WhatsAppIcon /> <span>Order</span>
        </a>
      </div>
    </header>
  );
}
