import { Modal } from 'react-bootstrap';
import { CheckCircleFill, ExclamationTriangleFill, XCircleFill } from 'react-bootstrap-icons';

const ConfirmationDialog = ({ theme, title, children, onAccept, onDecline, ...props }) => {
    return (
        <Modal data-bs-theme={theme} {...props} centered style={{ background: 'none', border: 'none' }}>
            <Modal.Body style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ExclamationTriangleFill size={80} style={{ color: '#dc3545' }} />
                </div>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h4>
                    <p>{children}</p>
                </div>
            </Modal.Body>
            <Modal.Footer style={{ justifyContent: 'center' }}>
                <CheckCircleFill className="icon-accept" size={40} onClick={onAccept} style={{ color: 'green', cursor: 'pointer' }} />
                <XCircleFill className="icon-decline" size={40} onClick={onDecline} style={{ color: 'red', cursor: 'pointer', marginRight: '1rem' }} />
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationDialog;