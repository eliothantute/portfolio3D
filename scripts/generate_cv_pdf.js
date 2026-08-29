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

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1),
  });

  const marginX = 40;
  const colDividerX = 205;
  const rightColX = 225;
  const rightColWidth = width - rightColX - marginX;

  // Dark header block for left column
  const cBlack = rgb(0.08, 0.08, 0.1);
  const cGray = rgb(0.45, 0.45, 0.5);
  const cLightGray = rgb(0.92, 0.93, 0.96);
  const cBorder = rgb(0.85, 0.88, 0.92);
  const cDarkBlue = rgb(0.12, 0.18, 0.32);

  // LEFT COLUMN
  let leftY = height - 50;

  // Header Left
  page.drawText('ELIOT', {
    x: marginX,
    y: leftY,
    size: 24,
    font: fontHelveticaBold,
    color: cBlack,
  });
  leftY -= 24;
  page.drawText('HANTUTE', {
    x: marginX,
    y: leftY,
    size: 24,
    font: fontHelveticaBold,
    color: cBlack,
  });

  leftY -= 20;
  page.drawText('UI DESIGNER &', {
    x: marginX,
    y: leftY,
    size: 8.5,
    font: fontHelveticaBold,
    color: cGray,
  });
  leftY -= 11;
  page.drawText('FRONT-END DEVELOPER', {
    x: marginX,
    y: leftY,
    size: 8.5,
    font: fontHelveticaBold,
    color: cGray,
  });
  leftY -= 11;
  page.drawText('CREATIVE & AI-AUGMENTED', {
    x: marginX,
    y: leftY,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(0.3, 0.45, 0.8),
  });

  leftY -= 25;
  page.drawLine({
    start: { x: marginX, y: leftY },
    end: { x: colDividerX - 15, y: leftY },
    thickness: 0.75,
    color: cBorder,
  });

  // CONTACT
  leftY -= 18;
  page.drawText('CONTACT', {
    x: marginX,
    y: leftY,
    size: 8.5,
    font: fontHelveticaBold,
    color: cBlack,
  });

  const contactItems = [
    { label: 'Localisation', val: 'Paris, France' },
    { label: 'Email', val: 'eliot.hantute@gmail.com' },
    { label: 'Tel', val: '+33 7 75 03 68 75' },
    { label: 'Portfolio', val: 'eliotlab.fr' },
  ];

  leftY -= 14;
  for (const item of contactItems) {
    page.drawText(item.val, {
      x: marginX,
      y: leftY,
      size: 7.5,
      font: fontHelvetica,
      color: cBlack,
    });
    leftY -= 12;
  }

  leftY -= 14;
  page.drawLine({
    start: { x: marginX, y: leftY },
    end: { x: colDividerX - 15, y: leftY },
    thickness: 0.75,
    color: cBorder,
  });

  // COMPETENCES
  leftY -= 18;
  page.drawText('COMPETENCES', {
    x: marginX,
    y: leftY,
    size: 8.5,
    font: fontHelveticaBold,
    color: cBlack,
  });

  const skillGroups = [
    {
      title: 'UI / UX DESIGN',
      skills: ['Figma', 'Framer', 'Prototypage', 'Design System', 'Photoshop', 'Illustrator'],
    },
    {
      title: 'DEVELOPPEMENT',
      skills: ['React', 'Next.js', 'Three.js / R3F', 'Tailwind CSS', 'TypeScript', 'HTML5 / CSS3'],
    },
    {
      title: 'IA & TOOLING',
      skills: ['Claude Code', 'Gemini LLMs', 'Antigravity', 'Agent Architecture'],
    },
    {
      title: 'SOFT SKILLS',
      skills: ['Creativite', 'Autonomie', 'Initiative', 'Travail en equipe', 'Adaptabilite'],
    },
  ];

  leftY -= 14;
  for (const group of skillGroups) {
    page.drawText(group.title, {
      x: marginX,
      y: leftY,
      size: 7.5,
      font: fontHelveticaBold,
      color: cGray,
    });
    leftY -= 12;

    let rowX = marginX;
    for (const sk of group.skills) {
      const textWidth = fontHelvetica.widthOfTextAtSize(sk, 6.8);
      const pillWidth = textWidth + 8;

      if (rowX + pillWidth > colDividerX - 15) {
        rowX = marginX;
        leftY -= 13;
      }

      page.drawRectangle({
        x: rowX,
        y: leftY - 2,
        width: pillWidth,
        height: 11,
        color: cLightGray,
        borderColor: cBorder,
        borderWidth: 0.5,
      });

      page.drawText(sk, {
        x: rowX + 4,
        y: leftY,
        size: 6.5,
        font: fontHelvetica,
        color: cBlack,
      });

      rowX += pillWidth + 3;
    }
    leftY -= 17;
  }

  leftY -= 8;
  page.drawLine({
    start: { x: marginX, y: leftY },
    end: { x: colDividerX - 15, y: leftY },
    thickness: 0.75,
    color: cBorder,
  });

  // LANGUES
  leftY -= 16;
  page.drawText('LANGUES', {
    x: marginX,
    y: leftY,
    size: 8.5,
    font: fontHelveticaBold,
    color: cBlack,
  });

  const languages = [
    { lang: 'Francais', level: 'Natif' },
    { lang: 'Anglais', level: 'Avance (C1)' },
    { lang: 'Italien', level: 'Debutant (A2)' },
  ];

  leftY -= 14;
  for (const l of languages) {
    page.drawText(l.lang, {
      x: marginX,
      y: leftY,
      size: 7.5,
      font: fontHelvetica,
      color: cBlack,
    });
    page.drawText(l.level, {
      x: colDividerX - 65,
      y: leftY,
      size: 7.5,
      font: fontHelveticaOblique,
      color: cGray,
    });
    leftY -= 12;
  }

  // Vertical separator
  page.drawLine({
    start: { x: colDividerX, y: height - 40 },
    end: { x: colDividerX, y: 40 },
    thickness: 0.8,
    color: cBorder,
  });

  // RIGHT COLUMN
  let rightY = height - 50;

  // PROFIL SECTION
  page.drawText('PROFIL', {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  rightY -= 14;

  const profileText =
    "Designer UI & developpeur front-end, je concois des interfaces sur Figma et je les developpe moi-meme avec React, Next.js et Three.js — du wireframe a la mise en production. J'aime particulierement les experiences web immersives et interactives (3D, animations, micro-interactions), et j'accorde autant d'importance a l'esthetique qu'a la robustesse technique. Autonome, curieux et a l'aise en environnement agile, je mets cette double competence design/developpement assistee par IA au service de projets ambitieux.";

  // Wrap text
  function drawWrappedText(text, x, y, maxW, fontSize, font, color, lineSpacing = 11) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? ' ' : '') + words[i];
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxW && line !== '') {
        page.drawText(line, { x, y: currentY, size: fontSize, font, color });
        line = words[i];
        currentY -= lineSpacing;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color });
      currentY -= lineSpacing;
    }
    return currentY;
  }

  rightY = drawWrappedText(profileText, rightColX, rightY, rightColWidth, 7.8, fontHelvetica, rgb(0.2, 0.2, 0.25), 11.5);

  rightY -= 14;
  page.drawLine({
    start: { x: rightColX, y: rightY },
    end: { x: width - marginX, y: rightY },
    thickness: 0.75,
    color: cBorder,
  });

  // EXPERIENCES PROFESSIONNELLES
  rightY -= 18;
  page.drawText('EXPERIENCES PROFESSIONNELLES', {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  rightY -= 15;

  const experiences = [
    {
      role: 'UI Designer & Creative Developer',
      company: "L'Atelier Berger",
      mode: 'Freelance',
      period: '2026 — Present',
      bullets: [
        "Conception et developpement d'une experience web 3D interactive pour la refonte du site vitrine.",
        'Globe 3D interactif avec navigation dynamique et animations fluides (React, Three.js).',
        'Maquettes UI/UX sur Figma, integration pixel-perfect en React & Tailwind CSS.',
      ],
    },
    {
      role: 'UI Designer & Front-End Developer',
      company: 'Ping Paris',
      mode: 'Freelance',
      period: '2026',
      bullets: [
        'Application web de geolocalisation des tables de ping-pong a Paris.',
        'UX/UI complete : wireframes, prototypes haute-fidelite sur Figma.',
        'Developpement responsive et performant avec Next.js, API meteo et Tailwind CSS.',
      ],
    },
    {
      role: 'UI Designer & Graphiste & Community Manager',
      company: 'Centre de Neuro-Pedagogie de Strasbourg',
      mode: 'Mission',
      period: '2025',
      bullets: [
        'Refonte et modernisation du site vitrine (HTML5, CSS3, JavaScript, Framer).',
        'Optimisation SEO on-page, deploiement et configuration DNS.',
      ],
    },
    {
      role: 'Web Designer',
      company: 'Le Comite du Souvenir Francais',
      mode: 'Freelance',
      period: '2025',
      bullets: [
        'Prototypes haute-fidelite sur Figma et Framer.',
        'Mise en ligne avec strategie DNS et deploiement.',
      ],
    },
  ];

  for (const exp of experiences) {
    page.drawText(exp.role, {
      x: rightColX,
      y: rightY,
      size: 8.5,
      font: fontHelveticaBold,
      color: cBlack,
    });

    const periodText = `${exp.period}`;
    const periodWidth = fontHelvetica.widthOfTextAtSize(periodText, 7.5);
    page.drawRectangle({
      x: width - marginX - periodWidth - 10,
      y: rightY - 3,
      width: periodWidth + 10,
      height: 12,
      color: cLightGray,
      borderColor: cBorder,
      borderWidth: 0.5,
    });
    page.drawText(periodText, {
      x: width - marginX - periodWidth - 5,
      y: rightY,
      size: 7,
      font: fontHelvetica,
      color: cGray,
    });

    rightY -= 11;
    page.drawText(`${exp.company}  ·  ${exp.mode}`, {
      x: rightColX,
      y: rightY,
      size: 7.5,
      font: fontHelveticaOblique,
      color: cGray,
    });

    rightY -= 11;
    for (const b of exp.bullets) {
      page.drawText('•', {
        x: rightColX + 4,
        y: rightY,
        size: 7.5,
        font: fontHelveticaBold,
        color: cDarkBlue,
      });
      rightY = drawWrappedText(b, rightColX + 12, rightY, rightColWidth - 14, 7.2, fontHelvetica, rgb(0.25, 0.25, 0.3), 9.5);
      rightY -= 1.5;
    }
    rightY -= 6;
  }

  rightY -= 4;
  page.drawLine({
    start: { x: rightColX, y: rightY },
    end: { x: width - marginX, y: rightY },
    thickness: 0.75,
    color: cBorder,
  });

  // FORMATIONS
  rightY -= 16;
  page.drawText('FORMATIONS', {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontHelveticaBold,
    color: cBlack,
  });
  rightY -= 14;

  const formations = [
    {
      title: 'PRODUCT DESIGNER',
      year: '2026',
      school: 'OpenClassrooms',
      detail: 'RNCP Niv. 6 (Bac+3/4) — En cours',
    },
    {
      title: 'BUT INFORMATION-COMMUNICATION',
      year: '2025',
      school: 'IUT Haguenau / Univ. Strasbourg',
      detail: 'Strategie de Communication Digitale',
    },
    {
      title: 'PRODUCTION SONORE & POST-PRODUCTION',
      year: '2017',
      school: 'Recording Arts of Canada — Montreal',
      detail: 'Audio Engineering & Sound Design',
    },
    {
      title: 'BACCALAUREAT STD2A',
      year: '2015',
      school: 'Paris 6e',
      detail: 'Design & Arts Appliques',
    },
  ];

  // Render formations in 2x2 grid
  const halfColWidth = (rightColWidth - 10) / 2;
  const formStartY = rightY;

  formations.forEach((f, idx) => {
    const isCol2 = idx % 2 === 1;
    const isRow2 = idx >= 2;
    const fX = isCol2 ? rightColX + halfColWidth + 10 : rightColX;
    const fY = isRow2 ? formStartY - 38 : formStartY;

    page.drawText(f.title, {
      x: fX,
      y: fY,
      size: 7.2,
      font: fontHelveticaBold,
      color: cBlack,
    });
    page.drawText(f.year, {
      x: fX + halfColWidth - 26,
      y: fY,
      size: 6.8,
      font: fontHelvetica,
      color: cGray,
    });
    page.drawText(f.school, {
      x: fX,
      y: fY - 9,
      size: 6.8,
      font: fontHelvetica,
      color: cGray,
    });
    page.drawText(f.detail, {
      x: fX,
      y: fY - 17,
      size: 6.4,
      font: fontHelveticaOblique,
      color: rgb(0.4, 0.4, 0.45),
    });
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve(__dirname, '../public/CV_Eliot_Hantute.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF successfully generated at: ${outputPath}`);
}

generatePDF().catch(console.error);
