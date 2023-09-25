import React, { useState, useEffect } from 'react';
import {
  getProvider,
  getWalletAddress,
  connectBrowserExtensionWallet,
  disconnectWallet,
} from '../libs/providers'; // Replace 'YourWalletUtils' with the actual path to your file

import Button from './Button';
import styles from './Header.module.css';

const Header = () => {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is already connected to a wallet
    const checkConnectedWallet = async () => {
      const connectedAddress = getWalletAddress();
      if (connectedAddress) {
        setAddress(connectedAddress);
      }
    };

    checkConnectedWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const connectedAddress = await connectBrowserExtensionWallet();
      if (connectedAddress) {
        setAddress(connectedAddress);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setAddress(null); // Update the UI to show "Connect wallet" after disconnection
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <header className={styles.header}>
      {address ? (
        <div className={styles.connected}>
        <div className={styles.connectContainer}>
          <p className={styles.connectBtn}>
            Connected to: {address.length > 10 ? `${address.slice(0, 10)}...` : address}
          </p>
          
          <Button onClick={handleDisconnect}>Disconnect</Button>
        </div>
      </div>
      ) : (
        <Button onClick={connectWallet}>Connect wallet</Button>
      )}
    </header>
  );
};

export default Header;
