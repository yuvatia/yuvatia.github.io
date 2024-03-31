import React, { useContext, useEffect, useState } from 'react';
import { Button, Modal, Table, Form, Container, Row, Col, FormControl } from 'react-bootstrap';
import { LuClapperboard } from 'react-icons/lu';
import { GlobalState } from './GlobalState';
import { Reviver } from './engine/src/reviver';
import { NiceList } from './SceneView';
import { Scene } from './engine/src/scene';
import { gDirector } from './EngineCanvas';
import { setupScene } from './engine/src/script';
import { DraggableModalDialog } from './SettingsView';
import ConfirmationDialog from './ConfirmationDialog';

const CreateDefaultScenes = () => {
    const scenes = [new Scene('Demo 1'), new Scene('Scene 2')];
    setupScene(scenes[0], 4, 512, 512, false);
    scenes[1].newEntity('Hello World!');
    return scenes;
}

const SceneManager = () => {
    const [show, setShow] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [pendingScene, setPendingScene] = useState(null);

    const [availableScenes, setAvailableScenes] = useState(() => {
        // Load scenes from local storage
        let scenes = null;
        try {
            scenes = JSON.parse(localStorage.getItem('availableScenes'), Reviver.parse);
        } catch (e) { }
        const hasSavedState = false && scenes && scenes.scenes && scenes.version === 1;
        return hasSavedState ? scenes.scenes : CreateDefaultScenes();
    });

    const { activeScene, setActiveScene } = useContext(GlobalState);

    useEffect(() => {
        // Save to localStorage whenever availableScenes changes
        const info = { version: 1, scenes: availableScenes };
        localStorage.setItem('availableScenes', JSON.stringify(info));
    }, [availableScenes]);

    useEffect(() => {
        if (availableScenes.length > 0) {
            gDirector.setActiveScene(availableScenes[0]);
        }
    }, []);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSave = () => {/* Save logic here */ };
    const handleLoad = () => {/* Load logic here */ };

    const doSetActiveScene = (scene) => {
        gDirector.setActiveScene(scene);
    };

    const doRename = (scene, newName) => {
        scene.name = newName;
        setAvailableScenes([...availableScenes]);
    }

    return (
        <div id='SceneManager'>
            <LuClapperboard size={20} className='controlIcon' onClick={handleShow} />
            <ConfirmationDialog
                // parentSelector={() => document.querySelector('#SceneManager')}
                onAccept={() => {
                    doSetActiveScene(pendingScene);
                    setShowConfirmationDialog(false)
                }}
                onDecline={() => { setShowConfirmationDialog(false) }}
                show={showConfirmationDialog}>
                Selecting the scene will replace the current scene
            </ConfirmationDialog>
            <Modal dialogAs={DraggableModalDialog} show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Scene Manager</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NiceList
                        values={availableScenes}
                        iconOverrides={{ lookup: 'bi-power' }}
                        selectedValue={activeScene}
                        doSetSelected={() => { }} // we remap selection to focus
                        doDeselect={() => { }}
                        doFocus={(scene) => {
                            setPendingScene(scene);
                            setShowConfirmationDialog(true);
                        }}
                        doRemove={(scene) => { setAvailableScenes(availableScenes.filter(v => v != scene)) }}
                        doClone={(scene) => { setAvailableScenes([...availableScenes, scene.deepCopy()]) }}
                        doAdd={() => { setAvailableScenes([...availableScenes, new Scene('Untitled ')]) }}>
                        {(scene) =>
                            <input
                                class="form-control"
                                style={{ display: 'inline', width: 'auto' }}
                                type="text"
                                value={scene.name}
                                onChange={(e) => doRename(scene, e.target.value)}
                            />
                        }
                    </NiceList>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SceneManager;