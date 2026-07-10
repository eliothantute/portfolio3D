import { Project } from '../types';
import pingParisImg from '../assets/images/regenerated_image_1782446553640.png';
import arcReflexImg from '../assets/images/arc-reflex-project.png';
import zedenImg from '../assets/images/zeden-project.jpg';
import ofissImg from '../assets/images/OFISS.png';

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
      liveUrl: 'https://www.ateliersberger.com/',
      githubUrl: 'https://github.com/eliothantute/Atelier-Berger-Carte-Interactive-',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
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
      id: 'arc-reflex',
      title: 'Arc Reflex',
      client: 'Arc Reflex Client',
      subtitle: 'Landing Page Premium & Identité',
      description: "Refonte stratégique centrée sur la conversion, création du logotype et infrastructure SEO/DNS.",
      longDescription: "Accompagnement digital complet à 360° : de la direction artistique initiale et la création du logotype jusqu'au déploiement technique optimisé, la configuration des enregistrements DNS et l'optimisation locale Google Business Profile.",
      year: '2025',
      category: 'Client Work & Branding',
      role: ['Web Design', 'Identité Visuelle', 'Intégration HTML/Tailwind', 'Stratégie SEO'],
      stack: ['HTML5', 'Tailwind CSS', 'JavaScript', 'Google Business', 'DNS/Cloudflare'],
      objective: "Établir une autorité de marque instantanée et générer des contacts qualifiés.",
      status: 'En ligne & Optimisé',
      liveUrl: 'https://www.arc-reflex.com/',
      image: arcReflexImg,
      featured: false,
      metrics: [
        { label: 'Taux de Conversion', value: '+42%' },
        { label: 'Vitesse de Chargement', value: '0.4s' }
      ]
    },
    {
      id: 'zeden-audiolab',
      title: 'Zeden AudioLab',
      client: 'Zeden Electronic Music',
      subtitle: 'Expérience Vitrine Musicale & DJ',
      description: "Site immersif avec lecteur audio réactif, visualiseur de fréquences et univers cyberpunk.",
      longDescription: "Conception d'une plateforme d'exploration sonore pour le projet électronique Zeden. L'interface marie des codes bruts issus du hardware audio vintage et du design d'interface futuriste avec des interactions sonores tactiles.",
      year: '2026',
      category: 'Audio Visual Experience',
      role: ['Sound Design', 'Creative Coding', 'UI Brutalisme'],
      stack: ['Web Audio API', 'Canvas 2D', 'React', 'Motion', 'Tailwind CSS'],
      objective: "Plonger l'auditeur dans l'univers sombre et cadencé des productions électroniques de l'artiste.",
      status: 'Live Signal',
      liveUrl: 'https://zeden-864496946830.europe-west2.run.app/',
      image: zedenImg,
      featured: true,
      metrics: [
        { label: 'Latence Audio', value: 'Zero Buffer' },
        { label: 'Ambiance', value: 'Dark Cyber' }
      ]
    },
    {
      id: 'ofiss',
      title: 'OFISS Architecture',
      client: 'OFISS Studio',
      subtitle: 'Espace Digital & Identité Architecturale',
      description: "Vitrine interactive épurée conçue pour l'agence d'architecture et de design d'intérieur OFISS.",
      longDescription: "Conception d'une expérience digitale sur-mesure pour OFISS, retranscrivant la pureté des lignes, la précision spatiale et le dialogue des matières propres à l'identité du studio.",
      year: '2026',
      category: 'Architecture & Design Showcase',
      role: ['Direction Artistique', 'UI/UX Architecture', 'Développement Front-End'],
      stack: ['React', 'Tailwind CSS', 'Motion', 'TypeScript', 'Vite'],
      objective: "Traduire la rigueur architecturale et le raffinement visuel de l'agence sur le support digital.",
      status: 'Projet Déployé',
      image: ofissImg,
      featured: true,
      metrics: [
        { label: 'Esthétique', value: 'Minimaliste' },
        { label: 'Fluidité', value: '60 FPS' }
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
      liveUrl: 'https://www.ateliersberger.com/',
      githubUrl: 'https://github.com/eliothantute/Atelier-Berger-Carte-Interactive-',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
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
      id: 'arc-reflex',
      title: 'Arc Reflex',
      client: 'Arc Reflex Client Work',
      subtitle: 'Conversion Landing Page & Branding',
      description: "Strategic conversion-driven web redesign, logo identity creation, and full SEO/DNS infrastructure.",
      longDescription: "End-to-end digital craftsmanship: from logotype design and visual identity to high-speed responsive deployment and DNS record optimization.",
      year: '2025',
      category: 'Client Work & Branding',
      role: ['Web Design', 'Brand Identity', 'HTML/Tailwind Dev', 'SEO Strategy'],
      stack: ['HTML5', 'Tailwind CSS', 'JavaScript', 'Google Business', 'DNS/Cloudflare'],
      objective: "Establish immediate brand authority and drive qualified incoming leads.",
      status: 'Live & Optimized',
      liveUrl: 'https://www.arc-reflex.com/',
      image: arcReflexImg,
      featured: false,
      metrics: [
        { label: 'Conversion Lift', value: '+42%' },
        { label: 'Load Speed', value: '0.4s' }
      ]
    },
    {
      id: 'zeden-audiolab',
      title: 'Zeden AudioLab',
      client: 'Zeden Electronic Music',
      subtitle: 'Cyberpunk Musical Showcase',
      description: "Immersive artist site featuring responsive audio player, frequency visualizer, and dark creative coding.",
      longDescription: "An exploration into sound and interface design for electronic music artist Zeden. Blending raw brutalist hardware aesthetics with fluid micro-interactions.",
      year: '2026',
      category: 'Audio Visual Experience',
      role: ['Sound Design', 'Creative Coding', 'Brutalist UI'],
      stack: ['Web Audio API', 'Canvas 2D', 'React', 'Motion', 'Tailwind CSS'],
      objective: "Immerse listeners in the dark, rhythmic universe of the producer's tracks.",
      status: 'Live Signal',
      liveUrl: 'https://zeden-864496946830.europe-west2.run.app/',
      image: zedenImg,
      featured: true,
      metrics: [
        { label: 'Audio Latency', value: 'Zero Buffer' },
        { label: 'Vibe', value: 'Dark Cyber' }
      ]
    },
    {
      id: 'ofiss',
      title: 'OFISS Architecture',
      client: 'OFISS Studio',
      subtitle: 'Digital Space & Architectural Identity',
      description: "Refined interactive showcase tailored for interior architecture and design agency OFISS.",
      longDescription: "Crafting a bespoke digital experience for OFISS that reflects the studio's spatial precision, pure geometric lines, and dialogue between raw materials.",
      year: '2026',
      category: 'Architecture & Design Showcase',
      role: ['Art Direction', 'UI/UX Architecture', 'Front-End Development'],
      stack: ['React', 'Tailwind CSS', 'Motion', 'TypeScript', 'Vite'],
      objective: "Translate the agency's architectural rigor and visual elegance into a seamless web experience.",
      status: 'Deployed Project',
      image: ofissImg,
      featured: true,
      metrics: [
        { label: 'Aesthetics', value: 'Minimalist' },
        { label: 'Performance', value: '60 FPS' }
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
