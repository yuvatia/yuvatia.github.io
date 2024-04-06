import React, { useContext, useState } from 'react';
import { Col, Container, Modal, Row } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import { FaInfoCircle } from 'react-icons/fa';
import { GlobalState } from './GlobalState';

function HelpModal() {
    const { theme } = useContext(GlobalState);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const actions = [
        { action: 'Zoom', desktop: 'scroll', mobile: 'pinch' },
        { action: 'Select', desktop: 'ctrl + click', mobile: 'long touch' },
        { action: 'Move', desktop: 'shift + drag', mobile: 'drag with 3 fingers' },
        { action: 'Rotate', desktop: 'alt + drag', mobile: 'drag with 1 finger' },
    ];

    return (
        <>
            <FaInfoCircle onClick={handleShow} size={20} className='controlIcon' style={{ marginLeft: '1vw' }} />
            <Modal show={show} data-bs-theme={theme} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Controls</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {actions.map((action, index) => (
                        <Container key={index} className="my-3">
                            <Row className="justify-content-center">
                                <Col xs={6} md={6} className="text-center">
                                    <strong>{action.action}</strong>
                                </Col>
                                <Col xs={6} md={6} className="text-center">
                                    {isMobile ? action.mobile : action.desktop}
                                </Col>
                            </Row>
                            {index < actions.length - 1 && <hr />}
                        </Container>
                    ))}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default HelpModal;