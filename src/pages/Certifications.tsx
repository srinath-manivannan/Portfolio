/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, Calendar, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function Certifications() {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCertifications(); }, []);

  const fetchCertifications = async () => {
    const { data } = await supabase.from('certifications').select('*').order('display_order');
    if (data) setCertifications(data);
  };

  const filtered = certifications.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.issuer?.toLowerCase().includes(search.toLowerCase())
  );

  const issuers = [...new Set(certifications.map((c) => c.issuer))];
  const yearsLearning = certifications.length > 0
    ? new Date().getFullYear() - Math.min(...certifications.filter((c) => c.issue_date).map((c) => new Date(c.issue_date).getFullYear()))
    : 0;

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 overflow-hidden">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="premium-badge mb-4 inline-flex items-center gap-1.5">
            <Award className="w-3 h-3" />
            CREDENTIALS
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="gradient-text-premium">Certifications</span>
          </h1>
          <p className="text-muted-foreground mb-8">Professional credentials & achievements</p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search certifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-12"
        >
          <div className="premium-card p-4 !rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-bold gradient-text-premium">{certifications.length}</div>
            <div className="text-xs text-muted-foreground">Certifications</div>
          </div>
          <div className="premium-card p-4 !rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-bold gradient-text-premium">{issuers.length}</div>
            <div className="text-xs text-muted-foreground">Issuers</div>
          </div>
          <div className="premium-card p-4 !rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-bold gradient-text-premium">{yearsLearning}+</div>
            <div className="text-xs text-muted-foreground">Years Learning</div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((cert, index) => {
              const isClickable = !!cert.credential_url;
              const Wrapper = isClickable ? 'a' : 'div';
              const wrapperProps = isClickable
                ? { href: cert.credential_url, target: '_blank', rel: 'noopener noreferrer' }
                : {};

              return (
                <motion.div
                  key={cert.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Wrapper {...(wrapperProps as any)} className={`block ${isClickable ? 'cursor-pointer' : ''}`}>
                    <div className={`premium-card p-6 h-full transition-all group ${
                      isClickable ? 'hover:border-primary/40' : ''
                    }`}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden gradient-primary flex items-center justify-center mb-4 shadow-lg">
                        {cert.image_url ? (
                          <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover" />
                        ) : (
                          <Award className="w-7 h-7 text-white" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-display mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {cert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{cert.issuer}</p>

                      {cert.issue_date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      )}

                      {isClickable && (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Credential
                        </div>
                      )}

                      {Array.isArray(cert.tags) && cert.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {cert.tags.slice(0, 3).map((t: string) => (
                            <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-muted-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Wrapper>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
            <p className="text-muted-foreground">No certifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
