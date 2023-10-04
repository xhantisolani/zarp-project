import { useState, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { ERC20_ABI, Tokens } from '../libs/constants';// Import the Token type from Uniswap or a similar library
import { CurrentConfig } from '../config';
import { Token } from '@uniswap/sdk-core';
import { getWalletAddress } from '../libs/providers';
import styles from './swapToken.module.css';
import ErrorModal from './ErrorModal';
import { convertAmount } from '../libs/conversion';

export function SendTransaction() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [gas, setGas] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const tokenList = Tokens;
  const [error, setError] = useState<string | null>(null); // State for storing error messages
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const ERC20 = require("@uniswap/sdk-core").ERC20;
  const [tokenInBalance, setTokenInBalance] = useState<string>()
  
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

  // Load the wallet balance for the selected token
  async function fetchWalletBalance(selectedToken: Token) {
    try {
      // Connect to Ethereum provider here
      const provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);

      const address = getWalletAddress(); // user wallet address
  
      if (selectedToken.name === 'Ethereum Name Service') {
        // Fetch ETH balance
        const user = address as string;
        const ethBalance = await provider.getBalance(user);

        const ethBalanceInEther = ethers.utils.formatEther(ethBalance);

        const ethBalanceInWei = ethBalanceInEther.toString(); 
  
        // Ensure setWalletBalance receives a BigNumber or null
        setTokenInBalance(ethBalanceInWei.toString()); 
      } else {
        // Fetch the balance of the selected ERC-20 token
        const tokenContract = new ethers.Contract(
          selectedToken.address,
          ERC20_ABI,
          provider
        );
  
        const balance = await tokenContract.balanceOf(address);
        
        const balanceAmount = ethers.utils.formatEther(balance);

        setTokenInBalance(balanceAmount.toString()); // Convert the balance to a string
      }
    } catch (error) {
      openErrorModal('Error fetching wallet balance');
      return null; // Return null to indicate an error
    }
  }

  

  async function getGasEstimate(token: Token, amount: string, recipientAddress: string) {
    const provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
    
    // Determine if the token is an ERC20 token.
    if (token.symbol === 'ENS') {
      try {
        // Convert the amount to Wei
        const amountInWei = ethers.utils.parseEther(amount);
    
        // Get the estimated gas cost for sending Ethereum
        const gasEstimate = await provider.estimateGas({
          to: recipientAddress,
          value: amountInWei,
        });
    
        // Get the gas price
        const gasPrice = await provider.getGasPrice();
        
        // Calculate the total gas cost
        const gasCost = gasEstimate.mul(gasPrice);
    
        // Convert the gas cost to a string
        const gasCostString = ethers.utils.formatEther(gasCost);
    
        // Set the gas state
        setGas(gasCostString);
      } catch (error) {
        openErrorModal('Recipient Address not valid');
        return null; // Return null to indicate an error
      }
    }
     else {
      try{
       // Create an instance of the ERC20 contract
       const erc20Contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      // The token is an ERC20 token.
      const gasEstimate = await erc20Contract.estimateGas.transfer(
        recipientAddress, 
        convertAmount(amount, token),
        );
      // Get the gas price
      const gasPrice = await provider.getGasPrice();
      // Calculate the total gas cost
      const gasCost = gasEstimate.mul(gasPrice);
      // Convert the gas cost to a string
      const gasCostString = ethers.utils.formatEther(gasEstimate);
  
       setGas(gasCostString);
      } catch (error) {
        setGas('not enough liquidity')
        return null; // Return null to indicate an error
      }
      
    }
  }





  const handleSendTransaction = async () => {
    if (!isValidEthereumAddress(to) || !selectedToken || !tokenInBalance) {
      openErrorModal('Invalid input or token selection');
      return;
    }
  
    if (Number(amount) > Number(tokenInBalance)) {
      openErrorModal('Insufficient balance');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Connect to your Ethereum provider here
      const provider = new ethers.providers.JsonRpcProvider(
        CurrentConfig.rpc.mainnet
      );
      const signer = provider.getSigner();
  
      let tx;
      if (selectedToken.name === 'Ethereum Name Service') {
        // Send Ether transaction
        // Convert the amount to Wei
        const amountInWei = ethers.utils.parseEther(amount);
  
        tx = await signer.sendTransaction({
          to: to,
          value: amountInWei, // Use amountInWei instead of amount
        });
      } else {
        // Send token transaction
        const tokenContract = new ethers.Contract(
          selectedToken.address,
          ERC20_ABI,
          signer
        );
  
        // Convert the amount to the appropriate token units (e.g., wei for ERC-20 with 18 decimals)
        const amountInTokenUnits = ethers.utils.parseUnits(amount, selectedToken.decimals);
  
        tx = await tokenContract.transfer(to, amountInTokenUnits);
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
     <div className={styles.userView}>  Token: {selectedToken?.symbol}</div>
     <div className={styles.userView}>  Balance: {tokenInBalance} 
    </div>
    <div className={styles.swapCard}>
    <div>
    <p className={styles.label}> Recipient Address: </p>
    <div className={styles.formGroup}>    
      <input
        className={styles.formControl}
        aria-label="Recipient"
        onChange={(e) => setTo(e.target.value)}
        placeholder="0xA0Cf…251e"
        value={to}
      />
      </div>
      <p  className={styles.label}>Amount:</p>
      <div className={styles.formGroup}>
      <input
        className={styles.formControl}
        aria-label="Amount (ether)"
        onChange={(e) => {
        setAmount(e.target.value);
        getGasEstimate(selectedToken as Token, amount, to);
        }}
        placeholder="0.00"
        value={amount}
        disabled={!selectedToken}
        title={!selectedToken ? "Select Token" : ""}/>

      <select
        value={selectedToken ? selectedToken.address : ''}
        onChange={(e) => {
          const selectedTokenAddress = e.target.value;
          const token = tokenList.find((token) => token.address === selectedTokenAddress);          
          setSelectedToken(token);     
          fetchWalletBalance(token as Token)     
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
       </div>
       <button className={styles.button} disabled={isLoading || !isValidEthereumAddress(to) || !amount || !selectedToken || !tokenInBalance || !amount} >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
      {/* Display the gas label and value if gas is not null */}
     
      {gas != null && (  <div className={styles.label}>Gas: {gas}</div>)}

      {isSuccess && (
        <div className={styles.label}>
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