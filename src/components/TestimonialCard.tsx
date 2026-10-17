import type { Testimonial } from '../lib/supabase';
import { User } from 'lucide-react';

interface Props {
  testimonial: Testimonial;
  moduleName?: string;
}

export default function TestimonialCard({ testimonial, moduleName }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {testimonial.avatar_url ? (
            <img
              src={testimonial.avatar_url}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <User size={20} className="text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
          {moduleName && (
            <span className="text-xs text-gray-400">{moduleName}</span>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">"{testimonial.story}"</p>
    </div>
  );
}
