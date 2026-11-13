import { products, type ProductImage } from '../data/products';
import { Ornament } from './Icons';

// Real Shopify photos only. Each chapter takes the next unused one.
function pickPhotos(count: number): ProductImage[] {
  const pool = products.flatMap((p) => p.images.slice(1).reverse());
  const dark = pool.filter((im) => im.tone === 'dark');
  const light = pool.filter((im) => im.tone === 'light');
  const out: ProductImage[] = [];
  for (let i = 0; out.length < count && (dark.length || light.length); i++) {
    const next = (i % 2 === 0 ? dark.shift() ?? light.shift() : light.shift() ?? dark.shift());
    if (next) out.push(next);
  }
  return out;
}

const chapters = [
  {
    kicker: 'The city',
    title: 'Kannauj, the perfume capital of India',
    body: [
      'On the banks of the Ganga in Uttar Pradesh, Kannauj has been making attar for centuries. Perfumers here have supplied courts, households and bazaars across the subcontinent, and the craft is still passed from one generation to the next.',
      'It is the town that learned to bottle the smell of the first rain on dry earth.',
    ],
  },
  {
    kicker: 'The craft',
    title: 'Deg and bhapka: distilling by fire and patience',
    body: [
      'Kannauj’s traditional method uses no machines. Flowers and botanicals are sealed with water in a copper still, the deg, and heated slowly over a fire. The fragrant vapour travels through a bamboo pipe into a long-necked copper receiver, the bhapka, resting in cool water.',
      'There it condenses, drop by drop, into the base oil. The perfumer judges the heat and the timing by hand and by nose. No alcohol is used at any stage.',
    ],
  },
  {
    kicker: 'The house',
    title: 'W.A. And Brothers, Haji Ganj',
    body: [
      'We are an attar house in Haji Ganj, Kannauj. Our attars are alcohol-free, made to be worn on the skin and on your clothes, and filled into gold roll-on bottles that travel without spills.',
      'Every bottle comes in a premium box, ready to be given at Eid, at weddings and to guests you want to honour.',
    ],
  },
];

export default function Story() {
  const photos = pickPhotos(chapters.length);

  return (
    <section id="story" className="section scroll-mt-16 bg-[linear-gradient(180deg,#0a0a0a,#12100d_45%,#0a0a0a)]">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="reveal eyebrow">Our Story</p>
          <h2 className="reveal mt-4 text-[clamp(2.2rem,7vw,4rem)]">A craft older than <span className="gold-text italic">the bottle</span></h2>
        </div>

        <div className="mt-14 space-y-16 lg:mt-20 lg:space-y-28">
          {chapters.map((c, i) => {
            const photo = photos[i];
            return (
              <article key={c.title} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                {photo && (
                  <div className={`reveal lg:col-span-5 ${i % 2 ? 'lg:order-2 lg:col-start-8' : 'lg:col-start-1'}`}>
                    <div className={`arch frame mx-auto w-[min(70vw,20rem)] lg:w-full lg:max-w-[24rem] ${photo.tone === 'light' ? 'bg-[#f4ecdc]' : 'bg-ink'}`}>
                      <img
                        src={photo.src} srcSet={`${photo.srcSmall} 480w, ${photo.src} ${photo.width}w`} sizes="(min-width: 1024px) 24rem, 70vw"
                        width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async"
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className={`lg:col-span-6 ${i % 2 ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-7'}`}>
                  <p className="reveal flex items-center gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold">
                    <span className="font-display text-3xl normal-case tracking-normal text-gold-hi/70">{String(i + 1).padStart(2, '0')}</span>
                    {c.kicker}
                  </p>
                  <h3 className="reveal mt-4 text-[clamp(1.8rem,5.5vw,2.9rem)]">{c.title}</h3>
                  {c.body.map((para) => (
                    <p key={para.slice(0, 24)} className="reveal mt-4 max-w-xl text-[1.02rem] text-ivory/80">{para}</p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        <Ornament className="reveal mx-auto mt-16 h-4 w-32 text-gold" />
      </div>
    </section>
  );
}
