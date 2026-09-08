import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  // A4 size: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Background white
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1),
  });

  const cBlack = rgb(0.04, 0.04, 0.05);
  const cDark = rgb(0.1, 0.1, 0.12);
  const cGray = rgb(0.45, 0.45, 0.48);
  const cLightGray = rgb(0.7, 0.7, 0.75);

  // Helper text wrapping
  function drawWrapped(text, x, y, maxW, fontSize, font, color, lineSpacing) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (let i = 0; i < words.length; i++) {
      const test = line + (line ? ' ' : '') + words[i];
      if (font.widthOfTextAtSize(test, fontSize) > maxW && line !== '') {
        page.drawText(line, { x, y: curY, size: fontSize, font, color });
        line = words[i];
        curY -= lineSpacing;
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x, y: curY, size: fontSize, font, color });
      curY -= lineSpacing;
    }
    return curY;
  }

  // 1. TOP BLACK BANNER (Height: 140pt)
  const bannerH = 135;
  page.drawRectangle({
    x: 0,
    y: height - bannerH,
    width,
    height: bannerH,
    color: cBlack,
  });

  // Name & Title
  page.drawText('Eliot Hantute', {
    x: 35,
    y: height - 42,
    size: 26,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('/', {
    x: 215,
    y: height - 40,
    size: 20,
    font: fontHelvetica,
    color: rgb(0.6, 0.6, 0.65),
  });

  page.drawText('Développeur Front-End', {
    x: 232,
    y: height - 34,
    size: 13,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('CREATIVE DEVELOPER', {
    x: 232,
    y: height - 46,
    size: 7.5,
    font: fontCourier,
    color: rgb(0.6, 0.6, 0.65),
  });

  // Banner Bio text
  const bio = "Développeur front-end, musicien et cuistot pro, j'applique la même exigence au code qu'à une partition ou une recette : sens du rythme, dosage des composants et exécution millimétrée. Spécialisé en React, TypeScript et Three.js, je conçois des interfaces modulaires et des expériences immersives où fluidité visuelle et rigueur technique ne font qu'un.";
  drawWrapped(bio, 35, height - 76, width - 70, 8.5, fontHelvetica, rgb(0.85, 0.85, 0.88), 12.5);

  // 2. COLUMNS SETUP
  const leftColX = 35;
  const leftColW = 120;
  const rightColX = 175;
  const rightColW = width - rightColX - 35;

  // Vertical column divider
  page.drawLine({
    start: { x: 160, y: height - bannerH },
    end: { x: 160, y: 30 },
    thickness: 1,
    color: rgb(0.1, 0.1, 0.1),
  });

  // ---------------- LEFT COLUMN ----------------
  let leftY = height - bannerH - 24;

  // Helper function for left section titles
  function drawLeftSectionTitle(title, y) {
    page.drawText(title, {
      x: leftColX,
      y,
      size: 9,
      font: fontCourier,
      color: cBlack,
    });
    page.drawLine({
      start: { x: leftColX, y: y - 5 },
      end: { x: 160, y: y - 5 },
      thickness: 1.2,
      color: cBlack,
    });
  }

  // Helper dots
  function drawDots(x, y, value, max = 5, r = 2.5, spacing = 8) {
    for (let i = 0; i < max; i++) {
      if (i < value) {
        page.drawCircle({
          x: x + i * spacing,
          y: y + 2,
          size: r,
          color: cBlack,
        });
      } else {
        page.drawCircle({
          x: x + i * spacing,
          y: y + 2,
          size: r,
          borderColor: cLightGray,
          borderWidth: 0.8,
          color: rgb(1, 1, 1),
        });
      }
    }
  }

  // CONTACT
  drawLeftSectionTitle('CONTACT', leftY);
  leftY -= 20;

  const contacts = [
    'Paris, France',
    '+33 7 75 03 68 75',
    'eliot.hantute@gmail.com',
    'eliotlab.fr',
    'github.com/eliothantute'
  ];

  for (const c of contacts) {
    page.drawText(c, {
      x: leftColX,
      y: leftY,
      size: 7.2,
      font: c.includes('@') || c.includes('.fr') || c.includes('github') ? fontHelveticaBold : fontHelvetica,
      color: cDark,
    });
    leftY -= 14;
  }

  // FORMATION
  leftY -= 15;
  drawLeftSectionTitle('FORMATION', leftY);
  leftY -= 18;

  // Formation 1
  page.drawText('En cours', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontCourier,
    color: cGray,
  });
  leftY -= 9;
  page.drawText('Product Designer', {
    x: leftColX,
    y: leftY,
    size: 7.8,
    font: fontHelveticaBold,
    color: cBlack,
  });
  leftY -= 9;
  page.drawText('RNCP Niv. 6 — Bac +3/4', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontHelvetica,
    color: cGray,
  });
  leftY -= 9;
  page.drawText('OpenClassrooms', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontHelveticaOblique,
    color: cGray,
  });
  leftY -= 16;

  // Formation 2
  page.drawText('2025', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontCourier,
    color: cGray,
  });
  leftY -= 9;
  page.drawText('BUT Info-Communication', {
    x: leftColX,
    y: leftY,
    size: 7.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  leftY -= 9;
  page.drawText('Stratégie Digitale', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontHelvetica,
    color: cGray,
  });
  leftY -= 9;
  page.drawText('IUT Haguenau / Univ. Strasbourg', {
    x: leftColX,
    y: leftY,
    size: 6,
    font: fontHelveticaOblique,
    color: cGray,
  });
  leftY -= 16;

  // Formation 3
  page.drawText('2015', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontCourier,
    color: cGray,
  });
  leftY -= 9;
  page.drawText('Bac STD2A', {
    x: leftColX,
    y: leftY,
    size: 7.8,
    font: fontHelveticaBold,
    color: cBlack,
  });
  leftY -= 9;
  page.drawText('Design & Arts Appliqués', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontHelvetica,
    color: cGray,
  });
  leftY -= 9;
  page.drawText('Paris 6e', {
    x: leftColX,
    y: leftY,
    size: 6.5,
    font: fontHelveticaOblique,
    color: cGray,
  });
  leftY -= 20;

  // LANGUES
  drawLeftSectionTitle('LANGUES', leftY);
  leftY -= 18;

  const langs = [
    { name: 'Français', level: 'Natif', dots: 5 },
    { name: 'Anglais', level: 'C1', dots: 4 },
    { name: 'Italien', level: 'A2', dots: 2 },
  ];

  for (const l of langs) {
    page.drawText(l.name, {
      x: leftColX,
      y: leftY,
      size: 7.5,
      font: fontHelveticaBold,
      color: cBlack,
    });
    page.drawText(l.level, {
      x: 145 - fontHelvetica.widthOfTextAtSize(l.level, 6.5),
      y: leftY,
      size: 6.5,
      font: fontCourier,
      color: cGray,
    });
    leftY -= 7;
    drawDots(leftColX, leftY, l.dots, 5, 2.2, 7);
    leftY -= 15;
  }

  // ---------------- RIGHT COLUMN ----------------
  let rightY = height - bannerH - 24;

  // Section Header: EXPÉRIENCES PROFESSIONNELLES
  page.drawText('EXPÉRIENCES PROFESSIONNELLES', {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontCourier,
    color: cBlack,
  });
  page.drawLine({
    start: { x: rightColX, y: rightY - 5 },
    end: { x: width - 35, y: rightY - 5 },
    thickness: 1.2,
    color: cBlack,
  });
  rightY -= 22;

  // Exp 1: Développeur Front-End
  const role1X = rightColX;
  const desc1X = rightColX + 90;
  const desc1W = width - 35 - desc1X;

  page.drawText('Développeur', {
    x: role1X,
    y: rightY,
    size: 9.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  page.drawText('Front-End', {
    x: role1X,
    y: rightY - 10,
    size: 9.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  page.drawText('Freelance', {
    x: role1X,
    y: rightY - 20,
    size: 7.2,
    font: fontHelvetica,
    color: cGray,
  });
  page.drawText('Eliot Lab', {
    x: role1X,
    y: rightY - 29,
    size: 7.2,
    font: fontHelveticaBold,
    color: cDark,
  });
  page.drawText('2026 - Present', {
    x: role1X,
    y: rightY - 38,
    size: 6.5,
    font: fontCourier,
    color: cGray,
  });

  const bullets1 = [
    "Atelier Berger - Globe 3D interactif (Three.js, React Globe GL), rendu WebGL 60 FPS stable.",
    "Hazi App - Plateforme IA agentique, LCP < 1.2s, Lighthouse 95+, micro-animations scroll.",
    "Les Humanites - Refonte media independant, SSG/ISR Next.js, referencement maximise.",
    "Aum Paris - Showcase e-commerce luxe pixel-perfect, CLS: 0, 100% mobile-first.",
    "Nari OS - Environnement fenetre interactif, gestion d'etats avancee clavier/souris."
  ];

  let bY = rightY;
  for (const b of bullets1) {
    page.drawText('>', {
      x: desc1X,
      y: bY,
      size: 9,
      font: fontHelveticaBold,
      color: cBlack,
    });
    bY = drawWrapped(b, desc1X + 8, bY, desc1W - 10, 7.2, fontHelvetica, cDark, 9.8);
    bY -= 3.5;
  }

  rightY = bY - 8;

  // Exp 2: Integrateur Web
  page.drawText('Integrateur Web', {
    x: role1X,
    y: rightY,
    size: 9.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  page.drawText('Freelance', {
    x: role1X,
    y: rightY - 10,
    size: 7.2,
    font: fontHelvetica,
    color: cGray,
  });
  page.drawText('Missions independantes', {
    x: role1X,
    y: rightY - 19,
    size: 6.8,
    font: fontHelveticaBold,
    color: cDark,
  });
  page.drawText('2025', {
    x: role1X,
    y: rightY - 28,
    size: 6.5,
    font: fontCourier,
    color: cGray,
  });

  const bullets2 = [
    "Centre de Neuro-Pedagogie - Refonte HTML5/CSS/JS vanilla, audit perf & accessibilite.",
    "Le Comite du Souvenir Francais - Integration Figma -> code, deploiement CI/CD."
  ];

  bY = rightY;
  for (const b of bullets2) {
    page.drawText('>', {
      x: desc1X,
      y: bY,
      size: 9,
      font: fontHelveticaBold,
      color: cBlack,
    });
    bY = drawWrapped(b, desc1X + 8, bY, desc1W - 10, 7.2, fontHelvetica, cDark, 9.8);
    bY -= 3.5;
  }

  rightY = bY - 12;

  // Section: COMPÉTENCES & EXPERTISE
  page.drawLine({
    start: { x: rightColX, y: rightY },
    end: { x: width - 35, y: rightY },
    thickness: 1.2,
    color: cBlack,
  });
  rightY -= 16;
  page.drawText('COMPÉTENCES & EXPERTISE', {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontCourier,
    color: cBlack,
  });
  page.drawLine({
    start: { x: rightColX, y: rightY - 5 },
    end: { x: width - 35, y: rightY - 5 },
    thickness: 1.2,
    color: cBlack,
  });
  rightY -= 18;

  const skillsCol1 = [
    { name: 'TypeScript', dots: 5 },
    { name: 'Three.js / WebGL', dots: 4 },
    { name: 'Figma / Design', dots: 4 },
    { name: 'Git / CI/CD', dots: 4 },
    { name: 'HTML5 Sémantique', dots: 5 },
    { name: 'Framer Motion', dots: 4 },
    { name: 'Vercel / Deploy', dots: 4 },
    { name: 'GLSL Shaders', dots: 3 },
  ];

  const skillsCol2 = [
    { name: 'React / Next.js', dots: 5 },
    { name: 'CSS / Tailwind', dots: 5 },
    { name: 'GSAP / Animation', dots: 4 },
    { name: 'Performance Web', dots: 5 },
    { name: 'Vite / Webpack', dots: 4 },
    { name: 'A11y / WCAG', dots: 3 },
    { name: 'PWA', dots: 3 },
    { name: 'Atomic Design', dots: 4 },
  ];

  const skillHalfW = (width - 35 - rightColX - 20) / 2;
  const startSkY = rightY;

  skillsCol1.forEach((s, idx) => {
    const rowY = startSkY - idx * 13;
    page.drawText(s.name, {
      x: rightColX,
      y: rowY,
      size: 7.2,
      font: fontHelveticaBold,
      color: cBlack,
    });
    drawDots(rightColX + skillHalfW - 42, rowY, s.dots, 5, 2.2, 7.5);
  });

  const col2X = rightColX + skillHalfW + 20;
  skillsCol2.forEach((s, idx) => {
    const rowY = startSkY - idx * 13;
    page.drawText(s.name, {
      x: col2X,
      y: rowY,
      size: 7.2,
      font: fontHelveticaBold,
      color: cBlack,
    });
    drawDots(col2X + skillHalfW - 42, rowY, s.dots, 5, 2.2, 7.5);
  });

  // 3. BOTTOM BLACK FOOTER (Height: 25pt)
  const footerH = 24;
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: footerH,
    color: cBlack,
  });

  page.drawText('ELIOT HANTUTE — CV 2026', {
    x: 35,
    y: 8,
    size: 7.5,
    font: fontCourier,
    color: rgb(0.65, 0.65, 0.7),
  });

  const fRight = 'ELIOTLAB.FR';
  const fRightW = fontCourier.widthOfTextAtSize(fRight, 7.5);
  page.drawText(fRight, {
    x: width - 35 - fRightW,
    y: 8,
    size: 7.5,
    font: fontCourier,
    color: rgb(0.65, 0.65, 0.7),
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve(__dirname, '../public/CV_Eliot_Hantute.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF successfully generated at: ${outputPath}`);
}

generatePDF().catch(console.error);
