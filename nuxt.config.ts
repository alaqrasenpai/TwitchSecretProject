// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  experimental: {
    appManifest: false
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'streamarena_secret_key_twitch_interactive_2026',
    jwtExpiresIn: '7d',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'crimson_admin_2026!',
    adminName: process.env.ADMIN_NAME || 'إدارة ستريم أرينا',
    twitchClientId: process.env.TWITCH_CLIENT_ID || 'mock_twitch_client_id',
    twitchClientSecret: process.env.TWITCH_CLIENT_SECRET || 'mock_twitch_client_secret',
    twitchRedirectUri: process.env.TWITCH_REDIRECT_URI || 'http://localhost:3000/api/auth/twitch/callback',

    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      htmlAttrs: {
        dir: 'ltr',
        lang: 'en'
      },
      title: 'ChatWar // Interactive Twitch Stream Games',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ChatWar - The ultimate interactive Twitch live stream gaming platform with real-time transparent OBS overlays.' },
        { name: 'theme-color', content: '#08080a' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&family=Chakra+Petch:wght@600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap'
        }
      ]
    }
  }
})
