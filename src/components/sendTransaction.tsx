import { useState } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, Tokens } from '../libs/constants';// Import the Token type from Uniswap or a similar library
import { Token} from '@uniswap/sdk-core';
import { getProvider, getWalletAddress, sendTransaction } from '../libs/providers';
import styles from './swapToken.module.css';
import ErrorModal from './ErrorModal';
import { convertAmount } from '../libs/conversion';
import { getCurrencyBalance } from '../libs/wallet';

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
      const provider = getProvider();
  
      if (provider) {
        const address = getWalletAddress();
        const user = address as string;
        // user wallet address
        
        setTokenInBalance(await getCurrencyBalance(provider, user, selectedToken));
        // Convert the balance to a string
      } else {
        // Handle the case where getProvider() returns null
        openErrorModal('Error connecting to Ethereum provider');
      }
    } catch (error) {
      openErrorModal('Error fetching wallet balance');
      return; // Return null to indicate an error
    }
  }
  

  

  async function getGasEstimate(token: Token, amount: string, recipientAddress: string) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
   if (!isValidEthereumAddress(recipientAddress))
   {
    openErrorModal('Enter valid Recipient Address ');
   }
   if (provider) {
    // Determine if the token is an ERC20 token.
    if (token.symbol === 'ENS') {
      try {
        // Convert the amount to Wei
        const amountInWei = ethers.utils.parseEther(amount);
    
        // Get the estimated gas cost for sending Ethereum
        const gasEstimate = await provider.estimateGas({
          to: recipientAddress,
          value: amountInWei
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
        return; // Return null to indicate an error
      }
    }
     else {
      try{
       // Create an instance of the ERC20 contract
       const erc20Contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      // The token is an ERC20 token.
      const gasEstimate = await erc20Contract.estimateGas.transfer(
        recipientAddress, 
        amount, token.decimals,
        signer
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
        return; // Return null to indicate an error
      }
      
    }
  } else {
    // Handle the case where getProvider() returns null
    openErrorModal('Error connecting to Ethereum provider');
  }
  }




  const handleSendTransaction = async () => {
    if (!isValidEthereumAddress(to) || !selectedToken || !tokenInBalance) {
      openErrorModal('Invalid input or token selection');
      return; // Exit the function here
    }
  
    // This condition checks if the amount is less than or equal to 0 or if it's greater than the balance.
    // If either condition is true, it will trigger the "Invalid amount or insufficient balance" error.
    if (Number(amount) <= 0) {
      openErrorModal('Amount must be greater than 0');
      return; // Exit the function here
    } else if (Number(amount) > Number(tokenInBalance)) {
      openErrorModal('Insufficient balance');
      return; // Exit the function here
    }
  
    setIsLoading(true);
  
    try {
      // Connect to your Ethereum provider here
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const signer = provider.getSigner();
  
      let tx;
      if (selectedToken.name === 'Ethereum Name Service') {
        // Send Ether transaction
  
        // Convert the amount to Wei
        const amountInWei = ethers.utils.parseEther(amount);
  
        const transactionRequest = {
          to: to, // recipient's Ethereum address
          value: amountInWei, // amount to send in Ether
        };
  
        tx = await signer.sendTransaction(transactionRequest);
        await tx.wait(); // Wait for confirmation
  
      } else {
        // Send token transaction
        const tokenContract = new ethers.Contract(
          selectedToken.address,
          ERC20_ABI,
          signer
        );
  
        // Convert the amount to the appropriate token units (e.g., wei for ERC-20 with 18 decimals)
        const amountInTokenUnits = ethers.utils.parseUnits(
          amount,
          selectedToken.decimals
        );
  
        tx = await tokenContract.transfer(to, amountInTokenUnits);
        await tx.wait(); // Wait for confirmation
      }
  
      setIsSuccess(true);
  
      setTransactionHash(tx.hash);
    } catch (error) {
      openErrorModal(`Transaction Failed`);
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
        onChange={(e) => {setTo(e.target.value);
        setTransactionHash('');}}
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
        setTransactionHash('');
        getGasEstimate(selectedToken as Token, e.target.value, to);}}
        placeholder="0.00"
        value={amount}
        type="number" // Set the input type to "number"
        disabled={!isValidEthereumAddress(to) || !selectedToken}
        title={!isValidEthereumAddress(to) ? "Enter valid address" : ""}/>

 
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

      {transactionHash && (
        <div className={styles.label}>
              Successfully sent {amount} {selectedToken?.name} to Address:
              <div>{to} </div>
          <div>
           <a href={`https://goerli.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">  View on Etherscan </a>
         </div>
        </div> )}

       {/* Render the ErrorModal component */}
       <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} error={error} />
      </div>
    </form>
    </>
  );
}

 export default SendTransaction;

