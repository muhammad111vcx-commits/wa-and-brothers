import { useId, useState } from 'react';
import type { Product } from '../data/products';
import { formatPrice, orderMessage, waLink } from '../lib/site';
import { WhatsAppIcon } from './Icons';

/** Size picker, price and the WhatsApp order button. Used by cards and the quiz result. */
export default function OrderControls({ product, compact = false }: { product: Product; compact?: boolean }) {
  const group = useId();
  const firstAvailable = Math.max(0, product.variants.findIndex((v) => v.available));
  const [index, setIndex] = useState(firstAvailable);
  const variant = product.variants[index];
  const single = product.variants.length === 1;
  const quantity = single && /default/i.test(variant.title) ? '1 bottle' : variant.title;

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {!single && (
        <fieldset>
          <legend className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-mute">Quantity</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <label key={v.title} className={`relative cursor-pointer ${v.available ? '' : 'cursor-not-allowed opacity-45'}`}>
                <input
                  type="radio" name={group} value={v.title} className="peer sr-only"
                  checked={i === index} disabled={!v.available} onChange={() => setIndex(i)}
                />
                <span className="grid min-h-11 min-w-[4.25rem] place-items-center border border-line px-3 text-sm font-semibold text-ivory/85 transition-colors peer-checked:border-gold-hi peer-checked:bg-gold/15 peer-checked:text-gold-hi peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-hi hover:border-gold">
                  {v.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p className="flex items-baseline gap-3" aria-live="polite">
        <span className="font-display text-[2rem] leading-none text-gold-hi">₹{formatPrice(variant.price)}</span>
        {variant.compareAtPrice && (
          <s className="text-base text-mute"><span className="sr-only">Was </span>₹{formatPrice(variant.compareAtPrice)}</s>
        )}
        <span className="text-xs uppercase tracking-[0.2em] text-mute">{quantity}</span>
      </p>

      <a
        className="btn btn-gold w-full whitespace-nowrap !px-3"
        href={waLink(orderMessage(product.name, quantity, variant.price))}
        target="_blank" rel="noopener noreferrer"
        aria-label={`Order ${product.name} ${quantity} on WhatsApp for Rs.${formatPrice(variant.price)}`}
      >
        <WhatsAppIcon /> Order on WhatsApp
      </a>
    </div>
  );
}
