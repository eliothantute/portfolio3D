import { Project } from '../types';
import pingParisImg from '../assets/images/regenerated_image_1782446553640.png';
import atelierBergerBlueImg from '../assets/images/image_069-1-1.jpg';
import eloraImg from '../assets/images/hero.png';
import haziImg from '../assets/images/hazi-project.png';
import nariOsImg from '../assets/images/nari-os-project.png';

export const projectsData: Record<'fr' | 'en', Project[]> = {
  fr: [
    {
      id: 'atelier-berger',
      title: 'Atelier Berger',
      client: 'Atelier Berger Paris',
      subtitle: 'Globe 3D & Carte Interactive Immersive',
      description: "Carte interactive WebGL/Three.js présentant les réalisations d'architecture intérieure et de joaillerie de prestige à travers le monde.",
      longDescription: "Refonte complète de l'expérience de découverte des projets de l'Atelier Berger. Au lieu d'une grille classique, les visiteurs explorent un globe planétaire interactif en 3D généré procéduralement avec des lumières volumétriques et des orbites lumineuses géolocalisées.",
      year: '2026',
      category: 'Prototype IA & WebGL 3D',
      role: ['Direction Artificielle IA', 'Architecture Three.js', 'UI/UX Design', 'Intégration React'],
      stack: ['React 19', 'Three.js', 'React Globe GL', 'Tailwind CSS', 'Vite', 'Motion'],
      objective: "Sublimer le rayonnement international de l'agence à travers une navigation spatiale intuitive et mémorable.",
      status: 'Prototype fonctionnel déployé',
      liveUrl: 'https://globemap3-dberger.vercel.app/globe-react.html',
      githubUrl: 'https://github.com/eliothantute/Atelier-Berger-Carte-Interactive-',
      image: atelierBergerBlueImg,
      featured: true,
      isThreeD: true,
      coordinates: { lat: 48.8566, lng: 2.3522, locationName: 'Paris // Dubaï // Tokyo' },
      metrics: [
        { label: 'FPS Cible', value: '60 FPS' },
        { label: 'Particules 3D', value: '22,000+' },
        { label: 'Temps de réponse', value: '< 16ms' }
      ]
    },
    {
      id: 'elora',
      title: 'Elora',
      client: 'Elora',
      subtitle: 'Site Vitrine sur Maquette Figma',
      description: "Intégration front-end fidèle d'une maquette Figma conçue par le designer UI Dylan Rambinaising.",
      longDescription: "Développement complet du site Elora à partir d'une maquette Figma détaillée, réalisée par le designer UI Dylan Rambinaising. Un travail de collaboration étroite entre design et développement pour retranscrire fidèlement chaque interaction, espacement et micro-détail visuel de la maquette dans une expérience web performante.",
      year: '2026',
      category: 'Intégration Web & Collaboration Design',
      role: ['Développement Front-End', 'Intégration Figma vers Code', 'Responsive Design'],
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Figma'],
      objective: "Traduire fidèlement une maquette Figma en un site web réactif et performant, en étroite collaboration avec le designer UI.",
      status: 'En ligne',
      liveUrl: 'https://elora-sitev3.vercel.app/',
      image: eloraImg,
      featured: false,
      metrics: [
        { label: 'Rôle', value: 'Développeur' },
        { label: 'Design UI', value: 'Dylan Rambinaising' }
      ]
    },
    {
      id: 'nari-os',
      title: 'NARI OS',
      client: 'NARI',
      subtitle: 'Landing Page Agent Vocal Autonome',
      description: "Site vitrine pour un agent vocal IA souverain français capable de piloter un ordinateur par la voix.",
      longDescription: "Création de l'identité visuelle et intégration front-end du site NARI, un agent vocal autonome orchestrant plusieurs IA. Direction artistique spatiale et sobre (fond galactique, typographie condensée) pour incarner une technologie souveraine française premium, avec structure d'offres mensuelle et à vie.",
      year: '2026',
      category: 'Brand Design & Landing Page SaaS',
      role: ['Brand Design', 'Développement Front-End', 'UI/UX'],
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      objective: "Traduire la promesse d'une IA vocale souveraine et premium en une expérience web sobre et crédible.",
      status: 'En ligne',
      liveUrl: 'https://nari-os-sigma.vercel.app/',
      image: nariOsImg,
      featured: false,
      metrics: [
        { label: 'Positionnement', value: '🇫🇷 Souverain' },
        { label: 'Rôle', value: 'Brand + Front-End' }
      ]
    },
    {
      id: 'ping-paris',
      title: 'Ping Paris',
      client: 'Projet Personnel / PWA',
      subtitle: 'Localisateur Urbain & Météo API',
      description: "Application mobile interactive pour localiser instantanément les tables de tennis de table à Paris avec météo en temps réel.",
      longDescription: "Ping Paris résout la frustration des joueurs urbains en agrégeant l'ensemble des tables de ping-pong de la capitale sur une carte dynamique Leaflet synchronisée avec l'API Open-Meteo pour anticiper le vent et la pluie avant chaque partie.",
      year: '2026',
      category: 'Application Mobile & PWA',
      role: ['Product Design', 'Développement Front-End', 'Intégration API Cartographique'],
      stack: ['React', 'Leaflet Map', 'Open-Meteo API', 'PWA', 'Tailwind CSS', 'Geolocation'],
      objective: "Offrir un utilitaire urbain ultra-rapide, géolocalisé et consultable directement sur smartphone en plein air.",
      status: 'En constante évolution',
      liveUrl: 'https://pingparisapp.vercel.app/',
      githubUrl: 'https://github.com/eliothantute/pingparisapp',
      image: pingParisImg,
      featured: true,
      metrics: [
        { label: 'Spots Référencés', value: '180+ Tables' },
        { label: 'Précision Météo', value: 'Temps Réel' },
        { label: 'Score Lighthouse', value: '98%' }
      ]
    },
    {
      id: 'hazi-whatsapp',
      title: 'Hazi Whatsapp',
      client: 'Hazi',
      subtitle: 'Landing Page Logiciel Desktop 3D Edition',
      description: "Site vitrine premium pour un logiciel desktop de prospection multicanale WhatsApp & SMS, avec simulateur d'interface intégré.",
      longDescription: "Conception de l'identité de marque et développement front-end complet de la landing page Hazi Whatsapp. Le site met en scène un simulateur d'interface desktop interactif directement dans le navigateur, une esthétique cyber-green immersive et une structure de conversion pensée pour une offre de licence à vie.",
      year: '2026',
      category: 'Brand Design & Landing Page SaaS',
      role: ['Brand Design', 'Développement Front-End', 'UI/UX', 'Stratégie de Conversion'],
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Motion'],
      objective: "Installer une identité de marque forte et crédible pour transformer les visiteurs en acheteurs de licence.",
      status: 'En ligne',
      liveUrl: 'https://www.haziapp.fr/',
      image: haziImg,
      featured: true,
      metrics: [
        { label: 'Offre', value: 'Licence à vie' },
        { label: 'Rôle', value: 'Brand + Front-End' }
      ]
    }
  ],
  en: [
    {
      id: 'atelier-berger',
      title: 'Atelier Berger',
      client: 'Atelier Berger Paris',
      subtitle: '3D Globe & Immersive Interactive Map',
      description: "WebGL/Three.js interactive experience showcasing luxury interior architecture and high jewellery projects worldwide.",
      longDescription: "A complete redesign of Atelier Berger's portfolio showcase. Replacing standard grids with a live procedural 3D planetary globe featuring volumetric lighting and geolocated orbital glows.",
      year: '2026',
      category: 'AI Prototype & WebGL 3D',
      role: ['AI Art Direction', 'Three.js Engineering', 'UI/UX Design', 'React Integration'],
      stack: ['React 19', 'Three.js', 'React Globe GL', 'Tailwind CSS', 'Vite', 'Motion'],
      objective: "Elevate the agency's global prestige through intuitive, cinematic spatial navigation.",
      status: 'Deployed Functional Prototype',
      liveUrl: 'https://globemap3-dberger.vercel.app/globe-react.html',
      githubUrl: 'https://github.com/eliothantute/Atelier-Berger-Carte-Interactive-',
      image: atelierBergerBlueImg,
      featured: true,
      isThreeD: true,
      coordinates: { lat: 48.8566, lng: 2.3522, locationName: 'Paris // Dubai // Tokyo' },
      metrics: [
        { label: 'Target FPS', value: '60 FPS' },
        { label: '3D Particles', value: '22,000+' },
        { label: 'Frame Time', value: '< 16ms' }
      ]
    },
    {
      id: 'elora',
      title: 'Elora',
      client: 'Elora',
      subtitle: 'Showcase Site from Figma Design',
      description: "Pixel-faithful front-end build of a Figma design crafted by UI designer Dylan Rambinaising.",
      longDescription: "Full development of the Elora website from a detailed Figma design created by UI designer Dylan Rambinaising. A close collaboration between design and development to faithfully translate every interaction, spacing rule, and visual micro-detail into a performant web experience.",
      year: '2026',
      category: 'Web Integration & Design Collaboration',
      role: ['Front-End Development', 'Figma-to-Code Integration', 'Responsive Design'],
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Figma'],
      objective: "Faithfully translate a Figma design into a responsive, high-performance website in close collaboration with the UI designer.",
      status: 'Live',
      liveUrl: 'https://elora-sitev3.vercel.app/',
      image: eloraImg,
      featured: false,
      metrics: [
        { label: 'Role', value: 'Developer' },
        { label: 'UI Design', value: 'Dylan Rambinaising' }
      ]
    },
    {
      id: 'nari-os',
      title: 'NARI OS',
      client: 'NARI',
      subtitle: 'Autonomous Voice Agent Landing Page',
      description: "Showcase site for a sovereign French voice AI agent able to operate a computer through voice commands.",
      longDescription: "Visual identity creation and front-end integration for NARI, an autonomous voice agent orchestrating multiple AIs. A sober, spatial art direction (galaxy background, condensed typography) embodies a premium, sovereign French technology, paired with a monthly and lifetime pricing structure.",
      year: '2026',
      category: 'Brand Design & SaaS Landing Page',
      role: ['Brand Design', 'Front-End Development', 'UI/UX'],
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      objective: "Translate the promise of a premium, sovereign voice AI into a sober and credible web experience.",
      status: 'Live',
      liveUrl: 'https://nari-os-sigma.vercel.app/',
      image: nariOsImg,
      featured: false,
      metrics: [
        { label: 'Positioning', value: '🇫🇷 Sovereign' },
        { label: 'Role', value: 'Brand + Front-End' }
      ]
    },
    {
      id: 'ping-paris',
      title: 'Ping Paris',
      client: 'Personal Project / PWA',
      subtitle: 'Urban Locator & Weather API',
      description: "Interactive mobile app to instantly locate outdoor ping-pong tables across Paris with live wind/rain data.",
      longDescription: "Ping Paris solves urban players' frustration by mapping all public table tennis spots on a Leaflet canvas synchronized with Open-Meteo live forecasts.",
      year: '2026',
      category: 'Mobile App & PWA',
      role: ['Product Design', 'Front-End Development', 'Mapping API Integration'],
      stack: ['React', 'Leaflet Map', 'Open-Meteo API', 'PWA', 'Tailwind CSS', 'Geolocation'],
      objective: "Provide an ultra-fast outdoor utility accessible directly from any smartphone.",
      status: 'Active Iteration',
      liveUrl: 'https://pingparisapp.vercel.app/',
      githubUrl: 'https://github.com/eliothantute/pingparisapp',
      image: pingParisImg,
      featured: true,
      metrics: [
        { label: 'Mapped Spots', value: '180+ Tables' },
        { label: 'Weather Feed', value: 'Real-Time' },
        { label: 'Lighthouse Score', value: '98%' }
      ]
    },
    {
      id: 'hazi-whatsapp',
      title: 'Hazi Whatsapp',
      client: 'Hazi',
      subtitle: 'Desktop Software Landing Page, 3D Edition',
      description: "Premium showcase site for a multichannel WhatsApp & SMS prospecting desktop software, featuring an embedded interface simulator.",
      longDescription: "Brand identity design and full front-end development of the Hazi Whatsapp landing page. The site features an interactive desktop interface simulator running directly in the browser, an immersive cyber-green aesthetic, and a conversion-driven structure built around a lifetime license offer.",
      year: '2026',
      category: 'Brand Design & SaaS Landing Page',
      role: ['Brand Design', 'Front-End Development', 'UI/UX', 'Conversion Strategy'],
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Motion'],
      objective: "Establish a strong, credible brand identity to convert visitors into lifetime license buyers.",
      status: 'Live',
      liveUrl: 'https://www.haziapp.fr/',
      image: haziImg,
      featured: true,
      metrics: [
        { label: 'Offer', value: 'Lifetime License' },
        { label: 'Role', value: 'Brand + Front-End' }
      ]
    }
  ]
};

export const skillsList = [
  { name: 'Three.js / WebGL', level: '95%', cat: '3D & Shaders' },
  { name: 'React 19 / Next.js', level: '95%', cat: 'Core Architecture' },
  { name: 'Tailwind CSS', level: '98%', cat: 'UI Craftsmanship' },
  { name: 'GSAP & Motion', level: '92%', cat: 'Cinematic Animation' },
  { name: 'TypeScript', level: '90%', cat: 'Type Safety' },
  { name: 'Web Audio API', level: '88%', cat: 'Sound Design' },
  { name: 'UI/UX Architecture', level: '94%', cat: 'Active Theory Vibe' }
];
