import React, { useEffect, useReducer, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { FaPause, FaPlay, FaStop, FaSave, FaUpload, FaDownload } from "react-icons/fa";
import { FaMaximize, FaMinimize, FaMoon } from "react-icons/fa6";
import { LuClapperboard } from "react-icons/lu";

import { EngineCanvas, gEditorSystem } from './EngineCanvas';
import { ComponentsView } from './ComponentsView';
import { SceneView } from './SceneView';
import SettingsView from './SettingsView';
import { GlobalState } from './GlobalState';
import { Reviver } from './engine/src/reviver';
import { Scene } from './engine/src/scene';
import { PhysicsSystem } from './engine/src/physics';
import SceneManager from './SceneManager';
import { DownloadScene, UploadScene } from './SceneUtils';
import HelpModal from './HelpModal';
import EngineContext from './EngineContext';


const App = () => {
  const [activeScene, setActiveScene] = useState(null);
  const [backupScene, setBackupScene] = useState(null);
  const [saveSceneCallback, setSaveSceneCallback] = useState({ callback: () => { } });
  const [selectedEntity, setSelectedEntity] = useState(0);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Subscribe to frame event to refresh entire state?
  // this is a hammer
  useEffect(() => {
    const onEngineEvent = (event) => {
      if (event.name === "onFrameStart") {
        if (activeScene === null) {
          setActiveScene(event.data[0]);
        }
      }
      if (event.name === "onSetActiveScene") {
        setActiveScene(event.data[0]);
      }
    }

    gEditorSystem.subscribe(onEngineEvent);
    return () => {
      gEditorSystem.unsubscribe(onEngineEvent);
    };
  }, []); // Empty array means this effect runs once on mount and cleanup on unmount

  return (
    <GlobalState.Provider value={{ activeScene, selectedEntity, saveSceneCallback, theme, setSelectedEntity, setActiveScene, setSaveSceneCallback }}>
      <EngineContext
        id='main'
        theme={theme}
        setTheme={setTheme}
        activeScene={activeScene}
        backupScene={backupScene}
        setBackupScene={setBackupScene}
        selectedEntity={selectedEntity}
      />
    </GlobalState.Provider>
  );
}

export default App;
