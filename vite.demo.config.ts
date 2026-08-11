import { defineConfig } from 'vite';

export default defineConfig({
    base: '/notificate.js/',

    build: {
        outDir: 'demo-dist',
        emptyOutDir: true,
    },
});