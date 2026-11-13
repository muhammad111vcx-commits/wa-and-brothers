import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { media } from '../data/media';
import { studioPick } from '../lib/catalog';
import { capitalise, prefersReducedMotion } from '../lib/site';
import GoldDust from './GoldDust';
import { ArrowIcon } from './Icons';

const frameSrc = (i: number) => `/bottle/f-${String(i + 1).padStart(3, '0')}.webp`;

/**
 * The real bottle, pinned while the page scrolls.
 * With assets/bottle-360: a canvas image sequence scrubbed by scroll.
 * Without it: the cleanest Shopify studio photo with parallax, mist, dust and light.
 * Scent notes (straight from Shopify) arrive one tier at a time.
 */
export default function BottleStory() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pick = studioPick();
  const hasFrames = media.bottleFrames > 0;
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current || !pick) return;
    const el = root.current;
    const chapters = gsap.utils.toArray<HTMLElement>('[data-chapter]', el);
    let frames: HTMLImageElement[] = [];
    let drawn = -1;

    const draw = (i: number) => {
      const c = canvas.current, img = frames[i];
      if (!c || !img?.complete || !img.naturalWidth || i === drawn) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      drawn = i;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
    };

    // Progressive preload: first frame now, the rest when the section is near.
    let io: IntersectionObserver | null = null;
    if (hasFrames && canvas.current && media.bottleFrameSize) {
      canvas.current.width = media.bottleFrameSize.width;
      canvas.current.height = media.bottleFrameSize.height;
      frames = Array.from({ length: media.bottleFrames }, () => new Image());
      frames[0].onload = () => draw(0);
      frames[0].src = frameSrc(0);
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io?.disconnect();
        let next = 1;
        const load = () => {
          if (next >= frames.length) return;
          const img = frames[next];
          img.onload = img.onerror = load;
          img.src = frameSrc(next++);
        };
        for (let k = 0; k < 4; k++) load();
      }, { rootMargin: '150% 0px' });
      io.observe(el);
    }

    const ctx = gsap.context(() => {
      gsap.set(chapters, { autoAlpha: 0, y: 36 });
      const state = { frame: 0 };
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: el, start: 'top top', end: () => `+=${window.innerHeight * (chapters.length + 0.6)}`,
          pin: '[data-stage]', scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      const total = chapters.length * 2;
      if (hasFrames) {
        tl.to(state, { frame: media.bottleFrames - 1, ease: 'none', duration: total, onUpdate: () => draw(Math.round(state.frame)) }, 0);
      } else {
        tl.fromTo('[data-bottle]', { scale: 0.9, yPercent: 5 }, { scale: 1.07, yPercent: -4, ease: 'none', duration: total }, 0);
      }
      tl.fromTo('[data-sweep]', { xPercent: -160 }, { xPercent: 160, ease: 'none', duration: total }, 0)
        .fromTo('[data-mist-a]', { xPercent: -18, yPercent: 10 }, { xPercent: 14, yPercent: -12, ease: 'none', duration: total }, 0)
        .fromTo('[data-mist-b]', { xPercent: 16, yPercent: -6 }, { xPercent: -14, yPercent: 10, ease: 'none', duration: total }, 0)
        .fromTo('[data-halo]', { scale: 0.85, opacity: 0.7 }, { scale: 1.12, opacity: 1, ease: 'none', duration: total }, 0)
        .fromTo('[data-progress]', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: total }, 0);
      chapters.forEach((ch, i) => {
        const at = i * 2;
        tl.to(ch, { autoAlpha: 1, y: 0, duration: 0.8 }, at + 0.1)
          .from(ch.querySelectorAll('[data-note]'), { opacity: 0, y: 16, stagger: 0.16, duration: 0.5 }, at + 0.3);
        if (i < chapters.length - 1) tl.to(ch, { autoAlpha: 0, y: -30, duration: 0.6, ease: 'power2.in' }, at + 1.5);
      });
    }, el);

    return () => { ctx.revert(); io?.disconnect(); ScrollTrigger.refresh(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!pick) return null;
  const { product, image } = pick;
  const tiers = product.notes;

  const Bottle = (
    <div className="relative mx-auto aspect-square w-[min(84vw,48svh,32rem)] lg:w-[min(42vw,66svh,40rem)]">
      <div data-halo className="absolute inset-[-18%] rounded-full bg-[radial-gradient(closest-side,rgb(201_162_75/0.22),transparent_70%)]" />
      {hasFrames ? (
        <canvas ref={canvas} role="img" aria-label={`${product.name} attar bottle turning on a turntable`}
          className="relative h-full w-full object-contain"
          style={{ backgroundImage: `url(${frameSrc(0)})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      ) : (
        // Studio photo on white: blended onto a lit ivory pool so it sits on black
        // without touching a single pixel of the bottle itself.
        <div data-bottle className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-[radial-gradient(closest-side,#f8f0e0_0%,#f3e7cd_58%,#a48d5c_82%,#0a0a0a_100%)]">
          <img
            src={image.src} srcSet={`${image.srcSmall} 480w, ${image.src} ${image.width}w`} sizes="(min-width: 640px) 22rem, 58vw"
            width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async"
            className="h-[70%] w-[70%] object-contain mix-blend-multiply"
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full [mask-image:radial-gradient(closest-side,#000_45%,transparent_78%)]" aria-hidden="true">
            <div data-sweep className="absolute inset-y-[-20%] left-1/3 w-1/3 rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.5),transparent)]" />
          </div>
        </div>
      )}
    </div>
  );

  // Static version for reduced motion: everything visible, nothing pinned.
  if (reduced) {
    return (
      <section id="bottle" className="section">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          {Bottle}
          <div>
            <p className="eyebrow">The Bottle</p>
            <h2 className="mt-4 text-[clamp(2rem,6vw,3.4rem)]">{product.name}</h2>
            <p className="mt-3 max-w-md text-ivory/85">{capitalise(product.lead)}</p>
            <dl className="mt-6 space-y-3">
              {tiers.map((t, i) => (
                <div key={i} className="flex gap-4 border-t border-line pt-3">
                  <dt className="w-16 text-xs font-semibold uppercase tracking-[0.24em] text-gold">{t.label ?? 'Notes'}</dt>
                  <dd className="font-display text-xl">{t.items.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="bottle" ref={root} className="relative" aria-label={`${product.name}: the bottle and its scent notes`}>
      <div data-stage className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <div data-mist-a className="mist left-[-25%] top-[5%] h-[75vmax] w-[75vmax]" />
        <div data-mist-b className="mist mist-pale bottom-[-15%] right-[-30%] h-[85vmax] w-[85vmax]" />
        <GoldDust density={0.8} />

        <p className="eyebrow absolute left-1/2 top-[5.25rem] w-max -translate-x-1/2">The Bottle</p>
        <span className="absolute right-4 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-line sm:block" aria-hidden="true">
          <span data-progress className="absolute inset-0 origin-top bg-gradient-to-b from-gold-hi to-gold" />
        </span>

        <div className="relative -mt-[16svh] sm:-mt-[8svh] lg:mt-0">{Bottle}</div>

        {/* Chapters share one spot under the bottle (beside it on wide screens). */}
        <div className="absolute inset-x-0 bottom-[4svh] h-[34svh] lg:inset-0 lg:h-auto">
          <div className="wrap relative h-full">
            {[...tiers.map((tier, i) => (
              <div key={`t${i}`} data-chapter
                className={`absolute inset-x-0 top-0 text-center lg:top-1/2 lg:w-[26%] lg:-translate-y-1/2 lg:text-left ${i % 2 ? 'lg:left-auto lg:right-0' : 'lg:left-0 lg:right-auto'}`}>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-gold">
                  {tier.label ? `${tier.label} notes` : 'Fragrance notes'}
                </p>
                <ul className="mt-3 space-y-1">
                  {tier.items.map((n) => (
                    <li key={n} data-note className="font-display text-[clamp(1.9rem,7.4vw,3rem)] leading-[1.15]">
                      <span className="gold-text">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )),
            <div key="end" data-chapter className="absolute inset-x-0 top-0 text-center lg:left-0 lg:right-auto lg:top-1/2 lg:w-[28%] lg:-translate-y-1/2 lg:text-left">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-gold">{product.subtitle}</p>
              <h2 className="mt-2 text-[clamp(2.1rem,8vw,3.6rem)]">{product.name}</h2>
              <p className="mx-auto mt-2 max-w-sm text-[0.98rem] text-ivory/85 lg:mx-0">{capitalise(product.lead)}</p>
              <a href={`#${product.handle}`} className="btn btn-ghost mt-4">See sizes &amp; prices <ArrowIcon /></a>
            </div>]}
          </div>
        </div>
      </div>
    </section>
  );
}
