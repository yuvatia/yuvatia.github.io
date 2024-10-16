import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import remarkFrontmatter from 'remark-frontmatter';
import remarkCallout from '@r4ai/remark-callout';

import withToc from "@stefanprobst/rehype-extract-toc"
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx"
import withSlugs from "rehype-slugs"
import remarkGfm from 'remark-gfm';


export default defineConfig(() => {
    return {
        base: '/',
        // base: '/gfx-editor/',
        build: {
            outDir: 'build',
        },
        plugins: [
            react(),
            mdx({
                include: /\.mdx?$/, // Include both .md and .mdx files
                remarkPlugins: [remarkMath, remarkFrontmatter, remarkCallout, remarkGfm],
                rehypePlugins: [rehypeKatex, rehypeHighlight, withSlugs, withToc, withTocExport],
            }),
        ],
        server: {
            watch: {
                usePolling: true
            }
        },
        optimizeDeps: {
            exclude: [

            ]
        }
    };
});
