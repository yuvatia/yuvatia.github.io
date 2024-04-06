import { useState, useRef } from 'react';

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

const EngineContext = ({
    id,
    theme,
    setTheme,
    activeScene,
    backupScene,
    setBackupScene,
    selectedEntity }) => {
    const gridContainerRef = useRef(null);
    const [maximizedState, setMaximizedState] = useState(false);
    const [director, setDirector] = useState(null);

    const onPlay = () => {
        setBackupScene(activeScene);
        const clone = activeScene.deepCopy();
        director.setActiveScene(clone);
        director.setSystemState(PhysicsSystem.getName(), true);
    }
    const onStop = () => {
        director.setSystemState(PhysicsSystem.getName(), false);
        director.setActiveScene(backupScene);
    }

    const onPause = () => {
        director.toggleSystemState(PhysicsSystem.getName());
    }
    return (
        <div className="grid-wrapper" data-bs-theme={theme || 'light'}>
            <div className="grid-container" ref={gridContainerRef}>
                <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <HelpModal />
                    {director ? <SettingsView director={director} /> : null}
                    {activeScene ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw', alignItems: 'center', flex: 1 }}>
                            {director && director.getSystemState(PhysicsSystem.getName()) ?
                                <FaPause onClick={onPause} size={20} className='controlIcon' /> :
                                <FaPlay onClick={onPlay} size={20} className='controlIcon' />}
                            {backupScene ? (<FaStop size={20} onClick={onStop} className='controlIcon' />) : (<FaStop size={20} className='controlIcon' />)}
                            {
                                maximizedState ? <FaMinimize className='controlIcon' size={20} onClick={() => {
                                    gridContainerRef.current.classList.toggle('maximized');
                                    setMaximizedState(!maximizedState);
                                }} /> : <FaMaximize className='controlIcon' size={20} onClick={() => {
                                    gridContainerRef.current.classList.toggle('maximized');
                                    setMaximizedState(!maximizedState);
                                }} />
                            }
                        </div>
                    ) : null}
                    <i className="bi bi-moon-fill theme-toggle"
                        style={{ marginRight: '1vw', fontSize: '20px' }}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                </div>
                <div className="left">
                    {activeScene && !maximizedState ? (
                        <Tabs defaultActiveKey="sceneView" style={{ display: 'grid', justifyItems: 'space-evenly', gridTemplateColumns: '1fr 1fr' }}>
                            <Tab eventKey="sceneView" title={<div className='tabEntry'><i class="bi bi-box controlIcon" />{activeScene.name}</div>}>
                                <SceneView renderer={director.renderer} scene={activeScene} />
                            </Tab>
                            <Tab eventKey="sceneManager" title={<div className='tabEntry'><LuClapperboard size={20} className='controlIcon' />Manage</div>}>
                                <SceneManager director={director} />
                            </Tab>
                        </Tabs>
                    ) : <div>Loading</div>}
                </div>
                <div className="middle" id="middle">
                    <EngineCanvas director={director} setDirector={setDirector} id={id}></EngineCanvas>
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

export default EngineContext;
