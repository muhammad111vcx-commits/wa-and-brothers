import { media } from '../data/media';
import { SITE, generalMessage, waLink } from '../lib/site';
import GoldDust from './GoldDust';
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from './Icons';

export default function Contact() {
  const rows = [
    { icon: <WhatsAppIcon />, label: 'WhatsApp', value: SITE.phoneDisplay, href: waLink(generalMessage), external: true },
    { icon: <PhoneIcon />, label: 'Call', value: SITE.phoneDisplay, href: SITE.phoneHref, external: false },
    { icon: <MailIcon />, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}`, external: false },
    { icon: <InstagramIcon />, label: 'Instagram', value: SITE.instagramHandle, href: SITE.instagram, external: true },
  ];

  return (
    <footer id="contact" className="relative scroll-mt-16 overflow-hidden border-t border-line bg-coal">
      <div className="mist drift bottom-[-40%] left-1/2 h-[55rem] w-[55rem] -translate-x-1/2" />
      <GoldDust density={0.5} />
      <div className="wrap relative section !pb-24 lg:!pb-10">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div className="text-center lg:text-left">
            <p className="reveal eyebrow">Contact</p>
            <h2 className="reveal mt-4 text-[clamp(2.3rem,8vw,4.4rem)]">Your attar is one <span className="gold-text italic">message away.</span></h2>
            <p className="reveal mx-auto mt-4 max-w-md text-ivory/80 lg:mx-0">Tell us which attar and which quantity. We confirm your order on WhatsApp.</p>
            <a className="reveal btn btn-gold mt-7" href={waLink(generalMessage)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Order on WhatsApp
            </a>
          </div>

          <div className="reveal frame bg-ink/60 p-6 sm:p-8">
            <address className="not-italic">
              <p className="flex gap-4">
                <PinIcon className="mt-1 h-5 w-5 flex-none text-gold" />
                <span>
                  <span className="block font-display text-[1.35rem] text-gold-hi sm:text-2xl">{SITE.name}</span>
                  {SITE.address.map((line) => <span key={line} className="block text-ivory/85">{line}</span>)}
                </span>
              </p>
              <ul className="mt-6 divide-y divide-line border-t border-line">
                {rows.map((r) => (
                  <li key={r.label}>
                    <a href={r.href} {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex min-h-14 items-center gap-4 py-3 no-underline">
                      <span className="grid h-10 w-10 flex-none place-items-center border border-gold/40 text-gold transition-colors group-hover:border-gold-hi group-hover:text-gold-hi [&>svg]:h-5 [&>svg]:w-5">{r.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.26em] text-mute">{r.label}</span>
                        <span className="block break-words text-[1.02rem] text-ivory transition-colors group-hover:text-gold-hi">{r.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          </div>
        </div>

        <hr className="rule mt-16" />
        <div className="mt-8 flex flex-col items-center gap-4 text-center text-sm text-mute lg:flex-row lg:justify-between lg:text-left">
          <p className="flex items-center gap-3">
            {media.logo && <img src={media.logo} alt="" className="h-8 w-auto" />}
            <span>© {new Date().getFullYear()} {SITE.name}. Kannauj, India.</span>
          </p>
          <p className="inline-flex items-center gap-2 border border-gold/40 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold">GST-registered business</p>
        </div>
      </div>
    </footer>
  );
}
