import { TransactionState, getProvider, getWalletAddress, sendTransaction } from '../libs/providers';
import { CurrentConfig, Environment } from '../config';
import { useCallback, useEffect, useState } from 'react';
import { createTrade, executeTrade, TokenTrade } from '../libs/trading';
import { ERC20_ABI, Tokens } from '../libs/constants';
import { getCurrencyBalance } from '../libs/wallet';
import { displayTrade } from '../libs/utils';
import styles from './swapToken.module.css';
import Spinner from './Spinner';
import { Token } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import ErrorModal from './ErrorModal';
//comment test 
// xhanti comment
export function SwapTokens() {

  // Create states to store selected token addresses and the amount to swap
  const [selectedTokenIn, setSelectedTokenIn] = useState<Token | null>(null);
  const [selectedTokenOut, setSelectedTokenOut] = useState<Token | null>(null);
  const [tokenInBalance, setTokenInBalance] = useState<string>()
  const [passedAmount, sePassedAmount] = useState<string>()
  const [trade, setTrade] = useState<TokenTrade>()
  const [txState, setTxState] = useState<TransactionState>()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for storing error messages
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const tokenOptions = Tokens;


// modal functions
const openErrorModal = (errorMessage: string) => {
  setError(errorMessage);
  setIsErrorModalOpen(true);
};

const closeErrorModal = () => {
  setError(null);
  setIsErrorModalOpen(false);
};

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

        setTokenInBalance( balanceAmount.toString()); // Convert the balance to a string
      }
    } catch (error) {
      openErrorModal('Error fetching wallet balance');
      return null; // Return null to indicate an error
    }
  }

  function setTokenIn(token: Token) {
    try {
          CurrentConfig.tokens.in = token;
          
    }catch (error)
    {
     openErrorModal('Error setting up CurrentConfig');
    }
 
 }
 function setTokenOut(token: Token) {
  try {
        CurrentConfig.tokens.out = token;
        
  }catch (error)
  {
   openErrorModal('Error setting up CurrentConfig');
  }

}

function setAmountIn(amount: string) {
  try {
        CurrentConfig.tokens.amountIn = Number(amount);
        sePassedAmount(amount)
        return  CurrentConfig.tokens.amountIn;
        
  }catch (error)
  {
   openErrorModal('Error setting up CurrentConfig');
  }

}


  // functions to set up the trade the tokens
  const onCreateTrade = useCallback(async () => {
    setTrade(await createTrade());
  }, []);




  const onTrade = useCallback(async (trade: TokenTrade | undefined) => {
    if (trade) {
      setIsLoading(true); // Set loading to true before executing the trade
  
      try {        
        setTxState(await executeTrade(trade));
      } catch (error) {
        openErrorModal(`Token with address ${error} not found.`);
        // Handle the error as needed
      } finally {
        setIsLoading(false); // Set loading to false when the trade operation completes
      }
    }
  }, []);
  


return (  
  <>
  <div className={styles.Logo}>(ZARP)</div>
 
  <div className={styles.swapCard}>
    
    <div>

      <div className={styles.body}>
        {CurrentConfig.env === Environment.MAINNET && getProvider() === null && (
          <h2 className="error">Please install a wallet to use this example configuration   </h2>)}
      </div>

      <p  className={styles.label}>Balance: {tokenInBalance}      Transaction State: {txState }</p>
      <div className={styles.formGroup}>
        <input
          className={styles.formControl}
          placeholder={'0.00'}
          name={"displayFirstToken"}
          value={passedAmount}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (!isNaN(Number(inputValue))) {
              setAmountIn(inputValue)
              onCreateTrade();
            } else {
              openErrorModal('Invalid input. Please enter a valid number.');
            }
          } } />
        <select
        value={selectedTokenIn ? selectedTokenIn.address : ''}
        name={"FirstToken"}
        onChange={(e) => {
          const selectedTokenAddress = e.target.value;
          const token = tokenOptions.find((token) => token.address === selectedTokenAddress);
          setSelectedTokenIn(token || null);
          // set the balence after the selected token in has been set
          fetchWalletBalance(token as Token);
          setTokenIn(token as Token);
        }}
      >
        <option value="">Token</option>
        {tokenOptions.map((token) => (
           <option key={token.address} value={token.address}>
           {token.symbol}
         </option>
        ))}
      </select>

      </div>
    </div>
    <div className={styles.formGroup}>
      <input
        className={styles.formControl}
        placeholder={'0.00'}
        name={"displaySecondToken"}
        value={trade ? ` ${displayTrade(trade)}` : ''}
        disabled />
        
        <select
        value={selectedTokenOut ? selectedTokenOut.address : ''}
        name={"SecondToken"}
        onChange={(e) => {
          const selectedTokenAddress = e.target.value;
          const token = tokenOptions.find((token) => token.address === selectedTokenAddress);          
          setSelectedTokenOut(token || null);
          setTokenOut(token as Token);
        }}
      >
        <option value="">Token</option>
        {tokenOptions.map((token) => (
           <option key={token.address} value={token.address}>
           {token.symbol}
         </option>
        ))}
      </select>
    </div>
    <button
    className={styles.button}
      onClick={() => {
        onTrade(trade);
      }}
      disabled={
        trade === undefined ||
        txState === TransactionState.Sending ||
        getProvider() === null ||
        CurrentConfig.rpc.mainnet === ''
      }
    >
      Swap
    </button>
     {isLoading && <Spinner />}
     {/* Render the ErrorModal component */}
      <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} error={error} />
  </div>
 
  </>
);

}
// Export the swapTokens function
export default SwapTokens;


