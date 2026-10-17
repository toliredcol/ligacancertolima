import { useState } from 'react';
import {
  AlertTriangle, Lightbulb, CheckCircle, ChevronDown,
  ChevronLeft, ChevronRight, ImageIcon
} from 'lucide-react';
import type { ContentBlock } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

interface Props {
  block: ContentBlock;
  accentColor?: string;
}

export default function ContentBlockRenderer({ block, accentColor = '#C41E3A' }: Props) {
  switch (block.block_type) {
    case 'text': return <TextBlock block={block} />;
    case 'rich_text': return <RichTextBlock block={block} />;
    case 'list': return <ListBlock block={block} accentColor={accentColor} />;
    case 'stat': return <StatBlock block={block} accentColor={accentColor} />;
    case 'accordion': return <AccordionBlock block={block} accentColor={accentColor} />;
    case 'alert': return <AlertBlock block={block} />;
    case 'steps': return <StepsBlock block={block} accentColor={accentColor} />;
    case 'divider': return <DividerBlock block={block} />;
    case 'images': return <ImagesBlock block={block} accentColor={accentColor} />;
    default: return null;
  }
}

function TextBlock({ block }: { block: ContentBlock }) {
  const c = block.content as { paragraphs?: string[]; html?: string };
  if (c.html) {
    return (
      <div className="space-y-1">
        {block.title && <h2 className="text-gray-900 font-bold text-lg leading-snug mb-2">{block.title}</h2>}
        <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.html) }} />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {block.title && <h2 className="text-gray-900 font-bold text-lg leading-snug">{block.title}</h2>}
      {c.paragraphs?.map((p, i) => (
        <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{p}</p>
      ))}
    </div>
  );
}

function RichTextBlock({ block }: { block: ContentBlock }) {
  const c = block.content as { html?: string };
  return (
    <div className="space-y-1">
      {block.title && <h2 className="text-gray-900 font-bold text-lg leading-snug mb-2">{block.title}</h2>}
      <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.html) }} />
    </div>
  );
}

function ListBlock({ block, accentColor }: { block: ContentBlock; accentColor: string }) {
  const c = block.content as { items?: { text: string; icon?: string }[] };
  return (
    <div>
      {block.title && <h2 className="text-gray-900 font-bold text-lg leading-snug mb-3">{block.title}</h2>}
      <ul className="space-y-2.5">
        {c.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
            <span className="text-gray-700 text-[15px] leading-relaxed">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatBlock({ block, accentColor }: { block: ContentBlock; accentColor: string }) {
  const c = block.content as { value?: string; label?: string; source?: string };
  return (
    <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: accentColor + '15', border: `1.5px solid ${accentColor}30` }}>
      {block.title && <p className="text-gray-500 text-sm mb-2">{block.title}</p>}
      <p className="font-extrabold text-5xl" style={{ color: accentColor }}>{c.value}</p>
      <p className="text-gray-700 font-medium mt-2 text-sm leading-snug">{c.label}</p>
      {c.source && <p className="text-gray-400 text-xs mt-1">{c.source}</p>}
    </div>
  );
}

function AccordionBlock({ block, accentColor }: { block: ContentBlock; accentColor: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const c = block.content as { faqs?: { question: string; answer: string }[] };
  return (
    <div>
      {block.title && <h2 className="text-gray-900 font-bold text-lg leading-snug mb-3">{block.title}</h2>}
      <div className="space-y-2">
        {c.faqs?.map((faq, i) => (
          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between gap-3 p-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-medium text-gray-800 text-[15px] leading-snug">{faq.question}</span>
              <ChevronDown
                size={18}
                className="flex-shrink-0 text-gray-400 transition-transform duration-200"
                style={{ transform: open === i ? 'rotate(180deg)' : 'none', color: open === i ? accentColor : undefined }}
              />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed animate-fade-in border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertBlock({ block }: { block: ContentBlock }) {
  const c = block.content as { type?: 'warning' | 'tip'; message?: string };
  const isWarning = c.type === 'warning';
  return (
    <div className={`rounded-2xl p-4 flex gap-3 ${isWarning ? 'bg-amber-50 border border-amber-200' : 'bg-teal-50 border border-teal-200'}`}>
      <div className="flex-shrink-0 mt-0.5">
        {isWarning
          ? <AlertTriangle size={20} className="text-amber-600" />
          : <Lightbulb size={20} className="text-teal-600" />
        }
      </div>
      <div>
        {block.title && (
          <p className={`font-semibold text-sm mb-1 ${isWarning ? 'text-amber-800' : 'text-teal-800'}`}>{block.title}</p>
        )}
        <p className={`text-sm leading-relaxed ${isWarning ? 'text-amber-700' : 'text-teal-700'}`}>{c.message}</p>
      </div>
    </div>
  );
}

function StepsBlock({ block, accentColor }: { block: ContentBlock; accentColor: string }) {
  const c = block.content as { steps?: { title: string; description: string }[] };
  return (
    <div>
      {block.title && <h2 className="text-gray-900 font-bold text-lg leading-snug mb-4">{block.title}</h2>}
      <ol className="space-y-4">
        {c.steps?.map((step, i) => (
          <li key={i} className="flex gap-4">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </div>
              {i < (c.steps?.length ?? 0) - 1 && (
                <div className="w-0.5 flex-1 mt-1 mb-0" style={{ backgroundColor: accentColor + '30', minHeight: 20 }} />
              )}
            </div>
            <div className="pb-4 flex-1">
              <p className="font-semibold text-gray-900 text-[15px] leading-snug">{step.title}</p>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DividerBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-gray-200" />
      {block.title && <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{block.title}</span>}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function ImagesBlock({ block, accentColor }: { block: ContentBlock; accentColor: string }) {
  const c = block.content as { images?: { src: string; alt: string }[] };
  const images = c.images ?? [];
  const isGallery = block.title === 'Galería de Infografías';
  const [slideIdx, setSlideIdx] = useState(0);

  if (images.length === 0) {
    if (isGallery) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <ImageIcon size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm font-medium">Galería de Infografías</p>
          <p className="text-gray-300 text-xs mt-1">Las infografías se agregarán desde el panel de administración</p>
        </div>
      );
    }
    return null;
  }

  if (isGallery && images.length > 1) {
    const prev = () => setSlideIdx(i => (i - 1 + images.length) % images.length);
    const next = () => setSlideIdx(i => (i + 1) % images.length);
    return (
      <div>
        <h2 className="text-gray-900 font-bold text-lg leading-snug mb-3">{block.title}</h2>
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
          <img
            src={images[slideIdx].src}
            alt={images[slideIdx].alt}
            className="w-full h-auto object-contain max-h-[500px]"
            loading="lazy"
          />
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: i === slideIdx ? accentColor : '#fff', opacity: i === slideIdx ? 1 : 0.6 }}
              />
            ))}
          </div>
        </div>
        {images[slideIdx].alt && (
          <p className="text-gray-400 text-xs text-center mt-2">{images[slideIdx].alt}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {block.title && isGallery && <h2 className="text-gray-900 font-bold text-lg leading-snug mb-3">{block.title}</h2>}
      <div className="space-y-3">
        {images.map((img, i) => (
          <div key={i} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-auto object-contain"
              style={{ maxWidth: '100%' }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonBlock() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="skeleton h-5 w-2/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
    </div>
  );
}
