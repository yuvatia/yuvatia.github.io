import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import mdx from 'vite-plugin-mdx';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        plugins: [
            react(),
            // mdx({
            //     include: /\.mdx?$/, // Include both .md and .mdx files
            // }),
        ],
    };
});
