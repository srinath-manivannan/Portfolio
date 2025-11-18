import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const socialLinks = [
  { icon: Github, href: 'https://github.com/srinath-manivannan', label: 'GitHub' },
  { icon: Linkedin, href: 'http://linkedin.com/in/srinath-manivannan-57a751197', label: 'LinkedIn' },
  // { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Mail, href: 'mailto:srinathmpro2001@gmail.com', label: 'Email' },
];

const footerLinks = [
  {
    title: 'Navigation',
    links: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Projects', path: '/projects' },
      { name: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Experience', path: '/experience' },
      { name: 'Skills', path: '/skills' },
      { name: 'Certifications', path: '/certifications' },
      { name: 'Blog', path: '/blog' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-card border-t border-border/50 overflow-hidden">
      {/* animated top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]" />
      {/* subtle background aurora */}
      <div className="pointer-events-none absolute inset-0 aurora opacity-[0.06]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold gradient-text mb-4">Srinath Manivannan</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              AI Full-Stack Software Engineer specializing in MERN, Next.js, TypeScript, and automation. Building scalable applications with modern technologies.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl glassmorphic hover:bg-primary/20 hover:text-primary transition-all hover:scale-105 sheen glow-soft"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Srinath Manivannan. All rights reserved.</p>
            <p className="text-muted-foreground text-xs">
              Built with React, Vite & Supabase — Theming: <span className="gradient-text">aiNeon</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
