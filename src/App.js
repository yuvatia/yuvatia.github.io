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


export const GetActiveScene = () => {
  return gEditorSystem.scene;
}

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
      <div id="grid-wrapper" data-bs-theme={theme || 'light'}>
        <div className="grid-container" id="grid-container">
          <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <HelpModal />
            {gDirector ? <SettingsView /> : null}
            {activeScene ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw', alignItems: 'center', flex: 1 }}>
                {gDirector && gDirector.getSystemState(PhysicsSystem.getName()) ?
                  <FaPause onClick={onPause} size={20} className='controlIcon' /> :
                  <FaPlay onClick={onPlay} size={20} className='controlIcon' />}
                {backupScene ? (<FaStop size={20} onClick={onStop} className='controlIcon' />) : (<FaStop size={20} className='controlIcon' />)}
                {
                  maximizedState ? <FaMinimize className='controlIcon' size={20} onClick={() => {
                    document.getElementById('grid-container').classList.toggle('maximized');
                    setMaximizedState(!maximizedState);
                  }} /> : <FaMaximize className='controlIcon' size={20} onClick={() => {
                    document.getElementById('grid-container').classList.toggle('maximized');
                    setMaximizedState(!maximizedState);
                  }} />
                }
              </div>
            ) : null}
            <i className="bi bi-moon-fill theme-toggle"
              id="theme-toggle"
              style={{ marginRight: '1vw', fontSize: '20px' }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          </div>
          <div className="left" id="left">
            {activeScene && !maximizedState ? (
              <Tabs defaultActiveKey="sceneView" id="uncontrolled-tab-example" style={{ display: 'grid', justifyItems: 'space-evenly', gridTemplateColumns: '1fr 1fr' }}>
                <Tab eventKey="sceneView" title={<div className='tabEntry'><i class="bi bi-box controlIcon" />{GetActiveScene().name}</div>}>
                  <SceneView />
                </Tab>
                <Tab eventKey="sceneManager" title={<div className='tabEntry'><LuClapperboard size={20} className='controlIcon' />Manage</div>}>
                  <SceneManager />
                </Tab>
              </Tabs>
            ) : <div>Loading</div>}
          </div>
          <div className="middle" id="middle">
            <EngineCanvas></EngineCanvas>
          </div>
          <div className="right" id="right">
            {activeScene && activeScene.isEntityValid(selectedEntity) && !maximizedState ?
              <ComponentsView activeScene={activeScene} entity={selectedEntity} />
              :
              null
            }
          </div>
        </div>
      </div>
    </GlobalState.Provider>
  );
}

export default App;
