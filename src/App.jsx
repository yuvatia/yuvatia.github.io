import React, { useEffect, useState } from 'react';
import { MDXProvider } from '@mdx-js/react';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'katex/dist/katex.min.css';

import './App.css';

import EngineContext from './EngineContext';
import { Scene } from './engine/src/scene';

import Post from './posts/hello.mdx';
import MonteCarlo from './posts/Monte Carlo.mdx'

const App = () => {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <EngineContext id="engine-context" theme={theme} setTheme={setTheme}/>
      <Post components={{ EngineContext }} />
      <MonteCarlo components={{ EngineContext }} />
    </>
  );
}

export default App;
