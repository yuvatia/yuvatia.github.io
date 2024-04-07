import React, { useEffect, useState } from 'react';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import EngineContext from './EngineContext';
import { Scene } from './engine/src/scene';


const App = () => {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <EngineContext
        id='main'
        theme={theme}
        setTheme={setTheme}
      />
      <EngineContext
        id='sub'
        theme={theme}
        setTheme={setTheme}
        scene={new Scene('Hello sub!')}
      />
    </>
  );
}

export default App;
