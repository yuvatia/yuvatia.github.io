import React from 'react';

import { FaPause, FaPlay, FaStop, FaSave, FaUpload, FaDownload } from "react-icons/fa";
import { FaMaximize, FaMinimize, FaMoon } from "react-icons/fa6";
import { LuClapperboard } from "react-icons/lu";

import { Tab, Tabs } from 'react-bootstrap'; // Import Bootstrap components as needed

import { EngineCanvas } from './EngineCanvas';
import { ComponentsView } from './ComponentsView';
import { SceneView } from './SceneView';
import SettingsView from './SettingsView';
import { PhysicsSystem } from './engine/src/physics';
import SceneManager from './SceneManager';
import HelpModal from './HelpModal';

export default function EngineContext({
    theme,
    setTheme,
    director,
    activeScene,
    backupScene,
    maximizedState,
    setMaximizedState,
    selectedEntity,
    onPause,
    onPlay,
    onStop }) {
    return (
        <div id="grid-wrapper" className="grid-wrapper" data-bs-theme={theme || 'light'}>
            <div className="grid-container" id="grid-container">
                <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <HelpModal />
                    {director ? <SettingsView /> : null}
                    {activeScene ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw', alignItems: 'center', flex: 1 }}>
                            {director && director.getSystemState(PhysicsSystem.getName()) ?
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
                            <Tab eventKey="sceneView" title={<div className='tabEntry'><i class="bi bi-box controlIcon" />{activeScene.name}</div>}>
                                <SceneView scene={activeScene} />
                            </Tab>
                            <Tab eventKey="sceneManager" title={<div className='tabEntry'><LuClapperboard size={20} className='controlIcon' />Manage</div>}>
                                <SceneManager />
                            </Tab>
                        </Tabs>
                    ) : <div>Loading</div>}
                </div>
                <div className="middle" id="middle">
                    <EngineCanvas id='main'></EngineCanvas>
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
    );
}
