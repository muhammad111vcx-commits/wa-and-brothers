import { useRef, useState } from 'react';
import { media, type Reel } from '../data/media';
import { products } from '../data/products';
import { SITE } from '../lib/site';
import { InstagramIcon, PlayIcon } from './Icons';

function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      document.querySelectorAll<HTMLVideoElement>('video[data-reel]').forEach((o) => o !== v && o.pause());
      v.muted = false;
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
    } else v.pause();
  };

  return (
    <li className="reveal w-[62vw] max-w-[17rem] flex-none snap-center sm:w-auto sm:max-w-none">
      <button type="button" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} reel ${index + 1}`}
        className="frame group relative block aspect-[9/16] w-full overflow-hidden bg-char">
        <video
          ref={video} data-reel src={reel.src} poster={reel.poster ?? undefined}
          playsInline loop preload="none"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />
        <span className={`absolute inset-0 grid place-items-center bg-ink/35 transition-opacity duration-300 ${playing ? 'opacity-0' : 'opacity-100'}`}>
          <span className="grid h-16 w-16 place-items-center rounded-full border border-gold-hi/80 bg-ink/60 text-gold-hi backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="ml-1 h-6 w-6" />
          </span>
        </span>
      </button>
    </li>
  );
}

export default function Reels() {
  // Until reel videos are added to assets/reels, show real product photos that open Instagram.
  const dark = products.flatMap((p) => p.images.filter((im) => im.tone === 'dark'));
  const stills = (dark.length ? dark : products.map((p) => p.images[0]).filter(Boolean)).slice(0, 4);

  return (
    <section id="reels" className="section scroll-mt-16">
      <div className="wrap">
        <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div>
            <p className="reveal eyebrow">{media.reels.length ? 'Reels' : 'On Instagram'}</p>
            <h2 className="reveal mt-4 text-[clamp(2.2rem,7vw,4rem)]">The house, <span className="gold-text italic">in motion</span></h2>
          </div>
          <a className="reveal btn btn-ghost" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramIcon /> {SITE.instagramHandle}
          </a>
        </div>

        {media.reels.length > 0 ? (
          <ul className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {media.reels.map((r, i) => <ReelCard key={r.src} reel={r} index={i} />)}
          </ul>
        ) : (
          <ul className="mt-10 flex justify-center gap-4 sm:gap-6">
            {stills.map((im, i) => (
              <li key={im.src} className="reveal w-[42vw] max-w-[17rem] flex-none">
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer"
                  aria-label={`See W.A. AND BROTHERS on Instagram (photo ${i + 1})`}
                  className={`frame group relative block aspect-[9/16] overflow-hidden ${im.tone === 'light' ? 'bg-[#f4ecdc]' : 'bg-ink'}`}>
                  <img src={im.srcSmall} alt="" width={im.width} height={im.height} loading="lazy" decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgb(10_10_10/0.8))]" />
                  <span className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ivory sm:text-[0.68rem]">
                    <InstagramIcon className="h-4 w-4 flex-none text-gold-hi" /> View on Instagram
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
