import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ThemeName = 'professional' | 'modern' | 'pleasant' | 'traditional' | 'village';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Record<ThemeName, { colors: Record<string, string>; fonts: string }> = {
  professional: {
    colors: {
      '--background': '216 100% 7%',
      '--foreground': '213 100% 97%',
      '--primary': '217 91% 60%',
      '--primary-foreground': '222 47% 11%',
      '--secondary': '189 95% 44%',
      '--accent': '189 95% 44%',
    },
    fonts: 'Inter',
  },
  modern: {
    colors: {
      '--background': '240 10% 4%',
      '--foreground': '0 0% 98%',
      '--primary': '271 91% 65%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '330 81% 60%',
      '--accent': '330 81% 60%',
    },
    fonts: 'Poppins',
  },
  pleasant: {
    colors: {
      '--background': '214 100% 97%',
      '--foreground': '222 47% 11%',
      '--primary': '213 94% 68%',
      '--primary-foreground': '222 47% 11%',
      '--secondary': '326 78% 88%',
      '--accent': '142 76% 85%',
    },
    fonts: 'Nunito',
  },
  traditional: {
    colors: {
      '--background': '48 30% 94%',
      '--foreground': '25 40% 25%',
      '--primary': '25 40% 40%',
      '--primary-foreground': '48 30% 94%',
      '--secondary': '45 93% 70%',
      '--accent': '45 93% 70%',
    },
    fonts: 'Merriweather',
  },
  village: {
    colors: {
      '--background': '32 30% 85%',
      '--foreground': '25 50% 20%',
      '--primary': '10 65% 58%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '80 30% 45%',
      '--accent': '45 80% 70%',
    },
    fonts: 'Noto Sans Tamil',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('professional');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const { data } = await supabase
        .from('public_profiles')
        .select('current_theme')
        .maybeSingle();
      
      if (data?.current_theme) {
        applyTheme(data.current_theme as ThemeName);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (themeName: ThemeName) => {
    const selectedTheme = themes[themeName];
    const root = document.documentElement;
    
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    root.style.fontFamily = selectedTheme.fonts;
    setThemeState(themeName);
  };

  const setTheme = async (themeName: ThemeName) => {
    applyTheme(themeName);
    
    try {
      await supabase
        .from('public_profiles')
        .update({ current_theme: themeName })
        .eq('id', (await supabase.from('public_profiles').select('id').single()).data?.id);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
