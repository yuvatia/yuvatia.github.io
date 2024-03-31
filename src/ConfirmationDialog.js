import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';


const ConfirmationDialog = ({ children, onAccept, onDecline, ...props }) => {
    return (
        <Modal {...props} centered>
            <Modal.Body className="p-0">
                <Alert variant="danger" className="m-0 d-flex flex-row" style={{ width: 'auto', gap: '0.5vw' }}>
                    <div>{children}</div>
                    <XCircleFill style={{ color: 'red', cursor: 'pointer', marginLeft: 'auto' }} size={20} onClick={onDecline} />
                    <CheckCircleFill style={{ color: 'green', cursor: 'pointer' }} size={20} onClick={onAccept} />                </Alert>
            </Modal.Body>
        </Modal >
    );
}

export default ConfirmationDialog;