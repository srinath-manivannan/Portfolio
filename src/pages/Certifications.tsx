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
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .order('display_order');
    if (data) setCertifications(data);
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Certifications</h1>
          <p className="text-lg text-muted-foreground">Professional credentials & achievements</p>
        </motion.div>

        {/* Certifications Grid - CLICKABLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert, index) => {
            const CardWrapper = cert.credential_url ? 'a' : 'div';
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
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardWrapper {...cardProps}>
                  <div className={`glassmorphic rounded-2xl p-6 h-full transition-all ${cert.credential_url ? 'hover-lift hover:ring-2 hover:ring-primary' : ''}`}>
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
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
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 glassmorphic rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">{certifications.length}+</div>
              <p className="text-muted-foreground">Certifications</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">
                {new Set(certifications.map(c => c.issuer)).size}+
              </div>
              <p className="text-muted-foreground">Issuers</p>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">
                {new Date().getFullYear() - Math.min(...certifications.map(c => new Date(c.issue_date).getFullYear()))}+
              </div>
              <p className="text-muted-foreground">Years Learning</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
