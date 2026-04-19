import type { Lang } from '@/contexts/lang-context';

export const content: Record<Lang, {
  role: string;
  location: string;
  tagline: string;
  about: string[];
  currentlyLabel: string;
  currentlyValue: string;
  stackLabel: string;
  stackValue: string;
  sections: {
    about: string;
    journal: string;
    lab: string;
    connect: string;
  };
  journalEmpty: {
    title: string;
    desc: string;
    cta: string;
  };
  labCaption: string;
  footer: string;
  built: string;
}> = {
  en: {
    role: 'Backend Engineer',
    location: 'Based in Indonesia',
    tagline: 'learning AI, out loud.',
    about: [
      "I'm Fahmi — a backend engineer who spends most days shipping Node.js and Java services in production.",
      "Right now I'm learning AI out loud: experimenting with LLMs, agentic workflows, and figuring out how to build useful things with them.",
      "This is where I keep my notes. A journal from the messy middle of learning something new.",
    ],
    currentlyLabel: 'Currently',
    currentlyValue: 'Learning AI + side projects',
    stackLabel: 'Stack',
    stackValue: 'Node.js · Java · Python',
    sections: {
      about: 'About',
      journal: 'Journal',
      lab: 'Lab',
      connect: 'Connect',
    },
    journalEmpty: {
      title: 'First entries coming soon.',
      desc: "Writing my first journal entries right now. Meanwhile, follow along on Instagram — that's where most of the raw thinking happens.",
      cta: 'Follow on Instagram',
    },
    labCaption: "An experiment I'm working on — using AI to summarize dev journals.",
    footer: '© 2026 Fahmi Hidayat',
    built: 'Crafted in Jakarta',
  },
  id: {
    role: 'Backend Engineer',
    location: 'Tinggal di Indonesia',
    tagline: 'belajar AI, out loud.',
    about: [
      'Gw Fahmi — backend engineer yang sehari-hari ngoprek service Node.js dan Java buat production.',
      'Sekarang lagi belajar AI out loud: eksperimen sama LLM, agentic workflow, dan cari cara bikin sesuatu yang beneran berguna pake AI.',
      'Di sini tempat gw nulis catatannya. Jurnal dari fase awal belajar sesuatu yang baru.',
    ],
    currentlyLabel: 'Sekarang',
    currentlyValue: 'Belajar AI + side project',
    stackLabel: 'Stack',
    stackValue: 'Node.js · Java · Python',
    sections: {
      about: 'Tentang',
      journal: 'Jurnal',
      lab: 'Lab',
      connect: 'Kontak',
    },
    journalEmpty: {
      title: 'Jurnal pertama segera tayang.',
      desc: 'Lagi nulis beberapa jurnal pertama. Sementara ini, ikutin di Instagram — tempat sebagian besar raw thinking-nya.',
      cta: 'Ikuti di Instagram',
    },
    labCaption: 'Salah satu eksperimen yang lagi gw kerjain — pake AI buat ngerangkum jurnal dev.',
    footer: '© 2026 Fahmi Hidayat',
    built: 'Dibuat di Jakarta',
  },
};

export const socials = [
  { name: 'Instagram', href: 'https://instagram.com/jurnal.dev' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/fahmidyt/' },
  { name: 'GitHub', href: 'https://github.com/jurnaldev' },
  { name: 'Twitter', href: 'https://twitter.com/DevJurnal' },
] as const;
