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
import { IoAddCircle, IoTrashBin } from 'react-icons/io5';
import { FaUpload } from 'react-icons/fa';
import { DownloadScene, UploadScene } from './SceneUtils';
import { Rigidbody } from './engine/src/kinematics';
import { DCELRepresentation } from './engine/src/halfmesh';
import { Transform } from './engine/src/transform';
import { Cube } from './engine/src/geometry';
import { Material, MeshFilter, MeshRenderer } from './engine/src/components';
import { Point, Vector } from './engine/src/math';

const CreateDefaultScenes = () => {
    /*
    DEMO LIST:
    0. Rotation Box
    1. 2 Collision Demos
    2. Follow Constraint demo
    */
    const scenes = [new Scene('Collision Demo 1'), new Scene('Scene 2')];
    setupScene(scenes[0], 4, 512, 512, false);

    const scene = scenes[1];

    scene.name = 'Rotating Cube';
    const box = scene.newEntity('Box');
    const BoxDCEL = DCELRepresentation.fromSimpleMesh(new Cube());
    const realT = scene.getComponent(box, Transform);
    realT.scale = new Vector(100, 100, 100);
    scene.addComponent(box, MeshFilter).meshRef = BoxDCEL;
    scene.addComponent(box, Material).diffuse = new Point(255, 70, 0, 1); // Red
    scene.addComponent(box, MeshRenderer).shading = false;
    const rbody = scene.addComponent(box, Rigidbody);
    rbody.angularVelocity.y = 0.1;
    rbody.angularDamping = 1;

    return scenes;
}

const SupportedVersion = 1;
const SceneStorageKey = 'AvailableScenes';

const SceneManager = () => {
    const [show, setShow] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [pendingScene, setPendingScene] = useState(null);

    const [availableScenes, setAvailableScenes] = useState(() => {
        // Load scenes from local storage
        let scenes = null;
        try {
            scenes = JSON.parse(localStorage.getItem(SceneStorageKey), Reviver.parse);
        } catch (e) { }
        const hasSavedState = false && scenes && scenes.scenes && scenes.version === SupportedVersion;
        return hasSavedState ? scenes.scenes : CreateDefaultScenes();
    });

    const { activeScene, setActiveScene } = useContext(GlobalState);

    useEffect(() => {
        // Save to localStorage whenever availableScenes changes
        const info = { version: SupportedVersion, scenes: availableScenes };
        localStorage.setItem(SceneStorageKey, JSON.stringify(info));
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
            <div className='ListHeader' onClick={handleShow}>
                <LuClapperboard size={20} className='controlIcon' onClick={handleShow} />
                {activeScene && <b>{activeScene.name}</b>}
            </div>
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
                        selectedValue={activeScene}
                        selectedClass='selectedScene'
                        doSetSelected={() => { }}
                        doDeselect={() => { }}
                        actions={[
                            { className: 'bi-trash-fill', onClick: (scene) => { setAvailableScenes(availableScenes.filter(v => v != scene)) }, color: 'red' },
                            { className: 'bi-copy', onClick: (scene) => { setAvailableScenes([...availableScenes, scene.deepCopy()]) }, color: 'blue' },
                            {
                                className: 'bi-power', onClick: (scene) => {
                                    setPendingScene(scene);
                                    setShowConfirmationDialog(true);
                                }, color: 'black'
                            },
                            { className: 'bi-save', onClick: DownloadScene }
                        ]}
                        bottomMenu={[
                            { AsIcon: IoAddCircle, onClick: () => { setAvailableScenes([...availableScenes, new Scene('Untitled ')]) }, color: 'green' },
                            {
                                AsIcon: FaUpload, onClick: async () => {
                                    try {
                                        const scene = await UploadScene();
                                        setAvailableScenes([...availableScenes, scene]);
                                        // The promise was resolved, continue with your code here
                                    } catch (error) {
                                        // The promise was rejected, handle the error here
                                        console.error('Failed to upload scene:', error);
                                        // Continue silently
                                    }
                                }, className: 'controlIcon'
                            }
                        ]}
                    >
                        {(scene) =>
                            <>
                                <input
                                    class="form-control"
                                    style={{
                                        display: 'inline', width: 'auto',
                                        backgroundColor: (activeScene === scene) ? 'lightblue' : 'white'
                                    }}
                                    type="text"
                                    value={scene.name}
                                    onChange={(e) => doRename(scene, e.target.value)}
                                />
                            </>
                        }
                    </NiceList>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SceneManager;