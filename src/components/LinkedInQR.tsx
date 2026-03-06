import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Download, Share2, Linkedin, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LINKEDIN_URL = 'https://www.linkedin.com/in/srinath-manivannan-57a751197/';

interface LinkedInQRProps {
  variant?: 'card' | 'inline' | 'modal';
  showLabel?: boolean;
}

export default function LinkedInQR({ variant = 'card', showLabel = true }: LinkedInQRProps) {
  const [expanded, setExpanded] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 512;
    canvas.height = 512;

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, 512, 512);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const padding = 40;
      ctx.drawImage(img, padding, padding, 512 - padding * 2, 512 - padding * 2);

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan to connect on LinkedIn', 256, 500);

      const link = document.createElement('a');
      link.download = 'srinath-linkedin-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded!');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  const shareQR = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Connect with Srinath on LinkedIn',
          text: 'Scan this QR code or visit my LinkedIn profile',
          url: LINKEDIN_URL,
        });
      } catch {
        navigator.clipboard.writeText(LINKEDIN_URL);
        toast.success('LinkedIn URL copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(LINKEDIN_URL);
      toast.success('LinkedIn URL copied to clipboard!');
    }
  }, []);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl surface-subtle border border-subtle hover:border-primary/30 transition-all text-sm group"
        >
          <QrCode className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground group-hover:text-primary transition-colors">Scan to connect</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              className="premium-card rounded-xl !p-3 shadow-xl"
            >
              <div ref={qrRef}>
                <QRCodeSVG
                  value={LINKEDIN_URL}
                  size={100}
                  bgColor="transparent"
                  fgColor="hsl(217, 91%, 70%)"
                  level="M"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl surface-subtle border border-subtle hover:border-primary/30 transition-all text-sm group"
        >
          <QrCode className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground group-hover:text-primary transition-colors">QR Code</span>
        </button>

        {createPortal(
          <AnimatePresence>
            {expanded && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
                  onClick={() => setExpanded(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[9991] rounded-2xl p-5 sm:p-6 shadow-2xl max-w-sm mx-auto max-h-[85vh] overflow-y-auto bg-card border border-border"
                  style={{ backdropFilter: 'blur(32px)' }}
                >
                  <button
                    onClick={() => setExpanded(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg surface-hover transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                      <Linkedin className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-base font-bold font-display mb-1">Connect on LinkedIn</h3>
                    <p className="text-xs text-muted-foreground mb-4">Scan this QR code with your phone</p>

                    <div ref={qrRef} className="inline-block p-3 rounded-xl surface-subtle border border-subtle mb-4">
                      <QRCodeSVG
                        value={LINKEDIN_URL}
                        size={140}
                        bgColor="transparent"
                        fgColor="#60a5fa"
                        level="H"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 justify-center">
                      <Smartphone className="w-3 h-3" />
                      Point your camera at the code
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={downloadQR} variant="outline" size="sm" className="flex-1 text-xs">
                        <Download className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button onClick={shareQR} variant="outline" size="sm" className="flex-1 text-xs">
                        <Share2 className="w-3 h-3 mr-1" /> Share
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-3 h-3 mr-1" /> Open
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card p-5 sm:p-6"
    >
      <div className="flex flex-col items-center gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 w-full">
          <div ref={qrRef} className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-subtle">
            <QRCodeSVG
              value={LINKEDIN_URL}
              size={100}
              bgColor="transparent"
              fgColor="#60a5fa"
              level="H"
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
              <Linkedin className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <h3 className="font-bold font-display">Connect on LinkedIn</h3>
            </div>

            {showLabel && (
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Scan this QR code with your phone camera to connect with me on LinkedIn.
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 justify-center sm:justify-start">
              <Smartphone className="w-3.5 h-3.5" />
              Point your camera at the code
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          <Button onClick={downloadQR} variant="outline" size="sm" className="text-xs flex-1 min-w-0">
            <Download className="w-3 h-3 mr-1 flex-shrink-0" /> Save
          </Button>
          <Button onClick={shareQR} variant="outline" size="sm" className="text-xs flex-1 min-w-0">
            <Share2 className="w-3 h-3 mr-1 flex-shrink-0" /> Share
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs flex-1 min-w-0">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-3 h-3 mr-1 flex-shrink-0" /> Open
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
