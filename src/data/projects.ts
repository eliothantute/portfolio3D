import { Project, StackCategory, ProfilePillar } from '../types';
import pingParisImg from '../assets/images/regenerated_image_1782446553640.png';
import atelierBergerBlueImg from '../assets/images/image_069-1-1.jpg';
import eloraImg from '../assets/images/hero.png';
import haziImg from '../assets/images/hazi-project.png';
import nariOsImg from '../assets/images/nari-os-project.png';
import aumParisImg from '../assets/aum-paris.jpg';
import disfocusImg from '../assets/disfocus.jpg';

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
      category: 'Front-End // WebGL 3D',
      skillType: 'frontend',
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
      category: 'Design // Figma vers Code',
      skillType: 'design',
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
      category: 'Design // Brand & UI/UX',
      skillType: 'design',
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
      category: 'App // Mobile & PWA',
      skillType: 'app',
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
      category: 'App // Logiciel Desktop & IA',
      skillType: 'app',
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
    },
    {
      id: 'motion-study',
      title: 'Motion Study',
      client: 'Composition & Motion',
      subtitle: 'Composition Musicale & Rythme Cinématique',
      description: "Rythme cinématique, chorégraphie lumineuse et tension architecturale au service d'une composition sonore immersive.",
      longDescription: "Création sonore originale et composition musicale synchronisée sur une étude de mouvement en grand format. Exploration de textures électroniques, de rythmes minimaux et d'une ambiance cinématique spatiale.",
      year: '2026',
      category: 'Composition Musicale // Sound Design',
      skillType: 'music',
      role: ['Composition Musicale', 'Sound Design', 'Production Sonore', 'Direction Artistique'],
      stack: ['Production Audio', 'Sound Design', 'Cinematic Scoring', 'Ableton / DAW'],
      objective: "Composer une œuvre sonore cinématique et immersive synchronisée avec des mouvements visuels de haute précision.",
      status: 'Vidéo YouTube disponible',
      liveUrl: 'https://www.youtube.com/watch?v=p_tCq55WbfA',
      youtubeId: 'p_tCq55WbfA',
      image: 'https://img.youtube.com/vi/p_tCq55WbfA/maxresdefault.jpg',
      featured: true,
      metrics: [
        { label: 'Format', value: '4K Vidéo' },
        { label: 'Plateforme', value: 'YouTube' },
        { label: 'Style', value: 'Cinematic' }
      ]
    },
    {
      id: 'spatial-flow',
      title: 'Spatial Flow',
      client: 'Showcase Éditorial',
      subtitle: 'Composition Musicale & Ambiance Immersive',
      description: "Une seconde séquence pensée comme un showcase éditorial immersif avec une texture musicale enveloppante.",
      longDescription: "Production sonore atmosphérique alliant nappes harmoniques synthétiques et progressions dynamiques pour enrichir l'expérience visuelle d'un showcase éditorial.",
      year: '2026',
      category: 'Composition Musicale // Sound Design',
      skillType: 'music',
      role: ['Composition Musicale', 'Arrangements', 'Mixage', 'Atmosphère'],
      stack: ['Synthèse Sonore', 'Spatial Audio', 'Soundtrack', 'Mastering'],
      objective: "Développer une signature sonore organique et moderne qui porte la narration spatiale.",
      status: 'Vidéo YouTube disponible',
      liveUrl: 'https://www.youtube.com/watch?v=066sAQYrylw',
      youtubeId: '066sAQYrylw',
      image: 'https://img.youtube.com/vi/066sAQYrylw/maxresdefault.jpg',
      featured: false,
      metrics: [
        { label: 'Format', value: 'HD Vidéo' },
        { label: 'Plateforme', value: 'YouTube' },
        { label: 'Type', value: 'Ambient' }
      ]
    },
    {
      id: 'aum-paris',
      title: 'AUM Paris',
      client: 'AUM Paris',
      subtitle: 'Boutique E-Commerce Cosmétique Bio & Soin d’Exception',
      description: "Boutique en ligne moderne pour soins corporels bio d’exception avec panier tiroir, sélecteur multidevise et effets liquides.",
      longDescription: "Conception et développement complet de la boutique e-commerce AUM Paris. Interface haut de gamme axée sur le Baume Sublime Baiser d’Été, intégrant un panier tiroir instantané, la prise en charge multilingue (FR, EN, ES, IT), des micro-interactions de déformation fluide au survol des produits et un tunnel de commande sans friction.",
      year: '2026',
      category: 'E-Commerce // Cosmétique de Luxe',
      skillType: 'frontend',
      role: ['Développement Front-End', 'UI/UX E-Commerce', 'Tunnel d\'Achat', 'Performance Web'],
      stack: ['JavaScript (ES6+)', 'CSS3 Moderne', 'Panier Drawer', 'i18n Multi-langues', 'Vite', 'Vercel'],
      objective: "Offrir une expérience d'achat en ligne digne d'une maison de luxe avec une vitesse de chargement instantanée et une ergonomie irréprochable.",
      status: 'En ligne',
      liveUrl: 'https://aum-paris.vercel.app/',
      image: aumParisImg,
      featured: true,
      metrics: [
        { label: 'Type', value: 'E-Commerce' },
        { label: 'Langues', value: 'FR • EN • ES • IT' },
        { label: 'Panier', value: 'Tiroir Instantané' }
      ]
    },
    {
      id: 'disfocus',
      title: 'DISFOCUS',
      client: 'DISFOCUS',
      subtitle: 'Site Vitrine 3D Immersif pour Artiste & Producteur',
      description: "Expérience web 3D cyberpunk avec shaders WebGL réactifs, lecteur SoundCloud intégré, archives vidéo et espace booking.",
      longDescription: "Direction artistique et développement front-end du site vitrine de l'artiste et producteur électronique DISFOCUS. Univers sombre et électrisant propulsé par Three.js et des shaders GLSL personnalisés : distorsion glitch en temps réel, visualiseur audio interactif, intégration fluide du flux SoundCloud et grilles vidéo d'archives.",
      year: '2026',
      category: 'Site Vitrine // WebGL 3D & Musique',
      skillType: 'frontend',
      role: ['Direction Artistique', 'Développement Three.js / WebGL', 'Shaders GLSL', 'UI Cyberpunk'],
      stack: ['Three.js', 'WebGL & Shaders GLSL', 'Audio Web API', 'GSAP', 'Vite', 'Vercel'],
      objective: "Créer un univers visuel marquant et interactif à la hauteur de l'énergie scénique de l'artiste pour captiver les labels et bookers.",
      status: 'En ligne',
      liveUrl: 'https://disfocus.vercel.app/',
      image: disfocusImg,
      featured: true,
      isThreeD: true,
      metrics: [
        { label: 'Moteur 3D', value: 'Three.js / GLSL' },
        { label: 'Audio', value: 'Visualizer Réactif' },
        { label: 'BPM', value: '125 — 175 BPM' }
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
      category: 'Front-End // WebGL 3D',
      skillType: 'frontend',
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
      category: 'Design // Figma to Code',
      skillType: 'design',
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
      category: 'Design // Brand & UI/UX',
      skillType: 'design',
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
      category: 'App // Mobile & PWA',
      skillType: 'app',
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
      category: 'App // Desktop Software & AI',
      skillType: 'app',
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
    },
    {
      id: 'motion-study',
      title: 'Motion Study',
      client: 'Composition & Motion',
      subtitle: 'Music Composition & Cinematic Rhythm',
      description: 'Cinematic pacing, light choreography, and architectural tension driving an immersive sound composition.',
      longDescription: 'Original music score and sound design synchronized to a large-format motion study. Exploring electronic textures, minimal rhythms, and spatial cinematic atmosphere.',
      year: '2026',
      category: 'Music Composition // Sound Design',
      skillType: 'music',
      role: ['Music Composition', 'Sound Design', 'Audio Production', 'Art Direction'],
      stack: ['Audio Production', 'Sound Design', 'Cinematic Scoring', 'Ableton / DAW'],
      objective: 'Score an immersive cinematic piece synchronized with precision visual motion.',
      status: 'YouTube Video Available',
      liveUrl: 'https://www.youtube.com/watch?v=p_tCq55WbfA',
      youtubeId: 'p_tCq55WbfA',
      image: 'https://img.youtube.com/vi/p_tCq55WbfA/maxresdefault.jpg',
      featured: true,
      metrics: [
        { label: 'Format', value: '4K Video' },
        { label: 'Platform', value: 'YouTube' },
        { label: 'Style', value: 'Cinematic' }
      ]
    },
    {
      id: 'spatial-flow',
      title: 'Spatial Flow',
      client: 'Editorial Showcase',
      subtitle: 'Music Composition & Immersive Flow',
      description: 'A second sequence conceived as an immersive editorial showcase with enveloping musical atmosphere.',
      longDescription: 'Atmospheric audio production blending synthetic harmonic pads and dynamic progressions to elevate the visual narrative of an editorial showcase.',
      year: '2026',
      category: 'Music Composition // Sound Design',
      skillType: 'music',
      role: ['Music Composition', 'Arranging', 'Mixing', 'Atmosphere'],
      stack: ['Sound Synthesis', 'Spatial Audio', 'Soundtrack', 'Mastering'],
      objective: 'Develop an organic, modern audio identity to drive spatial storytelling.',
      status: 'YouTube Video Available',
      liveUrl: 'https://www.youtube.com/watch?v=066sAQYrylw',
      youtubeId: '066sAQYrylw',
      image: 'https://img.youtube.com/vi/066sAQYrylw/maxresdefault.jpg',
      featured: false,
      metrics: [
        { label: 'Format', value: 'HD Video' },
        { label: 'Platform', value: 'YouTube' },
        { label: 'Type', value: 'Ambient' }
      ]
    },
    {
      id: 'aum-paris',
      title: 'AUM Paris',
      client: 'AUM Paris',
      subtitle: 'Luxury Organic Skincare E-Commerce Store',
      description: "Modern e-commerce showcase for luxury organic skincare with cart drawer, multi-currency selector and fluid visual interactions.",
      longDescription: "Full design and front-end development of the AUM Paris e-commerce flagship. Premium aesthetic focused on organic luxury skincare, featuring an instant cart drawer, multilingual localization (FR, EN, ES, IT), fluid liquid hover interactions, and friction-free checkout architecture.",
      year: '2026',
      category: 'E-Commerce // Luxury Skincare',
      skillType: 'frontend',
      role: ['Front-End Development', 'E-Commerce UI/UX', 'Checkout Flow', 'Web Performance'],
      stack: ['JavaScript (ES6+)', 'Modern CSS3', 'Cart Drawer', 'i18n Localization', 'Vite', 'Vercel'],
      objective: "Deliver a luxury shopping experience with instant load times, refined typography, and intuitive customer checkout.",
      status: 'Live',
      liveUrl: 'https://aum-paris.vercel.app/',
      image: aumParisImg,
      featured: true,
      metrics: [
        { label: 'Type', value: 'E-Commerce' },
        { label: 'Languages', value: 'FR • EN • ES • IT' },
        { label: 'Cart', value: 'Instant Drawer' }
      ]
    },
    {
      id: 'disfocus',
      title: 'DISFOCUS',
      client: 'DISFOCUS',
      subtitle: 'Immersive 3D Artist & Producer Showcase',
      description: "Cyberpunk spatial 3D web experience with reactive WebGL shaders, integrated SoundCloud streaming, live video sets, and booking portal.",
      longDescription: "Art direction and creative front-end engineering for electronic music producer DISFOCUS. Dark, high-octane spatial universe powered by Three.js and custom GLSL shaders: real-time glitch distortion, reactive audio visualizer, seamless SoundCloud streaming integration, and live video archives.",
      year: '2026',
      category: 'Artist Showcase // 3D WebGL & Audio',
      skillType: 'frontend',
      role: ['Art Direction', 'Three.js / WebGL Development', 'Custom GLSL Shaders', 'Cyberpunk UI'],
      stack: ['Three.js', 'WebGL & Shaders GLSL', 'Audio Web API', 'GSAP', 'Vite', 'Vercel'],
      objective: "Engineer a striking visual identity and interactive spatial universe matching the artist's live energy to engage labels and bookers.",
      status: 'Live',
      liveUrl: 'https://disfocus.vercel.app/',
      image: disfocusImg,
      featured: true,
      isThreeD: true,
      metrics: [
        { label: '3D Engine', value: 'Three.js / GLSL' },
        { label: 'Audio', value: 'Reactive Visualizer' },
        { label: 'BPM', value: '125 — 175 BPM' }
      ]
    }
  ]
};

