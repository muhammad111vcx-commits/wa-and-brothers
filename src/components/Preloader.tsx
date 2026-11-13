import { useEffect, useState } from 'react';
import { media } from '../data/media';
import { SITE, prefersReducedMotion } from '../lib/site';

/** Logo (or the brand name until a logo file is added) revealed with a gold shimmer. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'show' | 'leave' | 'gone'>('show');

  useEffect(() => {
    const min = prefersReducedMotion() ? 250 : 1500;
    const started = performance.now();
    let t1 = 0, t2 = 0;
    const finish = () => {
      const wait = Math.max(0, min - (performance.now() - started));
      t1 = window.setTimeout(() => {
        setPhase('leave');
        onDone();
        t2 = window.setTimeout(() => setPhase('gone'), 900);
      }, wait);
    };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const cap = new Promise((r) => window.setTimeout(r, 2600));
    Promise.race([fontsReady, cap]).then(finish);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'gone') return null;
  return (
    <div
      role="status"
      aria-label="Loading W.A. AND BROTHERS"
      className={`fixed inset-0 z-[90] grid place-items-center bg-ink transition-[opacity,visibility] duration-[850ms] ease-out ${phase === 'leave' ? 'invisible opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        {media.logo ? (
          <img src={media.logo} alt="W.A. AND BROTHERS" className="h-28 w-auto rise" />
        ) : (
          <p className="gold-text shimmer font-display text-[clamp(1.7rem,7vw,3.4rem)] tracking-[0.16em]">{SITE.name}</p>
        )}
        <span className="relative block h-px w-44 overflow-hidden bg-line">
          <span className="gold-text shimmer absolute inset-0 !bg-clip-border" style={{ color: 'initial' }} />
        </span>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-mute">Kannauj · India</p>
      </div>
    </div>
  );
}
