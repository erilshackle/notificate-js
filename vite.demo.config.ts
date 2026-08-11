import { defineConfig } from 'vite';

export default defineConfig({
    base: '/notificate/',

    build: {
        outDir: 'demo-dist',
        emptyOutDir: true,
    },
});