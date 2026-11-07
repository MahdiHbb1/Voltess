/**
 * Placeholder untuk konten yang belum final
 * Tandai dengan data-placeholder untuk mudah dicari
 */

export const PLACEHOLDERS = {
  team: {
    members: [
      {
        name: '[Nama Anggota 1]',
        role: '[Peran]',
        initials: 'A1',
      },
      {
        name: '[Nama Anggota 2]',
        role: '[Peran]',
        initials: 'A2',
      },
      {
        name: '[Nama Anggota 3]',
        role: '[Peran]',
        initials: 'A3',
      },
      {
        name: '[Nama Anggota 4]',
        role: '[Peran]',
        initials: 'A4',
      },
    ],
  },
  contact: {
    email: '[email@example.com]',
    whatsapp: '[+62xxx]',
    instagram: '[handle]',
    linkedin: '[handle]',
  },
  links: {
    tryApp: '#waitlist', // Sementara scroll ke form
    privacyPolicy: '#',
    terms: '#',
    appUrl: '[URL app]',
  },
  university: {
    name: 'Universitas Negeri Semarang',
    shortName: 'UNNES',
    team: 'Tim d1306',
  },
} as const;
