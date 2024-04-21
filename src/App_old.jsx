import React, { useEffect, useState } from 'react';
import { MDXProvider } from '@mdx-js/react';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'katex/dist/katex.min.css';

import './App.css';

import EngineContext from './EngineContext';
import { Scene } from './engine/src/scene';

// import Post from './posts/hello.mdx';
// import Post2, {frontmatter} from './posts/exponential_maps.mdx';
// import Quaternions, {frontmatter} from './posts/quaternions.mdx';
import Post, {frontmatter} from './posts/slerp_lerp_nlerp.mdx';
import MonteCarlo from './posts/Monte Carlo.mdx'

const App = () => {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const importAllPosts = async () => {
      const postsImports = import.meta.glob('./posts/*.mdx');
      const postsModules = await Promise.all(
        Object.values(postsImports).map(importFn => importFn())
      );
      const postsWithFrontmatter = postsModules.map(module => {
        return { frontmatter: module.frontmatter, Post: module.default };
      });
      setPosts(postsWithFrontmatter);
    };

    importAllPosts();
  }, []);

  return (
    <>
      {posts.map(({ Post, frontmatter }, index) => (
        <div key={index}>
          <h1>{frontmatter.title}</h1>
          <Post components={{ EngineContext }} />
        </div>
      ))}
    </>
  );
}

export default App;
