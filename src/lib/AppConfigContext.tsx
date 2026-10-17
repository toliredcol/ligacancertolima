import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import logoligacan from '../assets/images/logoligacan.svg';

const DEFAULT_LOGO = logoligacan;

interface AppConfig {
  logoUrl: string;
  setLogoUrl: (url: string) => Promise<void>;
  logoSize: number;
  setLogoSize: (size: number) => Promise<void>;
  footerLogoUrl: string;
  setFooterLogoUrl: (url: string) => Promise<void>;
  footerLogoSize: number;
  setFooterLogoSize: (size: number) => Promise<void>;
  sliderDuration: number;
  setSliderDuration: (seconds: number) => Promise<void>;
  whatsappImageUrl: string;
  setWhatsappImageUrl: (url: string) => Promise<void>;
  whatsappLink: string;
  setWhatsappLink: (url: string) => Promise<void>;
  whatsappOpenNewTab: boolean;
  setWhatsappOpenNewTab: (open: boolean) => Promise<void>;
  whatsappVisible: boolean;
  setWhatsappVisible: (visible: boolean) => Promise<void>;
}

const DEFAULT_WHATSAPP_IMAGE = 'https://tolired.com/wp-content/uploads/2026/08/chatica.png';
const DEFAULT_WHATSAPP_LINK = 'https://wa.me/573158137106';

const AppConfigContext = createContext<AppConfig>({
  logoUrl: DEFAULT_LOGO,
  setLogoUrl: async () => {},
  logoSize: 100,
  setLogoSize: async () => {},
  footerLogoUrl: '',
  setFooterLogoUrl: async () => {},
  footerLogoSize: 100,
  setFooterLogoSize: async () => {},
  sliderDuration: 5,
  setSliderDuration: async () => {},
  whatsappImageUrl: DEFAULT_WHATSAPP_IMAGE,
  setWhatsappImageUrl: async () => {},
  whatsappLink: DEFAULT_WHATSAPP_LINK,
  setWhatsappLink: async () => {},
  whatsappOpenNewTab: true,
  setWhatsappOpenNewTab: async () => {},
  whatsappVisible: true,
  setWhatsappVisible: async () => {},
});

async function upsertConfig(key: string, value: string) {
  const { error: upErr } = await supabase
    .from('app_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (upErr) {
    await supabase
      .from('app_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
  }
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrlState] = useState<string>(DEFAULT_LOGO);
  const [logoSize, setLogoSizeState] = useState<number>(100);
  const [footerLogoUrl, setFooterLogoUrlState] = useState<string>('');
  const [footerLogoSize, setFooterLogoSizeState] = useState<number>(100);
  const [sliderDuration, setSliderDurationState] = useState<number>(5);
  const [whatsappImageUrl, setWhatsappImageUrlState] = useState<string>(DEFAULT_WHATSAPP_IMAGE);
  const [whatsappLink, setWhatsappLinkState] = useState<string>(DEFAULT_WHATSAPP_LINK);
  const [whatsappOpenNewTab, setWhatsappOpenNewTabState] = useState<boolean>(true);
  const [whatsappVisible, setWhatsappVisibleState] = useState<boolean>(true);

  useEffect(() => {
    supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['logo_url', 'logo_size', 'footer_logo_url', 'footer_logo_size', 'slider_duration', 'whatsapp_image_url', 'whatsapp_link', 'whatsapp_open_new_tab', 'whatsapp_visible'])
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(data.map(r => [r.key, r.value]));
        if (map['logo_url']) setLogoUrlState(map['logo_url']);
        if (map['logo_size']) setLogoSizeState(Number(map['logo_size']));
        if (map['footer_logo_url']) setFooterLogoUrlState(map['footer_logo_url']);
        if (map['footer_logo_size']) setFooterLogoSizeState(Number(map['footer_logo_size']));
        if (map['slider_duration']) setSliderDurationState(Number(map['slider_duration']));
        if (map['whatsapp_image_url']) setWhatsappImageUrlState(map['whatsapp_image_url']);
        if (map['whatsapp_link']) setWhatsappLinkState(map['whatsapp_link']);
        if (map['whatsapp_open_new_tab'] !== undefined) setWhatsappOpenNewTabState(map['whatsapp_open_new_tab'] === 'true');
        if (map['whatsapp_visible'] !== undefined) setWhatsappVisibleState(map['whatsapp_visible'] === 'true');
      });
  }, []);

  const setLogoUrl = async (url: string) => {
    setLogoUrlState(url);
    await upsertConfig('logo_url', url);
  };

  const setLogoSize = async (size: number) => {
    setLogoSizeState(size);
    await upsertConfig('logo_size', String(size));
  };

  const setFooterLogoUrl = async (url: string) => {
    setFooterLogoUrlState(url);
    await upsertConfig('footer_logo_url', url);
  };

  const setFooterLogoSize = async (size: number) => {
    setFooterLogoSizeState(size);
    await upsertConfig('footer_logo_size', String(size));
  };

  const setSliderDuration = async (seconds: number) => {
    setSliderDurationState(seconds);
    await upsertConfig('slider_duration', String(seconds));
  };

  const setWhatsappImageUrl = async (url: string) => {
    setWhatsappImageUrlState(url);
    await upsertConfig('whatsapp_image_url', url);
  };

  const setWhatsappLink = async (url: string) => {
    setWhatsappLinkState(url);
    await upsertConfig('whatsapp_link', url);
  };

  const setWhatsappOpenNewTab = async (open: boolean) => {
    setWhatsappOpenNewTabState(open);
    await upsertConfig('whatsapp_open_new_tab', String(open));
  };

  const setWhatsappVisible = async (visible: boolean) => {
    setWhatsappVisibleState(visible);
    await upsertConfig('whatsapp_visible', String(visible));
  };

  return (
    <AppConfigContext.Provider value={{
      logoUrl, setLogoUrl,
      logoSize, setLogoSize,
      footerLogoUrl, setFooterLogoUrl,
      footerLogoSize, setFooterLogoSize,
      sliderDuration, setSliderDuration,
      whatsappImageUrl, setWhatsappImageUrl,
      whatsappLink, setWhatsappLink,
      whatsappOpenNewTab, setWhatsappOpenNewTab,
      whatsappVisible, setWhatsappVisible,
    }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