export interface ProfileContent {
  name: string;
  role: string;
  badge: string;
  heroPitch: string;
  heroHighlight: string[];
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  pillars: ProfilePillar[];
}

export const profileData: Record<'fr' | 'en', ProfileContent> = {
  fr: {
    name: 'Eliot Hantute',
    role: 'Creative Front-End Developer & UI Designer',
    badge: 'Disponible pour missions & CDI',
    heroPitch:
      "J'aime concevoir des interfaces soignées, des sites vitrines et des landing pages captivantes, sublimés par des animations fluides et de la 3D interactive.",
    heroHighlight: [
      'React & Three.js / R3F',
      'Développement Assisté par IA',
      'UI/UX & Design Systems',
      'Intégration & Déploiement Continu'
    ],
    aboutTitle: 'Développeur Créatif & Front-End Augmenté par l’IA',
    aboutParagraph1:
      'Basé à Paris, je combine direction artistique, rigueur du design et flux d’ingénierie augmentés par l’IA pour concevoir des expériences web immersives, performantes et prêtes pour la production.',
    aboutParagraph2:
      'Du design system Figma au code de production, j’orchestre les outils IA de dernière génération (Gemini, Claude, Antigravity) pour itérer 3× plus vite tout en maintenant des standards de code irréprochables.',
    pillars: [
      {
        id: 'creative-dev',
        title: 'Front-End Créatif',
        subtitle: 'Web 3D, R3F & micro-interactions',
        description:
          'Maîtrise du trio React 19 + Tailwind CSS + Three.js / React Three Fiber (R3F) pour concevoir des scènes spatiales, shaders et animations interactives fluides.',
        highlight: 'React 19 • Three.js / R3F • Motion'
      },
      {
        id: 'ai-augmented',
        title: 'Design UI/UX & Systèmes',
        subtitle: 'De Figma au code haute fidélité',
        description:
          'Direction artistique, typographie, design systems et intégration fidèle de maquettes Figma avec attention extrême aux détails et micro-animations.',
        highlight: 'Figma → Code • Design Systems • UI/UX'
      },
      {
        id: 'full-lifecycle',
        title: 'Applications & IA',
        subtitle: 'PWA, agents autonomes & cloud',
        description:
          'Applications web complètes, PWA hors-ligne, orchestration de modèles LLM et déploiement continu à haute disponibilité sur Vercel.',
        highlight: 'PWA • LLMs & Agents • CI/CD Vercel'
      }
    ]
  },
  en: {
    name: 'Eliot Hantute',
    role: 'Creative Front-End Developer & UI Designer',
    badge: 'Available for Missions & Full-Time',
    heroPitch:
      'I love crafting polished interfaces, showcase websites, and immersive landing pages brought to life with fluid animations and interactive 3D.',
    heroHighlight: [
      'React & Three.js / R3F',
      'AI-Augmented Engineering',
      'UI/UX & Design Systems',
      'Full-Lifecycle Delivery'
    ],
    aboutTitle: 'Creative Developer & AI-Augmented Front-End',
    aboutParagraph1:
      'Based in Paris, I bridge art direction, detail-oriented design, and AI-augmented engineering workflows to build immersive, performant, and production-ready web experiences.',
    aboutParagraph2:
      'From Figma design systems to production-grade code, I orchestrate modern AI tooling (Gemini, Claude, Antigravity) to iterate 3× faster while maintaining uncompromising standards of code quality.',
    pillars: [
      {
        id: 'creative-dev',
        title: 'Creative Front-End',
        subtitle: '3D Web, R3F & micro-interactions',
        description:
          'Mastery of React 19 + Tailwind CSS + Three.js / React Three Fiber (R3F) to deliver spatial experiences, custom shaders, and polished interactive motion.',
        highlight: 'React 19 • Three.js / R3F • Motion'
      },
      {
        id: 'ai-augmented',
        title: 'UI/UX Design & Systems',
        subtitle: 'From Figma to high-fidelity code',
        description:
          'Art direction, typography, design systems, and pixel-perfect Figma integration with extreme care for micro-interactions.',
        highlight: 'Figma → Code • Design Systems • UI/UX'
      },
      {
        id: 'full-lifecycle',
        title: 'Applications & AI',
        subtitle: 'PWA, autonomous agents & cloud',
        description:
          'Full web applications, offline PWAs, LLM orchestration, and continuous high-availability deployment on Vercel.',
        highlight: 'PWA • LLMs & Agents • CI/CD Vercel'
      }
    ]
  }
};

