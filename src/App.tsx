import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReducedMotion } from './lib/site';
import Preloader from './components/Preloader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import BottleStory from './components/BottleStory';
import Collection from './components/Collection';
import ScentFinder from './components/ScentFinder';
import Story from './components/Story';
import Reels from './components/Reels';
import Contact from './components/Contact';
import FloatingWhatsApp from './components/FloatingWhatsApp';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [ready, setReady] = useState(false);
  const reduced = prefersReducedMotion();

  // Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (reduced) { document.documentElement.classList.add('no-motion'); return; }
    const lenis = new Lenis({ lerp: 0.11, anchors: { offset: -64 } });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); };
  }, [reduced]);

  // Scroll-revealed text and images.
  useEffect(() => {
    if (reduced || !ready) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09, overwrite: true }),
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => { ctx.revert(); window.removeEventListener('load', refresh); };
  }, [reduced, ready]);

  return (
    <>
      <a href="#collection" className="btn btn-gold fixed left-3 top-3 z-[100] -translate-y-24 focus:translate-y-0">Skip to collection</a>
      <Preloader onDone={() => setReady(true)} />
      <Nav />
      <main>
        <Hero ready={ready} />
        <BottleStory />
        <Collection />
        <ScentFinder />
        <Story />
        <Reels />
      </main>
      <Contact />
      <FloatingWhatsApp />
    </>
  );
}
