import { useMemo, useState } from 'react';
import { products, type Product } from '../data/products';
import { allNotes, moodImage } from '../lib/catalog';
import { capitalise } from '../lib/site';
import OrderControls from './OrderControls';

/**
 * Each answer carries words that are looked up in the Shopify tags, notes and
 * description of every product. Nothing about a scent is assumed here, so the
 * quiz keeps working as products are added or edited in Shopify.
 */
const questions = [
  {
    key: 'occasion', title: 'Where will you wear it?',
    options: [
      { label: 'Every day', words: ['every day', 'everyday', 'daily'] },
      { label: 'Eid, weddings & celebrations', words: ['eid', 'wedding', 'special occasion'] },
      { label: 'It is a gift', words: ['gift'] },
    ],
  },
  {
    key: 'mood', title: 'Which mood is yours?',
    options: [
      { label: 'Bold & classic', words: ['bold', 'classic', 'deep', 'timeless'] },
      { label: 'Soft & luminous', words: ['soft', 'luminous', 'mellow', 'fresh'] },
      { label: 'Refined & elegant', words: ['refined', 'elegant', 'smooth'] },
    ],
  },
  {
    key: 'strength', title: 'How should it sit on you?',
    options: [
      { label: 'Light and easy', words: ['soft', 'fresh', 'light', 'mellow', 'gentle'] },
      { label: 'Rich and deep', words: ['rich', 'deep', 'bold', 'warm'] },
      { label: 'Stays all day', words: ['long-lasting', 'through the day'] },
    ],
  },
  {
    key: 'family', title: 'Sweet, fresh or woody?',
    options: [
      { label: 'Sweet & warm', words: ['amber', 'tonka', 'oriental', 'sweet', 'vanilla'] },
      { label: 'Fresh & floral', words: ['fresh', 'floral', 'rose', 'jasmine', 'bergamot', 'apple'] },
      { label: 'Woody & musky', words: ['woody', 'musk', 'oud', 'cedarwood', 'sandal'] },
    ],
  },
] as const;

const haystack = (p: Product) => `${p.tags.join(' ')} ${allNotes(p).join(' ')} ${p.descriptionText}`.toLowerCase();

function recommend(answers: number[]): Product {
  const scored = products.map((p, order) => {
    const text = haystack(p);
    const score = answers.reduce((sum, a, q) => sum + questions[q].options[a].words.filter((w) => text.includes(w)).length, 0);
    return { p, score, order };
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored[0].p;
}

export default function ScentFinder() {
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step === questions.length;
  const result = useMemo(() => (done ? recommend(answers) : null), [done, answers]);
  if (!products.length) return null;

  const q = questions[Math.min(step, questions.length - 1)];
  const image = result ? moodImage(result) : null;

  return (
    <section id="finder" className="section scroll-mt-16 overflow-hidden">
      <div className="mist drift-slow left-1/2 top-[-20%] h-[60rem] w-[60rem] -translate-x-1/2" />
      <div className="wrap relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="reveal eyebrow">Scent Finder</p>
          <h2 className="reveal mt-4 text-[clamp(2.2rem,7vw,4rem)]">Find <span className="gold-text italic">your</span> attar</h2>
          <p className="reveal mt-4 text-ivory/80">Four quick questions. We match your answers to the notes of each attar.</p>
        </div>

        <div className="reveal frame mx-auto mt-10 max-w-3xl bg-char/80 p-5 sm:p-9">
          <ol className="mb-7 flex gap-2" aria-label="Progress">
            {questions.map((item, i) => (
              <li key={item.key} className="h-px flex-1 bg-line" aria-current={i === step ? 'step' : undefined}>
                <span className={`block h-full origin-left bg-gradient-to-r from-gold to-gold-hi transition-transform duration-700 ${i < step ? 'scale-x-100' : 'scale-x-0'}`} />
                <span className="sr-only">{`Question ${i + 1}${i < step ? ', answered' : ''}`}</span>
              </li>
            ))}
          </ol>

          <div aria-live="polite" className="min-h-[21rem]">
            {!done ? (
              <fieldset key={q.key} className="rise">
                <legend className="w-full">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gold">Question {step + 1} of {questions.length}</span>
                  <span className="mt-2 block font-display text-[clamp(1.6rem,5.5vw,2.4rem)] leading-tight">{q.title}</span>
                </legend>
                <div className="mt-6 grid gap-3">
                  {q.options.map((o, i) => (
                    <button
                      key={o.label} type="button" onClick={() => setAnswers([...answers, i])}
                      style={{ animationDelay: `${0.08 * (i + 1)}s` }}
                      className="rise group flex min-h-14 items-center justify-between gap-4 border border-line bg-ink/50 px-5 py-3 text-left text-[1.02rem] transition-[border-color,background-color,transform] duration-300 hover:translate-x-1 hover:border-gold-hi hover:bg-gold/10"
                    >
                      <span>{o.label}</span>
                      <span aria-hidden="true" className="h-px w-8 bg-gold transition-[width] duration-300 group-hover:w-12" />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button type="button" onClick={() => setAnswers(answers.slice(0, -1))}
                    className="mt-5 min-h-11 text-xs font-semibold uppercase tracking-[0.22em] text-mute underline-offset-4 hover:text-gold-hi hover:underline">
                    Back
                  </button>
                )}
              </fieldset>
            ) : result && image && (
              <div key="result" className="rise grid gap-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
                <div className={`arch frame mx-auto w-40 self-start sm:w-full ${image.tone === 'light' ? 'bg-[#f4ecdc]' : 'bg-ink'}`}>
                  <img src={image.srcSmall} width={image.width} height={image.height} alt={image.alt} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gold">Your match</p>
                  <h3 className="mt-2 text-[clamp(2rem,7vw,2.8rem)]">{result.name}</h3>
                  <p className="mt-2 text-ivory/85">{capitalise(result.lead)}</p>
                  {allNotes(result).length > 0 && (
                    <p className="mt-3 text-sm text-mute"><span className="sr-only">Notes: </span>{allNotes(result).join(' · ')}</p>
                  )}
                  <div className="mt-5"><OrderControls product={result} compact /></div>
                  <button type="button" onClick={() => setAnswers([])}
                    className="mt-4 min-h-11 text-xs font-semibold uppercase tracking-[0.22em] text-mute underline-offset-4 hover:text-gold-hi hover:underline">
                    Start again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
