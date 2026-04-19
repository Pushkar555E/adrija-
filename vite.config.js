import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        about:    resolve(__dirname, 'pages/about.html'),
        skills:   resolve(__dirname, 'pages/skills.html'),
        projects: resolve(__dirname, 'pages/projects.html'),
        lab:      resolve(__dirname, 'pages/lab.html'),
        journey:  resolve(__dirname, 'pages/journey.html'),
        contact:  resolve(__dirname, 'pages/contact.html'),
      },
    },
  },
});
