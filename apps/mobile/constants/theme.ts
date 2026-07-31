export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  contactBg: string;
  onContact: string;
  accent: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#DC2626',
  onPrimary: '#FFFFFF',
  contactBg: '#111827',
  onContact: '#FFFFFF',
  accent: '#2563EB',
  overlay: 'rgba(15,23,42,0.5)',
};

export const darkColors: ThemeColors = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceAlt: '#1E293B',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#1E293B',
  primary: '#DC2626',
  onPrimary: '#FFFFFF',
  contactBg: '#F1F5F9',
  onContact: '#0F172A',
  accent: '#3B82F6',
  overlay: 'rgba(0,0,0,0.6)',
};
