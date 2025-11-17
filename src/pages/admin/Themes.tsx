import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const themes: { name: ThemeName; label: string; description: string; preview: { bg: string; primary: string; secondary: string } }[] = [
  {
    name: 'professional',
    label: 'Professional',
    description: 'Deep navy with corporate feel',
    preview: { bg: 'hsl(216, 100%, 7%)', primary: 'hsl(217, 91%, 60%)', secondary: 'hsl(189, 95%, 44%)' },
  },
  {
    name: 'modern',
    label: 'Modern',
    description: 'Gradient and glassmorphic',
    preview: { bg: 'hsl(240, 10%, 4%)', primary: 'hsl(271, 91%, 65%)', secondary: 'hsl(330, 81%, 60%)' },
  },
  {
    name: 'pleasant',
    label: 'Pleasant',
    description: 'Soft pastel colors',
    preview: { bg: 'hsl(214, 100%, 97%)', primary: 'hsl(213, 94%, 68%)', secondary: 'hsl(326, 78%, 88%)' },
  },
  {
    name: 'traditional',
    label: 'Traditional',
    description: 'Warm and classic',
    preview: { bg: 'hsl(48, 30%, 94%)', primary: 'hsl(25, 40%, 40%)', secondary: 'hsl(45, 93%, 70%)' },
  },
  {
    name: 'village',
    label: 'Tamil Nadu Village',
    description: 'Earthy and cultural',
    preview: { bg: 'hsl(32, 30%, 85%)', primary: 'hsl(10, 65%, 58%)', secondary: 'hsl(80, 30%, 45%)' },
  },
];

export default function Themes() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themeName);
    toast.success(`Theme changed to ${themes.find(t => t.name === themeName)?.label}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Theme Customization</h1>
          <p className="text-muted-foreground mb-12">Choose a theme that reflects your style</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((themeOption, index) => (
              <motion.div
                key={themeOption.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className={`glassmorphic rounded-2xl p-6 cursor-pointer hover-lift transition-all ${
                    theme === themeOption.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleThemeChange(themeOption.name)}
                >
                  {theme === themeOption.name && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex gap-2 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: themeOption.preview.bg }}
                      />
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: themeOption.preview.primary }}
                      />
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: themeOption.preview.secondary }}
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{themeOption.label}</h3>
                  <p className="text-sm text-muted-foreground">{themeOption.description}</p>

                  {theme === themeOption.name && (
                    <div className="mt-4">
                      <span className="text-xs font-medium text-primary">Active Theme</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 glassmorphic rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Theme Preview</h3>
            <p className="text-muted-foreground mb-4">
              The selected theme is applied immediately. Changes are saved automatically.
            </p>
            <div className="flex gap-3">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
