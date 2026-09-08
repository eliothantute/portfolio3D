import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface ServicesSectionProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

interface ServiceItem {
  id: string;
  number: string;
  title: { fr: string; en: string };
  tag: { fr: string; en: string };
  description: { fr: string; en: string };
  features: { fr: string[]; en: string[] };
}

const SERVICES: ServiceItem[] = [
  {
    id: 'site-vitrine',
    number: '01',
    title: {
      fr: 'Sites Vitrines & Portfolios',
      en: 'Showcase Websites & Portfolios',
    },
    tag: {
      fr: 'DESIGN & BRANDING',
      en: 'DESIGN & BRANDING',
    },
    description: {
      fr: 'Sites web modernes, épurés et responsives pour valoriser votre activité avec élégance.',
      en: 'Modern, clean, responsive websites to elevate your brand presence with distinction.',
    },
    features: {
      fr: ['Design soigné sur-mesure', 'Adapté mobile & desktop', 'Vitesse & référencement SEO'],
      en: ['Bespoke aesthetic design', 'Mobile & desktop ready', 'Fast loading & SEO optimized'],
    },
  },
  {
    id: '3d-interactions',
    number: '02',
    title: {
      fr: 'Expériences 3D & Interactives',
      en: 'Interactive 3D & WebGL',
    },
    tag: {
      fr: 'WEBGL & THREE.JS',
      en: 'WEBGL & THREE.JS',
    },
    description: {
      fr: 'Animations immersives et éléments 3D interactifs pour captiver vos visiteurs.',
      en: 'Immersive animations and interactive 3D elements to captivate your audience.',
    },
    features: {
      fr: ['Objets 3D interactifs', 'Effets visuels fluides', 'Performance fluide sur tous supports'],
      en: ['Interactive 3D objects', 'Fluid visual transitions', 'Smooth performance on all devices'],
    },
  },
  {
    id: 'landing-page',
    number: '03',
    title: {
      fr: 'Landing Pages & Conversion',
      en: 'Landing Pages & Growth',
    },
    tag: {
      fr: 'CONVERSION & VENTES',
      en: 'CONVERSION & SALES',
    },
    description: {
      fr: 'Pages ciblées et percutantes conçues pour générer des prospects et des ventes.',
      en: 'Focused high-impact pages designed to turn visitors into clients and sales.',
    },
    features: {
      fr: ['Structure claire & directe', 'Appels à l’action optimisés', 'Mesure des résultats'],
      en: ['Clear persuasive flow', 'Optimized call-to-actions', 'Performance tracking'],
    },
  },
  {
    id: 'application',
    number: '04',
    title: {
      fr: 'Applications Web & IA',
      en: 'Web Applications & AI',
    },
    tag: {
      fr: 'SAAS & OUTILS MÉTIERS',
      en: 'SAAS & SMART TOOLS',
    },
    description: {
      fr: 'Interfaces intelligentes, espaces clients et intégrations d’outils IA sur-mesure.',
      en: 'Intuitive web dashboards, client portals, and smart AI tool integrations.',
    },
    features: {
      fr: ['Interfaces React réactives', 'Connexion aux APIs & IA', 'Déploiement cloud sécurisé'],
      en: ['Fast React interfaces', 'API & AI integrations', 'Secure cloud hosting'],
    },
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  lang,
  onOpenContact,
  onHoverItem,
  onLeaveItem,
  hideHeader = false,
}) => {
  return (
    <div className="w-full">
      {/* 4 Clean Editorial Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {SERVICES.map((service) => (
          <article
            key={service.id}
            onMouseEnter={() => onHoverItem?.(service.title[lang].toUpperCase())}
            onMouseLeave={onLeaveItem}
            className="group relative flex flex-col justify-between rounded-2xl md:rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-8 transition-all duration-300 hover:border-black/25 hover:shadow-md"
          >
            <div>
              {/* Header: Number + Tag */}
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                <span className="font-bold text-black">[ {service.number} ]</span>
                <span className="uppercase tracking-wider">{service.tag[lang]}</span>
              </div>

              {/* Title & Short Description */}
              <h3 className="font-display mt-4 text-xl sm:text-2xl font-bold tracking-tight text-black">
                {service.title[lang]}
              </h3>

              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {service.description[lang]}
              </p>

              {/* 3 Bullet Points */}
              <ul className="mt-5 space-y-2 border-t border-black/[0.06] pt-4 font-mono text-xs text-zinc-600">
                {service.features[lang].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-black" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Contact Link */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenContact) {
                    onOpenContact();
                  } else {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold text-black hover:text-zinc-600 transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'Discuter de ce service →' : 'Discuss this service →'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
