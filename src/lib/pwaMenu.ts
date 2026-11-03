import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  Home, BookOpen, Briefcase, MessageCircle, Phone, Heart, Users, Info,
  FileText, Calendar, MapPin, Image, Play, Award, Star, Bell, Settings,
  HelpCircle, GraduationCap, Activity, Globe, Link, Circle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PwaMenuType = 'ruta_interna' | 'whatsapp' | 'enlace_externo';

export interface PwaMenuItem {
  id: string;
  label: string;
  icon: string;
  type: PwaMenuType;
  target: string;
  order_index: number;
  active: boolean;
  created_at: string;
}

export const DEFAULT_MENU_ITEMS: PwaMenuItem[] = [
  {
    id: 'default-inicio',
    label: 'Inicio',
    icon: 'Home',
    type: 'ruta_interna',
    target: '/',
    order_index: 0,
    active: true,
    created_at: '',
  },
  {
    id: 'default-whatsapp',
    label: 'WhatsApp',
    icon: 'MessageCircle',
    type: 'whatsapp',
    target: 'https://wa.me/573158137106',
    order_index: 1,
    active: true,
    created_at: '',
  },
  {
    id: 'default-modulos',
    label: 'Módulos',
    icon: 'BookOpen',
    type: 'ruta_interna',
    target: '/modulos',
    order_index: 2,
    active: true,
    created_at: '',
  },
  {
    id: 'default-servicios',
    label: 'Servicios',
    icon: 'Briefcase',
    type: 'ruta_interna',
    target: '/pagina/portafolio-de-servicios',
    order_index: 3,
    active: true,
    created_at: '',
  },
];

export const MENU_ICONS: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  Briefcase,
  MessageCircle,
  Phone,
  Heart,
  Users,
  Info,
  FileText,
  Calendar,
  MapPin,
  Image,
  Play,
  Award,
  Star,
  Bell,
  Settings,
  HelpCircle,
  GraduationCap,
  Activity,
  Globe,
  Link,
  Circle,
};

export const MENU_TYPE_LABELS: Record<PwaMenuType, string> = {
  ruta_interna: 'Ruta interna',
  whatsapp: 'WhatsApp',
  enlace_externo: 'Enlace externo',
};

const CACHE_KEY = 'pwa_menu_items_cache';

function readCache(): PwaMenuItem[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PwaMenuItem[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(items: PwaMenuItem[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function sortAndFilter(items: PwaMenuItem[]): PwaMenuItem[] {
  return items
    .filter(i => i.active)
    .sort((a, b) => a.order_index - b.order_index);
}

/**
 * Carga los ítems activos del menú. Intenta la red; si falla, usa el respaldo
 * local; si tampoco hay, cae en los valores por defecto.
 */
export function usePwaMenuItems(): PwaMenuItem[] {
  const [items, setItems] = useState<PwaMenuItem[]>(readCache() ?? DEFAULT_MENU_ITEMS);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('pwa_menu_items')
      .select('*')
      .eq('active', true)
      .order('order_index')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data || data.length === 0) {
          // mantener respaldo local o por defecto
          return;
        }
        const sorted = sortAndFilter(data as PwaMenuItem[]);
        setItems(sorted);
        writeCache(sorted);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
