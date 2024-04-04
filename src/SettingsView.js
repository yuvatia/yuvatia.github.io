import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { gDirector, gEditorSystem } from './EngineCanvas';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { GenericInput } from './GenericInput';
import { Table } from 'react-bootstrap';

import Draggable from 'react-draggable';
import ModalDialog from 'react-bootstrap/ModalDialog';

import { IoSettings } from 'react-icons/io5'
import { GenericObjectForm } from './ComponentView';
import { NiceList } from './SceneView';
import { useCol } from 'react-bootstrap/esm/Col';
import { GlobalState } from './GlobalState';

export const DraggableModalDialog = (props) => {
    return (
        <Draggable handle=".modal-title"><ModalDialog {...props} />
        </Draggable>
    );
}

const SettingsView = () => {
    const { theme } = useContext(GlobalState);
    const [show, setShow] = useState(false);
    const [settings, setSettings] = useState(null);
    const [selectedSystem, setselectedSystem] = useState(null);
    const [systemStates, setSystemStates] = useState({});

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const refreshSettings = () => {
        const nextSettings = gDirector.systems.reduce((acc, system) => {
            acc[system.getName()] = { ...system.preferences } || { ...system.settings } || {};
            return acc;
        }, {});

        setSettings(nextSettings);

        setSystemStates({ ...gDirector.systemStates });
    }

    const setSettingValue = (systemName, prefName, value) => {
        gDirector.systems.forEach(system => {
            if (system.getName() === systemName) {
                const target = system.preferences || system.settings;
                target[prefName] = value;
            }
        });
        refreshSettings();
    }

    const setSystemState = (systemName, enabled) => {
        gDirector.setSystemState(systemName, enabled);
        setSystemStates({ ...gDirector.systemStates });
    }

    useEffect(() => {
        refreshSettings();
        setselectedSystem(gDirector.systems[0].getName());
    }, []);

    useEffect(() => {
        const onEngineEvent = (event) => {
            if (event.name === "onFrameStart") {
                refreshSettings();
            }
        };

        gEditorSystem.subscribe(onEngineEvent);
        return () => {
            gEditorSystem.unsubscribe(onEngineEvent);
        };
    }, []); // Empty array means this effect runs once on mount and cleanup on unmount

    return (
        settings && selectedSystem &&
        <React.Fragment>
            <IoSettings className='controlIcon' size={20} onClick={handleShow} style={{ marginLeft: '1vw' }} />
            <Modal data-bs-theme={theme} dialogAs={DraggableModalDialog} show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <Col xs={4} style={{
                                "border-right": "1px solid var(--border-bg)"
                            }}>
                                <NiceList values={Object.keys(settings)} selectedValue={selectedSystem} doDeselect={() => { }} doSetSelected={(entity) => setselectedSystem(entity)} notSearchable hoverScale={1.05}>
                                    {(setting) => setting}
                                </NiceList>
                            </Col>
                            <Col xs={8}>
                                <div>
                                    <Form.Check
                                        type="checkbox"
                                        label="Enabled"
                                        id={systemStates[selectedSystem]}
                                        checked={systemStates[selectedSystem]}
                                        onChange={({ currentTarget }) => setSystemState(selectedSystem, currentTarget.checked)}
                                        style={{ display: 'flex', flexDirection: 'row', gap: '1vw', paddingBottom: 'min(1vw, 1vh)', marginBottom: 'min(1vw, 1vh)', borderBottom: '2px solid var(--border-bg)' }}
                                    />
                                    <GenericObjectForm
                                        fields={Object.keys(settings[selectedSystem])}
                                        component={settings[selectedSystem]}
                                        UpdateField={(name, value) => setSettingValue(selectedSystem, name, value)}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}

export default SettingsView;