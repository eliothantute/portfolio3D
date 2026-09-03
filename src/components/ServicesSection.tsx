import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface ServicesSectionProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

interface ServiceItem {
  id: string;
  number: string;
  title: { fr: string; en: string };
  tag: { fr: string; en: string };
  description: { fr: string; en: string };
  features: { fr: string[]; en: string[] };
  icon: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'site-vitrine',
    number: '01',
    title: {
      fr: 'Site Vitrine',
      en: 'Showcase Website',
    },
    tag: {
      fr: 'SUR-MESURE & BRANDING',
      en: 'BESPOKE & BRANDING',
    },
    description: {
      fr: 'Conception et développement de sites vitrines haut de gamme. Design contemporain, storytelling immersif et intégration fidèle pour sublimer l’image de marque de votre entreprise.',
      en: 'Design and front-end engineering of premium showcase websites. Contemporary design, immersive storytelling, and pixel-perfect integration to elevate your brand identity.',
    },
    features: {
      fr: ['Design Figma sur-mesure', 'Responsive mobile / tablette / desktop', 'Optimisation SEO & vitesse', 'Mise en ligne & hébergement Vercel'],
      en: ['Bespoke Figma design', 'Full responsive layout', 'SEO & speed optimization', 'Vercel cloud deployment'],
    },
    icon: '🌐',
  },
  {
    id: 'landing-page',
    number: '02',
    title: {
      fr: 'Landing Page',
      en: 'Landing Page',
    },
    tag: {
      fr: 'CONVERSION & ACQUISITION',
      en: 'CONVERSION & GROWTH',
    },
    description: {
      fr: 'Pages d’atterrissage percutantes conçues pour maximiser vos conversions, ventes et prises de contact. Structure persuasive, copywriting valorisé et micro-animations captivantes.',
      en: 'High-impact landing pages engineered to maximize conversions, sign-ups, and sales. Persuasive visual hierarchy, polished copywriting, and fluid micro-animations.',
    },
    features: {
      fr: ['Architecture orientée conversion', 'Temps de chargement éclair (< 1s)', 'Formulaires & tracking analytics', 'Animations interactives engageantes'],
      en: ['Conversion-first layout', 'Ultra-fast load times (< 1s)', 'Forms & tracking analytics', 'Engaging micro-interactions'],
    },
    icon: '🚀',
  },
  {
    id: 'e-commerce',
    number: '03',
    title: {
      fr: 'Site E-Commerce',
      en: 'E-Commerce Store',
    },
    tag: {
      fr: 'BOUTIQUE & VENTE EN LIGNE',
      en: 'ONLINE STORE & SALES',
    },
    description: {
      fr: 'Boutiques en ligne modernes, élégantes et intuitives. Parcours d’achat fluide sans friction, fiches produits dynamiques et intégration sécurisée des passerelles de paiement.',
      en: 'Modern, elegant and friction-free e-commerce stores. Fluid shopping experience, dynamic product catalogs, and secure payment gateway integrations.',
    },
    features: {
      fr: ['Catalogue produits interactif', 'Paiement Stripe / Shopify / Snipcart', 'Tunnel de commande optimisé', 'Interface d’administration simple'],
      en: ['Interactive product catalog', 'Stripe / Shopify integration', 'Optimized checkout flow', 'Intuitive store management'],
    },
    icon: '🛍️',
  },
  {
    id: 'application',
    number: '04',
    title: {
      fr: 'Application Web & Mobile',
      en: 'Web & Mobile App',
    },
    tag: {
      fr: 'SAAS, PWA & LOGICIELS',
      en: 'SAAS, PWA & SOFTWARE',
    },
    description: {
      fr: 'Développement d’applications web modernes, PWA installables sur mobile, dashboards dynamiques et intégrations d’agents IA autonomes pour automatiser vos flux de travail.',
      en: 'Development of modern web applications, installable mobile PWAs, dynamic dashboards, and autonomous AI agent workflows to power your product.',
    },
    features: {
      fr: ['React, TypeScript & APIs modernes', 'PWA installable & mode hors-ligne', 'Dashboards & visualisation de données', 'Intégration d’agents IA (LLMs)'],
      en: ['React, TypeScript & modern APIs', 'Installable PWA & offline support', 'Dashboards & data visualization', 'AI agent & LLM integrations'],
    },
    icon: '📱',
  },
  {
    id: '3d-interactions',
    number: '05',
    title: {
      fr: 'Animation & Interactions 3D',
      en: '3D Animation & WebGL',
    },
    tag: {
      fr: 'THREE.JS, R3F & MOTION',
      en: 'THREE.JS, R3F & MOTION',
    },
    description: {
      fr: 'Expériences web immersives et interactives en 3D (WebGL, Three.js, React Three Fiber). Animations fluides 60 FPS, shaders personnalisés et micro-interactions mémorables pour un effet WOAW garanti.',
      en: 'Immersive and interactive spatial 3D web experiences (WebGL, Three.js, React Three Fiber). Fluid 60 FPS animations, custom shaders, and memorable visual interactions.',
    },
    features: {
      fr: ['Scènes 3D interactives WebGL', 'Contrôles gyroscopiques & souris', 'Micro-interactions Framer Motion & GSAP', 'Optimisation des performances GPU'],
      en: ['Interactive WebGL 3D scenes', 'Gyroscopic & mouse tracking', 'Framer Motion & GSAP animations', 'GPU performance optimization'],
    },
    icon: '🪄',
  },
  {
    id: 'logo-branding',
    number: '06',
    title: {
      fr: 'Logo & Identité Visuelle',
      en: 'Logo & Brand Identity',
    },
    tag: {
      fr: 'CHARTE & DESIGN SYSTEM',
      en: 'STYLE GUIDE & DESIGN SYSTEM',
    },
    description: {
      fr: 'Création de logos vectoriels uniques, chartes graphiques complètes et design systems réutilisables. Une identité visuelle cohérente et distinctive du print au digital.',
      en: 'Creation of unique vector logos, comprehensive brand guidelines, and reusable design systems. A distinctive and cohesive visual identity from print to digital.',
    },
    features: {
      fr: ['Logotype vectoriel (SVG, AI, PNG)', 'Palette de couleurs & typographie', 'Charte graphique d’utilisation', 'Design System Figma prêt au code'],
      en: ['Vector logotype (SVG, AI, PNG)', 'Color palette & typography', 'Brand guidelines documentation', 'Figma Design System ready for code'],
    },
    icon: '🎨',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  lang,
  onOpenContact,
  onHoverItem,
  onLeaveItem,
}) => {
  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div className="max-w-xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            {lang === 'fr' ? '// EXPERTISES & RÉALISATIONS SUR-MESURE' : '// BESPOKE SERVICES & EXPERTISE'}
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
            {lang === 'fr'
              ? 'Ce que je conçois et développe pour vos projets.'
              : 'What I craft and build for your projects.'}
          </h3>
        </div>
        <p className="font-sans text-xs sm:text-sm text-zinc-600 max-w-sm">
          {lang === 'fr'
            ? 'De l’idée initiale au déploiement en production, chaque service est taillé pour la performance, l’esthétique et la conversion.'
            : 'From initial vision to production delivery, each service is built for performance, aesthetics, and high conversion.'}
        </p>
      </div>

      {/* 6 Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {SERVICES.map((service, index) => (
          <motion.article
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => onHoverItem?.(service.title[lang].toUpperCase())}
            onMouseLeave={onLeaveItem}
            className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1.5"
          >
            {/* Top Row: Icon + Number */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-xl shadow-xs group-hover:scale-110 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300">
                  {service.icon}
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-zinc-950 transition-colors">
                  {service.number} //
                </span>
              </div>

              {/* Tag & Title */}
              <div className="mt-5 space-y-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  {service.tag[lang]}
                </span>
                <h4 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 group-hover:text-blue-600 transition-colors">
                  {service.title[lang]}
                </h4>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-600">
                {service.description[lang]}
              </p>

              {/* Features List */}
              <ul className="mt-5 space-y-2 border-t border-zinc-100 pt-4">
                {service.features[lang].map((feat, fIdx) => (
                  <li key={`feat-${fIdx}`} className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-700">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Action Button */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (onOpenContact) {
                    onOpenContact();
                  } else {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-zinc-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span>{lang === 'fr' ? 'Démarrer ce projet' : 'Start this project'}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                DISPO 2026
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
