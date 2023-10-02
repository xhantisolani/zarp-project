import React, { useState, useEffect } from 'react';
import {
  getWalletAddress,
  connectBrowserExtensionWallet,
  disconnectWallet,
} from '../libs/providers'; // Replace 'YourWalletUtils' with the actual path to your file
import { NavLink } from 'react-router-dom';
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
      <div className={styles.navigation}>
        <NavLink to="/swaptokens">SWAP</NavLink>
        <NavLink to="/transfertokens">SEND</NavLink>
      </div>
      {address ? (
        <div className={styles.connected}>
          <div className={styles.connectContainer}>
            <p className={styles.connectBtn}>
            Connected to: {address.length > 10 ? `${address.slice(0, 5)}...${address.slice(-4)}` : address}
            </p>
            <Button onClick={handleDisconnect}>Disconnect</Button>
          </div>
        </div>
      ) : (
        <Button onClick={connectWallet}>Connect wallet</Button>
      )}
    </header>
  );
  
}
export default Header;
