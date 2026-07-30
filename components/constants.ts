// components/constants.ts 

export const SURVEY_MODES = {
  create: {
    name: '모드 1',
    url: 'https://ai-survey-platform-chi.vercel.app/create?lang=ko',
    path: '/create',
  },
  textCreate: {
    name: '모드 2',
    url: 'https://ai-survey-platform-chi.vercel.app/text-create?lang=ko',
    path: '/text-create',
  },
  upgrade: {
    name: '모드 3',
    url: 'https://ai-survey-platform-chi.vercel.app/upgrade?lang=ko',
    path: '/upgrade',
  },
} as const;