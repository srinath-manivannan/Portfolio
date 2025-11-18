import { Github, Linkedin, Mail, Twitter, Heart } from 'lucide-react';
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
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold gradient-text mb-4">
              Srinath Manivannan
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              AI Full-Stack Software Engineer specializing in MERN, Next.js, TypeScript, and automation.
              Building scalable applications with modern technologies.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover-lift"
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
                    <Link
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
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
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Srinath Manivannan. All rights reserved.
            </p>
            {/* <p className="text-muted-foreground text-sm flex items-center">
              Built with <Heart className="w-4 h-4 mx-1 text-destructive" fill="currentColor" /> using React, Vite & Supabase
            </p> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
