import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { gDirector, gEditorSystem } from './EngineCanvas';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { GenericInput } from './GenericInput';
import { Table } from 'react-bootstrap';

import Draggable from 'react-draggable';
import ModalDialog from 'react-bootstrap/ModalDialog';

import { IoSettings } from 'react-icons/io5'

const DraggableModalDialog = (props) => {
    return (
        <Draggable handle=".modal-title"><ModalDialog {...props} />
        </Draggable>
    );
}

const SettingsView = () => {
    const [show, setShow] = useState(false);
    const [settings, setSettings] = useState(null);
    const [selectedSystem, setselectedSystem] = useState(null);
    const [systemStates, setSystemStates] = useState({});

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const refreshSettings = () => {
        const nextSettings = gDirector.systems.reduce((acc, system) => {
            acc[system.constructor.name] = { ...system.preferences } || { ...system.settings } || {};
            return acc;
        }, {});

        setSettings(nextSettings);

        setSystemStates({ ...gDirector.systemStates });
    }

    const setSettingValue = (systemName, prefName, value) => {
        gDirector.systems.forEach(system => {
            if (system.constructor.name === systemName) {
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
        setselectedSystem(gDirector.systems[0].constructor.name);
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
            <IoSettings size={20} onClick={handleShow} />
            <Modal dialogAs={DraggableModalDialog} show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <Col xs={4} style={{
                                "border-right": "1px solid #dee2e6"
                            }}>
                                <Table striped bordered hover>
                                    <tbody>
                                        {Object.keys(settings).map((settingKey) => (
                                            <tr onClick={() => setselectedSystem(settingKey)}>
                                                <td>{settingKey}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Col>
                            <Col xs={8}>
                                <div>
                                    <GenericInput
                                        fieldType='Boolean'
                                        name='Enabled'
                                        value={systemStates[selectedSystem]}
                                        onChange={(key, value) => setSystemState(selectedSystem, value)} />
                                    {Object.keys(settings[selectedSystem]).map((key) => {
                                        const value = settings[selectedSystem][key];
                                        const fieldType = value.constructor.name;
                                        return (
                                            <GenericInput
                                                fieldType={fieldType}
                                                name={key}
                                                value={value}
                                                onChange={(key, value) => setSettingValue(selectedSystem, key, value)} />
                                        )
                                    })}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}

export default SettingsView;