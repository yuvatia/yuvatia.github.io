import { useEffect, useRef, useState } from 'react';

import { FaPause, FaPlay, FaStop } from "react-icons/fa";
import { FaMaximize, FaMinimize } from "react-icons/fa6";
import { LuClapperboard } from "react-icons/lu";

import { Tab, Tabs } from 'react-bootstrap'; // Import Bootstrap components as needed

import { ComponentsView } from './ComponentsView';
import { EditorSystem, EngineCanvas } from './EngineCanvas';
import { GlobalState } from './GlobalState';
import HelpModal from './HelpModal';
import SceneManager from './SceneManager';
import { SceneView } from './SceneView';
import SettingsView from './SettingsView';
import { PhysicsSystem } from './engine/src/physics';

const EngineContext = ({
    id,
    theme,
    setTheme,
    scene,
    autoplay,
    style,
    hideMenu,
    maximized }) => {
    const gridContainerRef = useRef(null);

    const [activeScene, setActiveScene] = useState(scene);

    const [editor] = useState(new EditorSystem());

    const [maximizedState, setMaximizedState] = useState(maximized || false);
    const [backupScene, setBackupScene] = useState(null);
    const [director, setDirector] = useState(null);
    const [selectedEntity, setSelectedEntity] = useState(-1);
    const [saveSceneCallback, setSaveSceneCallback] = useState({ callback: () => { } });

    // Subscribe to frame event to refresh entire state?
    // this is a hammer
    useEffect(() => {
        const onEngineEvent = (event) => {
            if (event.name === "onFrameStart") {
                if (activeScene === null || activeScene === undefined) {
                    setActiveScene(event.data[0]);
                }
            }
            if (event.name === "onSetActiveScene") {
                setActiveScene(event.data[0]);
            }
        }

        editor.subscribe(onEngineEvent);
        return () => {
            editor.unsubscribe(onEngineEvent);
        };
    }, [editor]); // Empty array means this effect runs once on mount and cleanup on unmount

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

    useEffect(() => {
        if(!activeScene) return;
        // TODO: hack needed to make sure director is initialized
        if (director && activeScene) {
            onPlay();
            if (!autoplay) {
                director.setSystemState(PhysicsSystem.getName(), false);
            }
        }
    }, [director])

    return (
        <GlobalState.Provider value={{ theme, activeScene, editorSystem: editor }}>
            <div className="grid-wrapper" style={{ ...style }} data-bs-theme={theme || 'light'}>
                <div className={`grid-container ${maximizedState ? 'maximized' : ''} ${hideMenu ? 'hidden-menu' : ''}`} ref={gridContainerRef}>
                    <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} hidden={hideMenu}>
                        <HelpModal theme={theme} />
                        {director ? <SettingsView editor={editor} theme={theme} director={director} /> : null}
                        {activeScene ? (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw', alignItems: 'center', flex: 1 }}>
                                {director && director.getSystemState(PhysicsSystem.getName()) ?
                                    <FaPause onClick={onPause} size={20} className='controlIcon' /> :
                                    <FaPlay onClick={onPlay} size={20} className='controlIcon' />}
                                {backupScene ? (<FaStop size={20} onClick={onStop} className='controlIcon' />) : (<FaStop size={20} className='controlIcon' />)}
                                {
                                    maximizedState ? <FaMinimize className='controlIcon' size={20} onClick={() => {
                                        setMaximizedState(!maximizedState);
                                    }} /> : <FaMaximize className='controlIcon' size={20} onClick={() => {
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
                        {director && activeScene && !maximizedState ? (
                            <Tabs defaultActiveKey="sceneView" style={{ display: 'grid', justifyItems: 'space-evenly', gridTemplateColumns: '1fr 1fr' }}>
                                <Tab eventKey="sceneView" title={<div className='tabEntry'><i className="bi bi-box controlIcon" />{activeScene.name}</div>}>
                                    <SceneView editor={editor} saveSceneCallback={saveSceneCallback} renderer={director.renderer} scene={activeScene} selectedEntity={selectedEntity} setSelectedEntity={setSelectedEntity} />
                                </Tab>
                                <Tab eventKey="sceneManager" title={<div className='tabEntry'><LuClapperboard size={20} className='controlIcon' />Manage</div>}>
                                    <SceneManager activeScene={activeScene} initialScenes={[scene]} theme={theme} setSaveSceneCallback={setSaveSceneCallback} director={director} />
                                </Tab>
                            </Tabs>
                        ) : <div>Loading</div>}
                    </div>
                    <div className="middle">
                        <EngineCanvas director={director} editor={editor} setDirector={setDirector} id={id}></EngineCanvas>
                    </div>
                    <div className="right">
                        {activeScene && activeScene.isEntityValid(selectedEntity) && !maximizedState ?
                            <ComponentsView editor={editor} activeScene={activeScene} entity={selectedEntity} />
                            :
                            null
                        }
                    </div>
                </div>
            </div>
        </GlobalState.Provider>
    );
}

export default EngineContext;
