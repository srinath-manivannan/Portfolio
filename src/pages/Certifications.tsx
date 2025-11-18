import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Certifications() {
  const [certifications, setCertifications] = useState<any[]>([]);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    const { data } = await supabase.from('certifications').select('*').order('display_order');
    if (data) setCertifications(data);
  };

  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Certifications</span>
          </h1>
          <p className="text-lg text-muted-foreground">Professional credentials & achievements</p>
        </motion.div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert, index) => {
            const CardWrapper: any = cert.credential_url ? 'a' : 'div';
            const cardProps = cert.credential_url
              ? {
                  href: cert.credential_url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'block cursor-pointer',
                }
              : {};

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="tilt-hover"
              >
                <CardWrapper {...cardProps}>
                  <div className={`glassmorphic rounded-2xl p-6 h-full transition-all sheen glow-soft ${
                    cert.credential_url ? 'hover-lift hover:ring-2 hover:ring-primary/60' : ''
                  }`}>
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] flex items-center justify-center mb-4 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.55)]">
                      {cert.image_url ? (
                        <img src={cert.image_url} alt={cert.title} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Award className="w-8 h-8 text-white" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2">{cert.title}</h3>

                    {/* Issuer */}
                    <p className="text-muted-foreground mb-4">{cert.issuer}</p>

                    {/* Date */}
                    {cert.issue_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(cert.issue_date).getFullYear()}</span>
                      </div>
                    )}

                    {/* View Credential Link */}
                    {cert.credential_url && (
                      <div className="flex items-center gap-2 text-sm text-primary font-medium mt-4">
                        <ExternalLink className="w-4 h-4" />
                        <span>View Credential</span>
                      </div>
                    )}

                    {/* Tags/Skills if present */}
                    {Array.isArray(cert.tags) && cert.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {cert.tags.slice(0, 4).map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 glassmorphic rounded-2xl p-8 glow-soft"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="sheen rounded-xl p-4">
              <div className="text-4xl font-bold gradient-text mb-2">{certifications.length}+</div>
              <p className="text-muted-foreground">Certifications</p>
            </div>
            <div className="sheen rounded-xl p-4">
              <div className="text-4xl font-bold gradient-text mb-2">
                {new Set(certifications.map((c) => c.issuer)).size}+
              </div>
              <p className="text-muted-foreground">Issuers</p>
            </div>
            <div className="sheen rounded-xl p-4">
              <div className="text-4xl font-bold gradient-text mb-2">
                {certifications.length > 0
                  ? new Date().getFullYear() -
                    Math.min(
                      ...certifications
                        .filter((c) => c.issue_date)
                        .map((c) => new Date(c.issue_date).getFullYear())
                    )
                  : 0}
                +
              </div>
              <p className="text-muted-foreground">Years Learning</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
