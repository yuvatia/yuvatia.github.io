import React, { useEffect, useReducer, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { FaPause, FaPlay, FaStop, FaSave, FaUpload, FaDownload } from "react-icons/fa";
import { FaMaximize, FaMinimize, FaMoon } from "react-icons/fa6";
import { LuClapperboard } from "react-icons/lu";

import { EngineCanvas, gDirector, gEditorSystem } from './EngineCanvas';
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

  const [maximizedState, setMaximizedState] = useState(false);

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

  const onPlay = () => {
    setBackupScene(activeScene);
    const clone = activeScene.deepCopy();
    gDirector.setActiveScene(clone);
    gDirector.setSystemState(PhysicsSystem.getName(), true);
  }

  const onStop = () => {
    gDirector.setSystemState(PhysicsSystem.getName(), false);
    gDirector.setActiveScene(backupScene);
  }

  const onPause = () => {
    gDirector.toggleSystemState(PhysicsSystem.getName());
  }

  return (
    <GlobalState.Provider value={{ activeScene, selectedEntity, saveSceneCallback, theme, setSelectedEntity, setActiveScene, setSaveSceneCallback }}>
      <EngineContext
        theme={theme}
        setTheme={setTheme}
        director={gDirector}
        activeScene={activeScene}
        backupScene={backupScene}
        maximizedState={maximizedState}
        setMaximizedState={setMaximizedState}
        selectedEntity={selectedEntity}
        onPause={onPause}
        onPlay={onPlay}
        onStop={onStop}
      />
    </GlobalState.Provider>
  );
}

export default App;
