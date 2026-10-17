export const MODULE_COLORS: Record<string, { bg: string; light: string; dark: string; text: string; border: string; badge: string }> = {
  vph: {
    bg: 'bg-purple-600',
    light: 'bg-purple-50',
    dark: 'bg-purple-800',
    text: 'text-purple-600',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
  antitabaco: {
    bg: 'bg-green-600',
    light: 'bg-green-50',
    dark: 'bg-green-800',
    text: 'text-green-600',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  prostata: {
    bg: 'bg-sky-600',
    light: 'bg-sky-50',
    dark: 'bg-sky-800',
    text: 'text-sky-600',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
  },
  piel: {
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
    dark: 'bg-orange-700',
    text: 'text-orange-600',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
  },
  mama: {
    bg: 'bg-pink-500',
    light: 'bg-pink-50',
    dark: 'bg-pink-700',
    text: 'text-pink-600',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
  },
  digestivas: {
    bg: 'bg-red-700',
    light: 'bg-red-50',
    dark: 'bg-red-900',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  'cuello-uterino': {
    bg: 'bg-purple-600',
    light: 'bg-purple-50',
    dark: 'bg-purple-800',
    text: 'text-purple-600',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
  'cuello-uterino-asociados': {
    bg: 'bg-red-700',
    light: 'bg-red-50',
    dark: 'bg-red-900',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
};

export const MODULE_HEX: Record<string, string> = {
  vph: '#b916b8',
  antitabaco: '#05b507',
  prostata: '#1088bc',
  piel: '#ff7d45',
  mama: '#ff4582',
  digestivas: '#c91705',
  'cuello-uterino': '#b916b8',
  'cuello-uterino-asociados': '#c91705',
};

export function getModuleColors(slug: string) {
  return MODULE_COLORS[slug] ?? MODULE_COLORS['prostata'];
}

export function getModuleHex(slug: string) {
  return MODULE_HEX[slug] ?? '#1088bc';
}
