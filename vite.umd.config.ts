import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    publicDir: false,
    build: {
        outDir: 'dist',
        emptyOutDir: false,

        lib: {
            entry: resolve(__dirname, 'src/umd.ts'),
            name: 'Notificate',
            formats: ['umd'],
            fileName: () => 'notificate.umd.js',
        },

        rolldownOptions: {
            output: {
                exports: 'default',
            },
        },
    },
});