export const skillsCategories = [
  {
    type: 'frontend' as const,
    title: { fr: 'Front-End & 3D', en: 'Front-End & 3D' },
    subtitle: { fr: 'React 19, Three.js, R3F & Motion', en: 'React 19, Three.js, R3F & Motion' },
    description: {
      fr: 'Développement d’interfaces immersives, animations fluides au 60 FPS, WebGL, Three.js et composants réactifs modernes.',
      en: 'Immersive UI engineering, smooth 60 FPS animations, WebGL, Three.js and modern reactive components.'
    },
    skills: ['React 19', 'TypeScript', 'Three.js / R3F', 'Tailwind CSS', 'Framer Motion', 'Vite / Next.js', 'WebGL Shaders'],
    projectIds: ['atelier-berger']
  },
  {
    type: 'design' as const,
    title: { fr: 'Design & UI/UX', en: 'Design & UI/UX' },
    subtitle: { fr: 'Figma, Design Systems & DA', en: 'Figma, Design Systems & Art Direction' },
    description: {
      fr: 'Direction artistique contemporaine, conception de design systems scalables, prototypage Figma haute fidélité et intégration pixel-perfect.',
      en: 'Contemporary art direction, scalable design systems, high-fidelity Figma prototyping and pixel-perfect integration.'
    },
    skills: ['UI/UX Design', 'Figma vers Code', 'Design Systems', 'Micro-interactions', 'Typographie', 'Wireframing', 'Brand Identity'],
    projectIds: ['elora', 'nari-os']
  },
  {
    type: 'app' as const,
    title: { fr: 'Applications & IA', en: 'Applications & AI' },
    subtitle: { fr: 'PWA, Logiciels & Agents IA', en: 'PWA, Software & AI Agents' },
    description: {
      fr: 'Applications web complètes, PWA géolocalisées, intégration de modèles LLMs (Claude, Gemini), agents autonomes et déploiement cloud CI/CD.',
      en: 'Full-stack web applications, geolocated PWAs, LLM integration (Claude, Gemini), autonomous agents and CI/CD cloud deployment.'
    },
    skills: ['PWA & Mobile', 'APIs & Geolocation', 'LLMs & Agents IA', 'Claude Code / Antigravity', 'CI/CD & Vercel', 'Performance Optimization'],
    projectIds: ['ping-paris', 'hazi-whatsapp']
  },
  {
    type: 'music' as const,
    title: { fr: 'Composition Musicale', en: 'Music Composition' },
    subtitle: { fr: 'Sound Design & Musique à l’Image', en: 'Sound Design & Scoring' },
    description: {
      fr: 'Composition originale, paysages sonores immersifs, arrangements cinématiques et synchronisation sur créations visuelles.',
      en: 'Original composition, immersive soundscapes, cinematic arrangements and scoring synchronized to visual motion.'
    },
    skills: ['Sound Design', 'Composition Musicale', 'Production Sonore', 'Arrangements', 'Mixage & Mastering', 'Atmosphère & Synthèse'],
    projectIds: ['motion-study', 'spatial-flow']
  }
];

