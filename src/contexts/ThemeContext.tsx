import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ThemeName =
  | 'professional'
  | 'modern'
  | 'pleasant'
  | 'traditional'
  | 'village'
  | 'aiNeon'
  | 'deepSpace'
  | 'carbon';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isLoading: boolean;
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Semantic tokens allow consistent usage across components
// Colors are HSL components stored as strings without hsl() to leverage Tailwind's hsl(var(--token)) pattern
const themes: Record<
  ThemeName,
  {
    colors: Record<string, string>;
    fonts: string;
    gradient?: { from: string; via?: string; to: string };
  }
> = {
  professional: {
    colors: {
      '--background': '216 100% 7%',
      '--foreground': '213 100% 97%',
      '--primary': '217 91% 60%',
      '--primary-foreground': '222 47% 11%',
      '--secondary': '189 95% 44%',
      '--accent': '189 95% 44%',
      // semantic
      '--surface': '217 33% 9%',
      '--card': '219 28% 12%',
      '--muted': '215 19% 24%',
      '--ring': '217 91% 60%',
      '--border': '215 19% 24%',
    },
    fonts: 'Inter, ui-sans-serif, system-ui',
    gradient: { from: '217 91% 60%', to: '189 95% 44%' },
  },
  modern: {
    colors: {
      '--background': '240 10% 4%',
      '--foreground': '0 0% 98%',
      '--primary': '271 91% 65%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '330 81% 60%',
      '--accent': '330 81% 60%',
      '--surface': '240 8% 6%',
      '--card': '240 7% 10%',
      '--muted': '240 6% 20%',
      '--ring': '271 91% 65%',
      '--border': '240 6% 20%',
    },
    fonts: 'Poppins, ui-sans-serif, system-ui',
    gradient: { from: '271 91% 65%', to: '330 81% 60%' },
  },
  pleasant: {
    colors: {
      '--background': '214 100% 97%',
      '--foreground': '222 47% 11%',
      '--primary': '213 94% 68%',
      '--primary-foreground': '222 47% 11%',
      '--secondary': '326 78% 88%',
      '--accent': '142 76% 85%',
      '--surface': '210 40% 96%',
      '--card': '0 0% 100%',
      '--muted': '214 32% 91%',
      '--ring': '213 94% 68%',
      '--border': '214 32% 91%',
    },
    fonts: 'Nunito, ui-sans-serif, system-ui',
    gradient: { from: '213 94% 68%', to: '326 78% 88%' },
  },
  traditional: {
    colors: {
      '--background': '48 30% 94%',
      '--foreground': '25 40% 25%',
      '--primary': '25 40% 40%',
      '--primary-foreground': '48 30% 94%',
      '--secondary': '45 93% 70%',
      '--accent': '45 93% 70%',
      '--surface': '48 30% 96%',
      '--card': '48 30% 98%',
      '--muted': '45 20% 85%',
      '--ring': '25 40% 40%',
      '--border': '45 20% 85%',
    },
    fonts: 'Merriweather, ui-serif, Georgia',
    gradient: { from: '25 40% 40%', to: '45 93% 70%' },
  },
  village: {
    colors: {
      '--background': '32 30% 85%',
      '--foreground': '25 50% 20%',
      '--primary': '10 65% 58%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '80 30% 45%',
      '--accent': '45 80% 70%',
      '--surface': '32 30% 90%',
      '--card': '32 30% 94%',
      '--muted': '32 20% 70%',
      '--ring': '10 65% 58%',
      '--border': '32 20% 70%',
    },
    fonts: 'Noto Sans Tamil, Inter, ui-sans-serif',
    gradient: { from: '10 65% 58%', to: '45 80% 70%' },
  },
  // New FAANG-style premium themes
  aiNeon: {
    colors: {
      '--background': '240 10% 4%', // near-black
      '--foreground': '0 0% 98%',
      '--primary': '187 100% 55%', // cyan
      '--primary-foreground': '222 47% 11%',
      '--secondary': '274 100% 65%', // purple
      '--accent': '330 100% 65%', // magenta
      '--surface': '240 8% 6%',
      '--card': '240 7% 10%',
      '--muted': '220 7% 18%',
      '--ring': '187 100% 55%',
      '--border': '220 7% 18%',
    },
    fonts: 'Inter, SF Pro Text, ui-sans-serif',
    gradient: { from: '187 100% 55%', via: '274 100% 65%', to: '330 100% 65%' },
  },
  deepSpace: {
    colors: {
      '--background': '218 39% 11%', // deep indigo
      '--foreground': '210 40% 98%',
      '--primary': '262 83% 58%', // violet
      '--primary-foreground': '0 0% 100%',
      '--secondary': '199 89% 48%', // blue
      '--accent': '162 72% 51%', // teal
      '--surface': '224 28% 14%',
      '--card': '225 28% 18%',
      '--muted': '220 15% 30%',
      '--ring': '262 83% 58%',
      '--border': '220 15% 30%',
    },
    fonts: 'Inter, ui-sans-serif, system-ui',
    gradient: { from: '262 83% 58%', to: '199 89% 48%' },
  },
  carbon: {
    colors: {
      '--background': '224 14% 8%',
      '--foreground': '210 40% 98%',
      '--primary': '201 96% 32%', // blue
      '--primary-foreground': '0 0% 100%',
      '--secondary': '214 95% 36%', // cobalt
      '--accent': '175 84% 32%', // green-blue
      '--surface': '220 13% 10%',
      '--card': '220 10% 14%',
      '--muted': '215 14% 22%',
      '--ring': '201 96% 32%',
      '--border': '215 14% 22%',
    },
    fonts: 'Inter, ui-sans-serif, system-ui',
    gradient: { from: '201 96% 32%', to: '175 84% 32%' },
  },
};

