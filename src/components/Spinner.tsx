import React from 'react';
import styles from './Spinner.module.css'; // Create a new CSS module for the new spinner

const Spinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Spinner;
