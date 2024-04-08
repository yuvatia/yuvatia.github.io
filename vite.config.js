import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'

export default defineConfig(() => {
    return {
        base: '/gfx-editor/',
        build: {
            outDir: 'build',
        },
        plugins: [
            react(),
            mdx({
                include: /\.mdx?$/, // Include both .md and .mdx files
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex, rehypeHighlight],
            }),
        ],
    };
});
