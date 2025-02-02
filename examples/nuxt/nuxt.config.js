/*
 * Copyright 2020-2021 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const ARG_PORT = '--port';
const port = process.argv.find((arg) => arg.startsWith(`${ARG_PORT}=`));

module.exports = {
  head: {
    title: 'brXM + Nuxt.js = ♥️',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
      {
        rel: 'stylesheet',
        href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css',
        integrity: 'sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk',
        crossorigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css',
      },
    ],
    script: [
      {
        src: 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js',
      },
    ],
  },
  env: {
    VUE_APP_CMS_BASE_URL: process.env.VUE_APP_CMS_BASE_URL,
    NUXT_APP_BR_MULTI_TENANT_SUPPORT: process.env.NUXT_APP_BR_MULTI_TENANT_SUPPORT,
    VUE_APP_BRXM_ENDPOINT: process.env.VUE_APP_BRXM_ENDPOINT,
    BASE_URL: process.env.BASE_URL,
    NUXT_APP_EXPONEA_PROJECT_TOKEN: process.env.NUXT_APP_EXPONEA_PROJECT_TOKEN,
    NUXT_APP_EXPONEA_API_URL: process.env.NUXT_APP_EXPONEA_API_URL,
  },
  loading: { color: '#fff' },
  buildModules: ['@nuxt/typescript-build'],
  modules: ['@nuxtjs/axios', '@nuxtjs/dotenv'],
  plugins: ['~/plugins/brxm'],
  server: {
    port: port && port.substring(ARG_PORT.length + 1),
  },
  serverMiddleware: ['@bloomreach/spa-sdk/lib/express/relevance'],
  typescript: {
    typeCheck: false,
  },
  telemetry: false,
  build: {
    babel: {
      presets({ isServer }) {
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 },
              loose: true,
            },
          ],
        ];
      },
    },
  },
};