function applyCSSVariables(themeName: ThemeName) {
  const selected = themes[themeName];
  const root = document.documentElement;
  Object.entries(selected.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  // gradient helpers
  if (selected.gradient) {
    root.style.setProperty('--gradient-from', selected.gradient.from);
    root.style.setProperty('--gradient-to', selected.gradient.to);
    if (selected.gradient.via) root.style.setProperty('--gradient-via', selected.gradient.via);
  }
  root.style.fontFamily = selected.fonts;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('professional');
  const [isLoading, setIsLoading] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotionState] = useState<boolean>(() => {
    const stored = localStorage.getItem('prefersReducedMotion');
    if (stored != null) return stored === 'true';
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    loadTheme();
    // Apply motion class
    document.documentElement.classList.toggle('motion-safe', !prefersReducedMotion);
    document.documentElement.classList.toggle('motion-reduce', prefersReducedMotion);
  }, []);

  useEffect(() => {
    // keep DOM classes in sync when toggled
    document.documentElement.classList.toggle('motion-safe', !prefersReducedMotion);
    document.documentElement.classList.toggle('motion-reduce', prefersReducedMotion);
    localStorage.setItem('prefersReducedMotion', String(prefersReducedMotion));
  }, [prefersReducedMotion]);

  const loadTheme = async () => {
    try {
      const { data } = await supabase
        .from('public_profiles')
        .select('current_theme')
        .maybeSingle();

      const saved = (data?.current_theme as ThemeName | undefined) ??
        ((localStorage.getItem('theme') as ThemeName | null) || 'professional');

      applyCSSVariables(saved);
      setThemeState(saved);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (themeName: ThemeName) => {
    applyCSSVariables(themeName);
    setThemeState(themeName);
    localStorage.setItem('theme', themeName);
    try {
      const profile = await supabase.from('public_profiles').select('id').single();
      if (profile.data?.id) {
        await supabase
          .from('public_profiles')
          .update({ current_theme: themeName })
          .eq('id', profile.data.id);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setPrefersReducedMotion = (val: boolean) => {
    setPrefersReducedMotionState(val);
  };

  const value = useMemo(
    () => ({ theme, setTheme, isLoading, prefersReducedMotion, setPrefersReducedMotion }),
    [theme, isLoading, prefersReducedMotion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Optional helper to access current theme config if needed elsewhere
export function getThemeConfig(name: ThemeName) {
  return themes[name];
}
