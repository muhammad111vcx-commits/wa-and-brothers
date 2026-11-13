import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { products } from '../data/products';
import { media } from '../data/media';
import { moodImage } from '../lib/catalog';
import { generalMessage, prefersReducedMotion, waLink } from '../lib/site';
import GoldDust from './GoldDust';
import { ArrowIcon, WhatsAppIcon } from './Icons';

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // Real Shopify photos with a dark surround, used when there is no reel video.
  const shots = products.map(moodImage).filter((im) => im.tone === 'dark');
  const backdrop = shots[shots.length - 1] ?? products[0]?.images[0];
  const feature = shots[shots.length - 1] ?? products[0]?.images[0];
  const featureProduct = products.find((p) => p.images.includes(feature));

  useEffect(() => {
    if (!ready || prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-in]', { opacity: 0, y: 34, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.15 });
      gsap.from('[data-hero-arch]', { opacity: 0, scale: 0.94, y: 30, duration: 1.6, ease: 'power3.out', delay: 0.1 });
      gsap.to('[data-hero-bg]', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('[data-hero-arch]', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  // Start the reel only once the preloader is out of the way.
  useEffect(() => {
    if (ready && video.current && !prefersReducedMotion()) video.current.play().catch(() => {});
  }, [ready]);

  return (
    <section id="top" ref={root} className="relative isolate flex min-h-[100svh] items-end overflow-hidden lg:items-center">
      <div data-hero-bg className="absolute inset-0 -z-10">
        {media.heroVideo ? (
          <video
            ref={video}
            className="h-full w-full object-cover"
            src={media.heroVideo}
            poster={media.heroPoster ?? backdrop?.src}
            muted loop playsInline preload="metadata"
            aria-hidden="true"
          />
        ) : backdrop && (
          <img src={backdrop.srcSmall} alt="" aria-hidden="true" width={backdrop.width} height={backdrop.height}
            className="kenburns h-full w-full object-cover opacity-55 blur-[14px]" />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(10_10_10/0.72)_0%,rgb(10_10_10/0.35)_34%,rgb(10_10_10/0.88)_78%,#0a0a0a_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_70%_35%,transparent_30%,rgb(10_10_10/0.75)_100%)]" />
      <div className="mist drift -left-[30%] top-[8%] -z-10 h-[70vmax] w-[70vmax]" />
      <div className="mist mist-pale drift-slow -right-[35%] bottom-[-10%] -z-10 h-[80vmax] w-[80vmax]" />
      <GoldDust className="-z-10" />

      <div className="wrap grid gap-8 pb-10 pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16 lg:pb-20">
        {!media.heroVideo && feature && (
          <a
            data-hero-arch
            href="#collection"
            aria-label={featureProduct ? `${featureProduct.name}: see the collection` : 'See the collection'}
            className="arch frame relative mx-auto block w-[min(50vw,26svh,15rem)] lg:order-2 lg:w-[min(30vw,23rem)]"
          >
            <img
              src={feature.src} srcSet={`${feature.srcSmall} 480w, ${feature.src} ${feature.width}w`}
              sizes="(min-width: 1024px) 23rem, 58vw"
              width={feature.width} height={feature.height} alt={feature.alt}
              fetchPriority="high" decoding="async"
              className="aspect-[3/4] w-full object-cover"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(10_10_10/0.7))]" />
          </a>
        )}

        <div className="text-center lg:order-1 lg:text-left">
          <p data-hero-in className="eyebrow justify-center lg:justify-start">Haji Ganj · Kannauj</p>
          <h1 data-hero-in className="mt-5 text-[clamp(2.3rem,9.6vw,5.6rem)]">
            The soul of Kannauj,
            <span className="gold-text block italic">sealed in gold.</span>
          </h1>
          <p data-hero-in className="mx-auto mt-5 max-w-md text-[1.02rem] text-ivory/85 lg:mx-0 lg:text-lg">
            Alcohol-free attar from the perfume capital of India, in gold roll-on bottles.
          </p>
          <div data-hero-in className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a className="btn btn-gold" href={waLink(generalMessage)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Order on WhatsApp
            </a>
            <a className="btn btn-ghost" href="#collection">Explore Collection <ArrowIcon /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
