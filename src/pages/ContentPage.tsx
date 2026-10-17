import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { CustomPage } from '../lib/supabase';
import Header from '../components/Header';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { safeExternalUrl } from '../lib/safeExternalUrl';

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPage | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) { setPage(null); return; }
    supabase
      .from('custom_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setPage(null); return; }
        const target = data.content_type === 'external_url' ? safeExternalUrl(data.external_url) : null;
        if (target) {
          if (data.open_in_new_tab) {
            window.open(target, '_blank', 'noopener,noreferrer');
          } else {
            window.location.replace(target);
          }
          return;
        }
        setPage(data);
      });
  }, [slug]);

  return (
    <div className="animate-fade-in">
      <Header />

      {page === undefined ? (
        // Loading
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="skeleton h-8 w-2/3 rounded-xl" />
          <div className="skeleton h-4 rounded-xl" />
          <div className="skeleton h-4 w-5/6 rounded-xl" />
          <div className="skeleton h-4 w-4/5 rounded-xl" />
          <div className="skeleton h-48 rounded-xl mt-4" />
        </div>
      ) : page === null ? (
        // Not found
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-5xl mb-4">404</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
          <p className="text-gray-500 text-sm">El contenido que buscas no existe o fue eliminado.</p>
        </div>
      ) : (
        <article className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-snug">{page.title}</h1>
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-6 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-5 [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:mb-3 [&_p]:leading-relaxed
              [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1 [&_ul>li]:list-disc
              [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1 [&_ol>li]:list-decimal
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
              [&_a]:text-[#5170ff] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-blue-700
              [&_strong]:font-semibold [&_em]:italic
              [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4
              [&_hr]:border-gray-200 [&_hr]:my-6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content_html) }}
          />
        </article>
      )}
    </div>
  );
}
