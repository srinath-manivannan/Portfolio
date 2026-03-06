import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { triggerWebhook, WebhookEvents } from '@/lib/webhookTrigger';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import LinkedInQR from '@/components/LinkedInQR';
import { classifyMessage } from '@/lib/aiEngine';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().trim().max(200).optional(),
  category: z.string().max(50).optional(),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
});

export default function Contact() {
  const { prefersReducedMotion } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', category: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiSuggestion, setAiSuggestion] = useState<{ category: string; confidence: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validateField = (field: string, value: string) => {
    try {
      const partial = { ...formData, [field]: value };
      contactSchema.parse(partial);
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.errors.find((e) => e.path[0] === field);
        if (fieldError) setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) validateField(field, value);
    if (field === 'message' && value.length > 15 && !formData.category) {
      const result = classifyMessage(value);
      if (result.confidence > 0.15) {
        setAiSuggestion(result);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);
      const insertData = {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject || null,
        category: validatedData.category?.trim() ? validatedData.category : null,
        message: validatedData.message,
      };

      const { error } = await supabase.from('contact_submissions').insert([insertData]);
      if (error) throw error;

      triggerWebhook(WebhookEvents.CONTACT_FORM, insertData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
      toast.success("Message sent! I'll get back to you soon.");
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((e) => { if (e.path[0]) fieldErrors[String(e.path[0])] = e.message; });
        setErrors(fieldErrors);
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = formData.message.length;

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="premium-badge mb-4">
            <Mail className="w-3 h-3" />
            CONNECT
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 font-display tracking-tight">
            <span className="gradient-text-premium">Get In Touch</span>
          </h1>
          <p className="text-muted-foreground mb-6">Let's discuss your next project</p>

          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 rounded-lg bg-primary/[0.06] text-primary/80 text-xs font-medium border border-primary/10">
              Response &lt; 24h
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.02] text-foreground/50 text-xs font-medium border border-white/[0.04]">
              Timezone: IST
            </span>
            <span className="px-3 py-1 rounded-lg bg-green-500/[0.06] text-green-400/80 text-xs font-medium border border-green-500/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Open for opportunities
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl bg-green-500/[0.08] flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 font-display">Message Sent!</h3>
                <p className="text-muted-foreground mb-6 text-sm">Thanks for reaching out. I'll get back to you within 24 hours.</p>
                <Button variant="outline" onClick={() => setIsSuccess(false)} className="rounded-xl border-white/[0.06]">Send Another</Button>
              </motion.div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-foreground tracking-wide uppercase">Name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => validateField('name', formData.name)}
                    placeholder="Your name"
                    className={`bg-white/[0.02] border-white/[0.06] rounded-xl focus:border-primary/30 text-sm ${errors.name ? 'border-destructive' : ''}`}
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-foreground tracking-wide uppercase">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => validateField('email', formData.email)}
                    placeholder="your.email@example.com"
                    className={`bg-white/[0.02] border-white/[0.06] rounded-xl focus:border-primary/30 text-sm ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-foreground tracking-wide uppercase">Subject</label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Project discussion"
                      className="bg-white/[0.02] border-white/[0.06] rounded-xl focus:border-primary/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-foreground tracking-wide uppercase">
                      Category
                      {aiSuggestion && !formData.category && (
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('category', aiSuggestion.category);
                            setAiSuggestion(null);
                          }}
                          className="ml-2 inline-flex items-center gap-1 text-[10px] text-primary font-normal normal-case hover:underline"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          AI: {aiSuggestion.category}
                        </button>
                      )}
                    </label>
                    <Select value={formData.category} onValueChange={(value) => { handleChange('category', value); setAiSuggestion(null); }}>
                      <SelectTrigger className="bg-white/[0.02] border-white/[0.06] rounded-xl text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Job Opportunity">Job Opportunity</SelectItem>
                        <SelectItem value="Freelance Project">Freelance Project</SelectItem>
                        <SelectItem value="Project Discussion">Project Discussion</SelectItem>
                        <SelectItem value="Collaboration">Collaboration</SelectItem>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-foreground tracking-wide uppercase">Message *</label>
                    <span className={`text-[10px] ${charCount > 1800 ? 'text-destructive' : 'text-muted-foreground/80'}`}>
                      {charCount}/2000
                    </span>
                  </div>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => validateField('message', formData.message)}
                    placeholder="Tell me about your project..."
                    rows={5}
                    className={`bg-white/[0.02] border-white/[0.06] rounded-xl resize-none focus:border-primary/30 text-sm ${errors.message ? 'border-destructive' : ''}`}
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    className="flex-1 gradient-primary text-white rounded-xl font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Send Message</>
                    )}
                  </Button>
                  <a href="mailto:srinathmpro2001@gmail.com" className="flex-1">
                    <Button type="button" variant="outline" className="w-full animated-border rounded-xl border-white/[0.06]">
                      Or Email Directly
                    </Button>
                  </a>
                </div>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { icon: Mail, label: 'Email', value: 'srinathmpro2001@gmail.com', href: 'mailto:srinathmpro2001@gmail.com' },
                { icon: Phone, label: 'Phone', value: '+91 8144429317', href: 'tel:8144429317' },
                { icon: MapPin, label: 'Location', value: 'Tindivanam, Tamil Nadu', href: null },
                { icon: CheckCircle2, label: 'Availability', value: 'Open for opportunities', href: null, isStatus: true },
              ].map((item) => (
                <div key={item.label} className="premium-card p-5 group">
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${item.isStatus ? 'bg-green-500/[0.06]' : 'bg-primary/[0.06]'} flex items-center justify-center flex-shrink-0`}>
                          <item.icon className={`w-4 h-4 ${item.isStatus ? 'text-green-400/70' : 'text-primary/70'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground/80 font-medium tracking-wider uppercase">{item.label}</p>
                          <p className={`text-sm font-medium truncate group-hover:text-primary transition-colors ${item.isStatus ? 'text-green-400/80' : 'text-foreground'}`}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${item.isStatus ? 'bg-green-500/[0.06]' : 'bg-primary/[0.06]'} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`w-4 h-4 ${item.isStatus ? 'text-green-400/70' : 'text-primary/70'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground/80 font-medium tracking-wider uppercase">{item.label}</p>
                        <p className={`text-sm font-medium truncate ${item.isStatus ? 'text-green-400/80' : 'text-foreground'}`}>{item.value}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="premium-card p-6">
              <h3 className="font-semibold mb-4 font-display text-sm">Connect on Social</h3>
              <div className="flex flex-wrap gap-3">
                <a href="https://wa.me/918144429317" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/[0.03] border border-green-500/[0.06] hover:bg-green-500/[0.06] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-500/[0.08] flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">WhatsApp</p>
                    <p className="text-xs text-green-400/60">+91 8144429317</p>
                  </div>
                </a>

                <a href="https://www.linkedin.com/in/srinath-manivannan-57a751197/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/[0.03] border border-blue-500/[0.06] hover:bg-blue-500/[0.06] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/[0.08] flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">LinkedIn</p>
                    <p className="text-xs text-blue-400/60">Connect with me</p>
                  </div>
                </a>
              </div>
            </div>

            <LinkedInQR variant="card" />

            <div className="premium-card p-6 text-center">
              <h3 className="font-bold text-base mb-2 font-display">Prefer to explore first?</h3>
              <p className="text-sm text-muted-foreground mb-4">Check out my work and experience before reaching out.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" size="sm" asChild className="rounded-xl border-white/[0.06]">
                  <Link to="/projects">Projects <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="rounded-xl border-white/[0.06]">
                  <Link to="/experience">Experience <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
