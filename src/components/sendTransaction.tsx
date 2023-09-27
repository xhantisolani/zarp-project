import * as React from 'react';
import { useState, useEffect } from 'react';
import { utils, ethers, BigNumber } from 'ethers';
import { Tokens } from '../libs/constants';// Import the Token type from Uniswap or a similar library
import { CurrentConfig } from '../config';
import { Token } from '@uniswap/sdk-core';
import { getWalletAddress } from '../libs/providers';
import styles from './swapToken.module.css';
import ErrorModal from './ErrorModal';

export function SendTransaction() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [walletBalance, setWalletBalance] = useState<ethers.BigNumber | null>(null);
  const tokenList = Tokens;
  const [error, setError] = useState<string | null>(null); // State for storing error messages
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Ethereum address regex pattern
  const ethereumAddressPattern = /^0x[a-fA-F0-9]{40}$/;

  // Validate Ethereum address
  const isValidEthereumAddress = (address: string) => {
    return ethereumAddressPattern.test(address);
  };
  // functions to manipulate the modal
  const openErrorModal = (errorMessage: string) => {
    setError(errorMessage);
    setIsErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setError(null);
    setIsErrorModalOpen(false);
  };
  // Validate Ether amount
  const isValidEtherAmount = (amount: string) => {
    try {
      const amountWei = utils.parseEther(amount);
      return amountWei.gt(0); // Check if the amount is greater than 0 Wei
    } catch (error) {
      return false;
    }
  };

  // Load the wallet balance for the selected token
   useEffect(() => {
        
        const fetchWalletBalance = async () => {
          if (selectedToken) {

             // Connect to your Ethereum provider here
            const provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
            const address = getWalletAddress(); // Replace with your wallet address
        
         
            const tokenContract = new ethers.Contract(
                selectedToken.address,
                [
                  {
                    constant: true, // Use "constant" for view functions (read-only)
                    inputs: [
                      {
                        name: '_owner',
                        type: 'address',
                      },
                    ],
                    name: 'balanceOf',
                    outputs: [
                      {
                        name: 'balance',
                        type: 'uint256',
                      },
                    ],
                    type: 'function',
                  },
                ],
                provider
              );
              
          
              const balance = await tokenContract.balanceOf(address);
              setWalletBalance(balance);
            
          }
        };
    
        fetchWalletBalance();
      }, [selectedToken]);
    

  const handleSendTransaction = async () => {
  if (!isValidEthereumAddress(to) || !isValidEtherAmount(amount) || !selectedToken || !walletBalance) {
    openErrorModal('Invalid input or token selection');
    return;
  }

  const amountWei = utils.parseEther(amount);

  if (amountWei.gt(walletBalance)) {
    openErrorModal('Insufficient balance');
    return;
  }

  setIsLoading(true);

  try {
    // Connect to your Ethereum provider here
    const provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
    const signer = provider.getSigner();

    let tx;
    if (selectedToken.address === '0x71C7656EC7ab88b098defB751B7401B5f6d897') {
      // Send Ether transaction
      tx = await signer.sendTransaction({
        to: to,
        value: amountWei,
      });
    } else {
      // Send token transaction
      const tokenContract = new ethers.Contract(
        selectedToken.address,
        [
          {
            constant: false, // Use "constant" for view functions (read-only)
            inputs: [
              {
                name: '_to',
                type: 'address',
              },
              {
                name: '_value',
                type: 'uint256',
              },
            ],
            name: 'transfer',
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            type: 'function',
          },
        ],
        signer
      );

      tx = await tokenContract.transfer(to, amountWei);
    }

    setIsSuccess(true);
    setTransactionHash(tx.hash);
  } catch (error) {
    openErrorModal('Error sending transaction:');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
    <div className={styles.Logo}>(ZARP)</div>

    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSendTransaction();
      }}
    >
    <div className={styles.swapCard}>
    <p className={styles.label}> Recipient Address: Available Balance: {walletBalance ? walletBalance.toString() : ''} </p>
    <div className={styles.formGroup}>    
      <input
        className={styles.formControl}
        aria-label="Recipient"
        onChange={(e) => setTo(e.target.value)}
        placeholder="0xA0Cf…251e"
        value={to}
      />
      </div>
      <p  className={styles.label}>Select Token to send:</p>
      <div className={styles.formGroup}>
      <input
        className={styles.formControl}
        aria-label="Amount (ether)"
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        value={amount}
      />
      <select
        value={selectedToken ? selectedToken.address : ''}
        onChange={(e) => {
          const selectedTokenAddress = e.target.value;
          const token = tokenList.find((token) => token.address === selectedTokenAddress);
          
          setSelectedToken(token || null);
        }}
      >
        <option value="">Select Token</option>
        {tokenList.map((token) => (
           <option key={token.address} value={token.address}>
           {token.symbol}
         </option>
        ))}
      </select>
      </div>

      <button className={styles.button} disabled={isLoading || !isValidEthereumAddress(to) || !isValidEtherAmount(amount) || !selectedToken || !walletBalance}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
      {isSuccess && (
        <div>
          Successfully sent {amount} {selectedToken?.name} {to}
          <div>
            <a href={`https://etherscan.io/tx/${transactionHash}`}>Etherscan</a>
          </div>
        </div>
      )}
       {/* Render the ErrorModal component */}
       <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} error={error} />
      </div>
    </form>
    </>
  );
}
 export default SendTransaction;