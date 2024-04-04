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
import { MeshAsset } from './engine/asset';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { ExampleScenes } from './ExampleScenes';
import { SetupSerialization } from './engine/src/Director';

const CreateDefaultScenes = () => {
    SetupSerialization();
    return JSON.parse(JSON.stringify(ExampleScenes), Reviver.parse);
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
    const realT = scene.getComponent(box, Transform);
    realT.scale = new Vector(100, 100, 100);
    // realT.rotation.x = 45;
    // realT.rotation.y = 45;
    scene.addComponent(box, MeshFilter).meshRef = MeshAsset.get('Cube');
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
    const RequestEnum = {
        DELETE_SCENE: 1,
        SET_ACTIVE_SCENE: 2
    };
    const [requestType, setRequestType] = useState(0);
    const [confirmationDialogTitle, setConfirmationDialogTitle] = useState('');
    const [confirmationDialogText, setConfirmationDialogText] = useState('');
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

    const [pendingScene, setPendingScene] = useState(null);

    const [availableScenes, setAvailableScenes] = useState(() => {
        // Load scenes from local storage
        let scenes = null;
        try {
            scenes = JSON.parse(localStorage.getItem(SceneStorageKey), Reviver.parse);
        } catch (e) { }
        const hasSavedState = scenes && scenes.scenes && scenes.version === SupportedVersion;
        return hasSavedState ? scenes.scenes : CreateDefaultScenes();
    });

    const { activeScene } = useContext(GlobalState);

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

    const doSetActiveScene = (scene) => {
        gDirector.setActiveScene(scene);
    };

    const doRename = (scene, newName) => {
        scene.name = newName;
        setAvailableScenes([...availableScenes]);
    }

    const promptDelete = (scene) => {
        if (!isRemovable(scene)) {
            return;
        }
        setPendingScene(scene);
        setRequestType(RequestEnum.DELETE_SCENE);
        setConfirmationDialogTitle('Confirm scene deletion');
        setConfirmationDialogText('All scene data will be deleted!');
        setShowConfirmationDialog(true);
    }

    const doDelete = (scene) => {
        setAvailableScenes(availableScenes.filter(v => v != scene));
    }

    const isRemovable = (scene) => {
        // In the future, make demo scenes unremovable
        return true;
    }

    return (
        <div id='SceneManager' style={{ margin: 'min(1vw, 1vh)' }}>
            <ConfirmationDialog
                // parentSelector={() => document.querySelector('#SceneManager')}
                title={confirmationDialogTitle}
                onAccept={() => {
                    switch (requestType) {
                        case RequestEnum.SET_ACTIVE_SCENE:
                            doSetActiveScene(pendingScene);
                            break;
                        case RequestEnum.DELETE_SCENE:
                            doDelete(pendingScene);
                            break;
                    }
                    setShowConfirmationDialog(false)
                }}
                onDecline={() => { setShowConfirmationDialog(false) }}
                show={showConfirmationDialog}>
                {confirmationDialogText}
            </ConfirmationDialog>
            <NiceList
                values={availableScenes}
                searchHint="Search for scene..."
                selectedValue={activeScene}
                selectedClass='selectedScene'
                selectedStyle={{ backgroundColor: 'var(--selected-item-bg)' }}
                doSetSelected={(scene) => {
                    setPendingScene(scene);
                    setRequestType(RequestEnum.SET_ACTIVE_SCENE);
                    setConfirmationDialogTitle('Confirm scene selection');
                    setConfirmationDialogText('Selecting the scene will replace the current scene!');
                    setShowConfirmationDialog(true);
                }}
                doDeselect={() => { }}
                actions={[
                    { className: 'bi-trash-fill', onClick: promptDelete, color: 'red' },
                    { className: 'bi-copy', onClick: (scene) => { setAvailableScenes([...availableScenes, scene.deepCopy()]) }, color: 'var(--bs-link-color)' },
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
                                backgroundColor: (activeScene === scene) ? 'var(--selected-item-bg)' : 'transparent'
                            }}
                            type="text"
                            value={scene.name}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            onChange={(e) => {
                                doRename(scene, e.target.value)
                            }}
                        />
                    </>
                }
            </NiceList>
        </div>
    );
}

export default SceneManager;