export const stackCategoriesData: Record<'fr' | 'en', StackCategory[]> = {
  fr: [
    {
      id: 'frontend-creative',
      name: 'Front-End & Creative',
      tag: 'Core Technologies',
      description: 'Développement d’interfaces réactives, animations soignées et scènes 3D interactives.',
      skills: [
        'React',
        'Vite',
        'Tailwind CSS',
        'Three.js / React Three Fiber (R3F)',
        'HTML5 & CSS3',
        'JavaScript / TypeScript'
      ]
    },
    {
      id: 'ai-agentic',
      name: 'IA & Applications agentiques',
      tag: 'AI-Augmented Power',
      description: 'Intégration de modèles fondateurs, agents autonomes et flux de code augmentés.',
      skills: [
        'Intégration de LLMs (Gemini, Claude)',
        'Architecture d’agents',
        'Prototypage assisté par IA',
        'Tooling IA (Claude Code, Antigravity)',
        'Prompt Engineering & Orchestration'
      ]
    },
    {
      id: 'design-prototyping',
      name: 'Design & Prototypage',
      tag: 'Visual Craft',
      description: 'Direction artistique, ergonomie utilisateur, design systems et maquettes haute fidélité.',
      skills: [
        'UI/UX Design',
        'Design Systems',
        'Antigravity',
        'Figma',
        'Micro-interactions',
        'Wireframing & Spécifications'
      ]
    },
    {
      id: 'workflow-deployment',
      name: 'Workflow & Déploiement',
      tag: 'Production Ready',
      description: 'Outillage professionnel, intégration continue et déploiement cloud haute disponibilité.',
      skills: [
        'Git / GitHub',
        'VS Code',
        'CI/CD Pipelines',
        'Déploiement web (Vercel, Netlify...)',
        'Optimisation & Performance (Lighthouse)'
      ]
    }
  ],
  en: [
    {
      id: 'frontend-creative',
      name: 'Front-End & Creative',
      tag: 'Core Technologies',
      description: 'Responsive UI engineering, fluid motion, and interactive 3D spatial scenes.',
      skills: [
        'React',
        'Vite',
        'Tailwind CSS',
        'Three.js / React Three Fiber (R3F)',
        'HTML5 & CSS3',
        'JavaScript / TypeScript'
      ]
    },
    {
      id: 'ai-agentic',
      name: 'AI & Agentic Systems',
      tag: 'AI-Augmented Power',
      description: 'Foundation model integration, autonomous agent architectures, and augmented code flows.',
      skills: [
        'LLM Integration (Gemini, Claude)',
        'Agent Architecture',
        'AI-Assisted Prototyping',
        'AI Tooling (Claude Code, Antigravity)',
        'Prompt Engineering & Orchestration'
      ]
    },
    {
      id: 'design-prototyping',
      name: 'Design & Prototyping',
      tag: 'Visual Craft',
      description: 'Art direction, user experience, scalable design systems, and high-fidelity prototypes.',
      skills: [
        'UI/UX Design',
        'Design Systems',
        'Antigravity',
        'Figma',
        'Micro-interactions',
        'Wireframing & Spec Design'
      ]
    },
    {
      id: 'workflow-deployment',
      name: 'Workflow & Deployment',
      tag: 'Production Ready',
      description: 'Modern developer tooling, continuous integration, and scalable cloud deployment.',
      skills: [
        'Git / GitHub',
        'VS Code',
        'CI/CD Pipelines',
        'Web Deployment (Vercel, Netlify...)',
        'Performance & Auditing (Lighthouse)'
      ]
    }
  ]
};

export const skillsList = [
  { name: 'React 19 / Vite', level: '96%', cat: 'Core Front-End' },
  { name: 'Three.js / R3F', level: '94%', cat: '3D Web & Shaders' },
  { name: 'Tailwind CSS', level: '98%', cat: 'UI Craft & Systems' },
  { name: 'AI Tooling & LLMs', level: '95%', cat: 'Agentic Workflows' },
  { name: 'UI/UX & Figma', level: '92%', cat: 'Product Design' },
  { name: 'TypeScript', level: '90%', cat: 'Type Safety' },
  { name: 'CI/CD & Vercel', level: '92%', cat: 'Deployment & Ops' }
];
