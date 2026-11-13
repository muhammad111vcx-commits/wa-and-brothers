import { useEffect, useState } from 'react';
import { generalMessage, waLink } from '../lib/site';
import { WhatsAppIcon } from './Icons';

export default function FloatingWhatsApp() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.55);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <a
      href={waLink(generalMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#1FAF54] text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.8)] ring-1 ring-gold-hi/60 transition-[opacity,transform] duration-500 hover:scale-105 ${show ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      <span className="absolute inset-0 rounded-full ring-2 ring-[#1FAF54] motion-safe:animate-[pulse-ring_2.4s_ease-out_infinite]" aria-hidden="true" />
      <WhatsAppIcon className="relative h-7 w-7" />
    </a>
  );
}
