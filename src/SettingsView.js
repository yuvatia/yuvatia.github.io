import React, { useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

import ModalDialog from 'react-bootstrap/ModalDialog';
import Draggable from 'react-draggable';

import { IoSettings } from 'react-icons/io5';
import { GenericObjectForm } from './ComponentView';
import { NiceList } from './SceneView';

export const DraggableModalDialog = (props) => {
    return (
        <Draggable handle=".modal-title"><ModalDialog {...props} />
        </Draggable>
    );
}

const SettingsView = ({ theme, editor, director }) => {
    const [show, setShow] = useState(false);
    const [settings, setSettings] = useState(null);
    const [selectedSystem, setselectedSystem] = useState(null);
    const [systemStates, setSystemStates] = useState({});

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const refreshSettings = () => {
        const nextSettings = director.systems.reduce((acc, system) => {
            acc[system.getName()] = { ...system.preferences } || { ...system.settings } || {};
            return acc;
        }, {});

        setSettings(nextSettings);

        setSystemStates({ ...director.systemStates });
    }

    const setSettingValue = (systemName, prefName, value) => {
        director.systems.forEach(system => {
            if (system.getName() === systemName) {
                const target = system.preferences || system.settings;
                target[prefName] = value;
            }
        });
        refreshSettings();
    }

    const setVectorValue = (systeName, prefName, axis, value) => {
        director.getSystemByName(systeName).preferences[prefName][axis] = value;
        refreshSettings();
    };


    const setSystemState = (systemName, enabled) => {
        director.setSystemState(systemName, enabled);
        setSystemStates({ ...director.systemStates });
    }

    useEffect(() => {
        refreshSettings();
        setselectedSystem(director.systems[0].getName());
    }, []);

    useEffect(() => {
        const onEngineEvent = (event) => {
            if (event.name === "onFrameStart") {
                refreshSettings();
            }
        };

        editor.subscribe(onEngineEvent);
        return () => {
            editor.unsubscribe(onEngineEvent);
        };
    }, []); // Empty array means this effect runs once on mount and cleanup on unmount

    return (
        settings && selectedSystem &&
        <React.Fragment>
            <IoSettings className='controlIcon' size={20} onClick={handleShow} style={{ marginLeft: '1vw' }} />
            <Modal data-bs-theme={theme || 'light'} dialogAs={DraggableModalDialog} show={show} onHide={handleClose}>
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
                                        key={systemStates[selectedSystem]}
                                        checked={systemStates[selectedSystem]}
                                        onChange={({ currentTarget }) => setSystemState(selectedSystem, currentTarget.checked)}
                                        style={{ display: 'flex', flexDirection: 'row', gap: '1vw', paddingBottom: 'min(1vw, 1vh)', marginBottom: 'min(1vw, 1vh)', borderBottom: '2px solid var(--border-bg)' }}
                                    />
                                    <GenericObjectForm
                                        fields={Object.keys(settings[selectedSystem])}
                                        component={settings[selectedSystem]}
                                        updateVectorField={(name, axis, value) => { setVectorValue(selectedSystem, name, axis, value) }}
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