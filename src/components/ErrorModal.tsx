import React from 'react';
import Modal, {Styles} from 'react-modal';
import styles from './ErrorModal.module.css';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string | null;
}

Modal.setAppElement('#root'); // Set the root element for the modal

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, error }) => {
  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', /* Semi-transparent black background */
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000, /* Ensure the modal is on top of everything */
    },
    content: {
      backgroundColor: '#fff', /* White background for modal content */
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.9)', /* Add a subtle shadow */
      padding: '20px',
      maxWidth: '80%', /* Adjust as needed */
      width: '300px', /* Adjust as needed */
      textAlign: 'center',
      position: 'relative',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Error Modal"
    > 
    <div className={styles['body']} >
      <h2>Error</h2>
      <p>{error}</p>
    </div>     
      <button className={styles['modal-close-button']} onClick={onClose}>
        Close
      </button>
    </Modal>
  );
};

export default ErrorModal;
