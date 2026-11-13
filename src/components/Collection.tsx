import { useRef, useState, type PointerEvent } from 'react';
import { products, type Product } from '../data/products';
import { moodImage } from '../lib/catalog';
import { capitalise } from '../lib/site';
import OrderControls from './OrderControls';
import { Ornament } from './Icons';

function ProductCard({ product }: { product: Product }) {
  const card = useRef<HTMLElement>(null);
  const [active, setActive] = useState(() => product.images.indexOf(moodImage(product)));
  const image = product.images[active] ?? product.images[0];
  const raf = useRef(0);

  // Hover tilt and a gold glow that follows the pointer (mouse only).
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || !card.current) return;
    const el = card.current, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - y) * 5}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    card.current?.style.setProperty('--rx', '0deg');
    card.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      id={product.handle}
      ref={card}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="reveal group frame relative scroll-mt-24 bg-[linear-gradient(160deg,#1a1814_0%,#100f0d_60%)] transition-[transform,box-shadow] duration-500 ease-out [transform:perspective(1100px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:shadow-[0_30px_80px_-30px_rgb(201_162_75/0.55)] motion-reduce:[transform:none]"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(22rem_circle_at_var(--gx,50%)_var(--gy,0%),rgb(242_213_138/0.14),transparent_65%)]" />

      <div className="relative z-[3] grid h-full gap-0 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
        <div className="p-4 pb-0 sm:p-6 sm:pb-0 md:pb-6">
          <div className={`arch frame relative ${image.tone === 'light' ? 'bg-[#f4ecdc]' : 'bg-ink'}`}>
            <img
              key={image.src}
              src={image.src} srcSet={`${image.srcSmall} 480w, ${image.src} ${image.width}w`}
              sizes="(min-width: 768px) 24rem, 90vw"
              width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async"
              className="rise aspect-[4/5] w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 flex gap-2" aria-label={`${product.name} photos`}>
              {product.images.map((im, i) => (
                <li key={im.src} className="flex-1">
                  <button
                    type="button" onClick={() => setActive(i)} aria-pressed={i === active}
                    aria-label={`Show photo ${i + 1} of ${product.images.length}: ${im.alt}`}
                    className={`block w-full overflow-hidden border transition-[border-color,opacity] ${i === active ? 'border-gold-hi opacity-100' : 'border-line opacity-60 hover:opacity-100'}`}
                  >
                    <img src={im.srcSmall} alt="" width={96} height={96} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col p-5 sm:p-7">
          {product.subtitle && <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-gold">{product.subtitle}</p>}
          <h3 className="mt-2 text-[clamp(2rem,6vw,2.8rem)]">{product.name}</h3>
          {product.lead && <p className="mt-2 text-[0.98rem] text-ivory/85">{capitalise(product.lead)}</p>}

          {product.notes.length > 0 && (
            <dl className="mt-5 space-y-2.5 border-y border-line py-4">
              {product.notes.map((tier, i) => (
                <div key={i} className="flex gap-3">
                  <dt className="w-14 flex-none pt-1 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-mute">{tier.label ?? 'Notes'}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {tier.items.map((n) => (
                      <span key={n} className="border border-gold/35 px-2.5 py-1 text-[0.78rem] text-ivory/90">{n}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 md:mt-auto md:pt-5">
            <OrderControls product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Collection() {
  // Benefits that Shopify lists on every product, shown once under the grid.
  const shared = products.length
    ? products[0].benefits.filter((b) => products.every((p) => p.benefits.includes(b)))
    : [];

  return (
    <section id="collection" className="section scroll-mt-16 bg-[linear-gradient(180deg,#0a0a0a,#0f0e0c_30%,#0a0a0a)]">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="reveal eyebrow">The Collection</p>
          <h2 className="reveal mt-4 text-[clamp(2.2rem,7vw,4rem)]">Attars of the <span className="gold-text italic">house</span></h2>
          <p className="reveal mt-4 text-ivory/80">Choose your quantity and order directly on WhatsApp. No cart, no payment page.</p>
        </div>

        <div className={`mt-12 grid gap-7 lg:gap-9 ${products.length > 1 ? 'xl:grid-cols-2' : 'mx-auto max-w-4xl'}`}>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {shared.length > 0 && (
          <>
            <Ornament className="reveal mx-auto mt-14 h-4 w-32 text-gold" />
            <ul className="reveal mx-auto mt-8 grid max-w-5xl gap-x-10 gap-y-3 text-[0.94rem] text-ivory/80 sm:grid-cols-2">
              {shared.map((b) => (
                <li key={b} className="flex gap-3"><span className="mt-[0.7em] h-px w-5 flex-none bg-gold" aria-hidden="true" />{b}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
