import React, { useEffect, useReducer, useState } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { FaPause, FaPlay, FaStop, FaSave, FaUpload, FaDownload } from "react-icons/fa";
import { FaMaximize, FaMinimize } from "react-icons/fa6";
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


export const GetActiveScene = () => {
  return gEditorSystem.scene;
}

const App = () => {
  const [activeScene, setActiveScene] = useState(null);
  const [backupScene, setBackupScene] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(0);

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
    const clone = activeScene.deepCopy('workingScene');
    // setActiveScene(clone);
    gDirector.setActiveScene(clone);
    gDirector.setSystemState(PhysicsSystem.name, true);
  }

  const onStop = () => {
    // setActiveScene(backupScene);
    gDirector.setSystemState(PhysicsSystem.name, false);
    gDirector.setActiveScene(backupScene);
  }

  const onPause = () => {
    gDirector.toggleSystemState(PhysicsSystem.name);
  }

  return (
    <GlobalState.Provider value={{ activeScene, selectedEntity, setSelectedEntity, setActiveScene }}>
      <div id="grid-wrapper">
        <div className="grid-container" id="grid-container">
          <div className="controls">
            {activeScene ? (<>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw', alignItems: 'center', height: '100%' }}>
                <SceneManager />
                {gDirector ? <SettingsView /> : null}
                {gDirector && gDirector.getSystemState(PhysicsSystem.name) ?
                  <FaPause onClick={onPause} size={20} className='controlIcon' /> :
                  <FaPlay t onClick={onPlay} size={20} className='controlIcon' />}
                {backupScene ? (<FaStop size={20} onClick={onStop} className='controlIcon' />) : (<FaStop size={20} className='controlIcon' />)}
                <FaDownload size={20} onClick={() => DownloadScene(activeScene)} className='controlIcon' />
                <input
                  type='file'
                  id='scene_upload'
                  accept='.json'
                  onChange={UploadScene}
                  style={{ display: 'none' }} />
                <FaUpload size={20} className='controlIcon' onClick={() => { document.getElementById('scene_upload').click(); }} />
                {
                  maximizedState ? <FaMinimize className='controlIcon' size={20} onClick={() => {
                    document.getElementById('grid-container').classList.remove('maximized');
                    // Remove display changes of left, right
                    document.getElementById('left').style.display = 'block';
                    document.getElementById('right').style.display = 'block';
                    setMaximizedState(false);
                  }} /> : <FaMaximize className='controlIcon' size={20} onClick={() => {
                    document.getElementById('grid-container').classList.add('maximized');
                    // Set display of left, right to none
                    document.getElementById('left').style.display = 'none';
                    document.getElementById('right').style.display = 'none';
                    setMaximizedState(true);
                  }} />
                }
              </div>
            </>) : null}
          </div>
          <div className="left" id="left">
            {activeScene ? (<SceneView></SceneView>) : <div>Loading</div>}
          </div>
          <div className="middle" id="middle">
            <EngineCanvas></EngineCanvas>
          </div>
          <div className="right" id="right">
            {activeScene && activeScene.isEntityValid(selectedEntity) ?
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
