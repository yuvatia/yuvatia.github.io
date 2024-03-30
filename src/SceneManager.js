import React, { useContext, useEffect, useState } from 'react';
import { Button, Modal, Table, Form, Container, Row, Col } from 'react-bootstrap';
import { LuClapperboard } from 'react-icons/lu';
import { GlobalState } from './GlobalState';
import { Reviever } from './engine/src/reviver';
import { NiceList } from './SceneView';

const SceneManager = () => {
    const [show, setShow] = useState(false);

    const [availableScenes, setAvailableScenes] = useState(() => {
        // Load scenes from local storage
        const scenes = localStorage.getItem('scenes');
        return scenes ? JSON.parse(scenes, Reviever.parse) : { version: 1, scenes: [] };
    });

    const { activeScene, setActiveScene } = useContext(GlobalState);

    useEffect(() => {
        // Save to localStorage whenever availableScenes changes
        localStorage.setItem('availableScenes', JSON.stringify(availableScenes));
    }, [availableScenes]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSave = () => {/* Save logic here */ };
    const handleLoad = () => {/* Load logic here */ };

    return (
        <>
            <LuClapperboard size={20} className='controlIcon' onClick={handleShow} />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Scene Manager</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NiceList
                        values={[1, 2, 3, 4]}
                        selectedValue={2}
                        doSetSelected={() => { }}
                        doDeselect={() => { }}
                        doRemove={() => { }}
                        doClone={() => { }}
                        doClear={() => { }}
                        doAdd={() => { }}>
                        {(value) => value}
                    </NiceList>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default SceneManager;