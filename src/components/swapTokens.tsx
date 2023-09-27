import { TransactionState, getProvider, getWalletAddress, sendTransaction } from '../libs/providers';
import { CurrentConfig, Environment } from '../config';
import { useCallback, useEffect, useState } from 'react';
import { createTrade, executeTrade, TokenTrade } from '../libs/trading';
import { Tokens } from '../libs/constants';
import { getCurrencyBalance } from '../libs/wallet';
import { displayTrade } from '../libs/utils';
import styles from './swapToken.module.css';
import Spinner from './Spinner';

export function SwapTokens() {

  // Create states to store selected token addresses and the amount to swap
  const [passedAmount, setPassedAmount] = useState<string>('');
  const [tokenInBalance, setTokenInBalance] = useState<string>()
  const [tokenOutBalance, setTokenOutBalance] = useState<string>()
  const [trade, setTrade] = useState<TokenTrade>()
  const [txState, setTxState] = useState<TransactionState>(TransactionState.New)
  const [isLoading, setIsLoading] = useState(false);

  //Upadate CurrentConfig
  CurrentConfig.tokens.amountIn = Number(passedAmount);
  const address = getWalletAddress();
  CurrentConfig.wallet.address = address as string;

  // set the selected Token
  const [selectedTokenIn, setSelectedTokenIn] = useState<string>(
    CurrentConfig.tokens.in.address
  );
  const [selectedTokenOut, setSelectedTokenOut] = useState<string>(
    CurrentConfig.tokens.out.address
  );

  const onSelectTokenIn = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenIn(e.target.value);
    setTokenInFromAddress(e.target.value);
  };
  const onSelectTokenOut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenOut(e.target.value);
    setTokenOutFromAddress(e.target.value);
  };
  
 

  // functions to swap the tokens
  const onCreateTrade = useCallback(async () => {
    setTrade(await createTrade());
  }, []);


  const onTrade = useCallback(async (trade: TokenTrade | undefined) => {
    if (trade) {
      setIsLoading(false); // Set loading to true before executing the trade
  
      try {
        setTxState(await executeTrade(trade));
      } catch (error) {
        console.error('Error executing trade:', error);
        // Handle the error as needed
      } finally {
        setIsLoading(true); // Set loading to false when the trade operation completes
      }
    }
  }, []);
  

// Function to update CurrentConfig.tokens.in
const setTokenInFromAddress = async (selectedTokenIn: string) => {
  try {
    // Find the token object that matches the selected token address
    const selectedToken = Tokens.find((tokenOption) => tokenOption.address === selectedTokenIn);

    // Check if the selected token was found
    if (selectedToken) {
      // Create a copy of the CurrentConfig object to modify
      const updatedConfig = { ...CurrentConfig };
      updatedConfig.tokens.in = selectedToken;

      // You can optionally update the balances here if needed
      const provider = getProvider();
      const address = getWalletAddress();
      if (provider && address) {
        updatedConfig.tokens.amountIn = Number(passedAmount); // Update the amountIn
        updatedConfig.tokens.in = selectedToken; // Update the selected token
        setTokenInBalance(await getCurrencyBalance(provider, address, selectedToken));
      }

      // Update the CurrentConfig object with the new values
      CurrentConfig.tokens.in = updatedConfig.tokens.in;
      CurrentConfig.tokens.amountIn = updatedConfig.tokens.amountIn;

      // You may want to trigger other updates here if needed
    } else {
      // Handle the case where the selected token address is not found
      console.error(`Token with address ${selectedTokenIn} not found.`);
    }
  } catch (error) {
    console.error("Error while setting token from address:", error);
  }
}

useEffect(() => {
  setTokenInFromAddress(selectedTokenIn);
}, [selectedTokenIn, passedAmount]);

// Function to update CurrentConfig.tokens.in
const setTokenOutFromAddress = async (selectedTokenOut: string) => {
  try {
    // Find the token object that matches the selected token address
    const selectedToken = Tokens.find((tokenOption) => tokenOption.address === selectedTokenOut);

    // Check if the selected token was found
    if (selectedToken) {
      // Create a copy of the CurrentConfig object to modify
      const updatedConfig = { ...CurrentConfig };
      updatedConfig.tokens.out = selectedToken;

      // You can optionally update the balances here if needed
      const provider = getProvider();
      const address = getWalletAddress();
      if (provider && address) {
        updatedConfig.tokens.amountIn = Number(passedAmount); // Update the amountIn
        updatedConfig.tokens.out = selectedToken; // Update the selected token
        setTokenOutBalance(await getCurrencyBalance(provider, address, selectedToken));
      }

      // Update the CurrentConfig object with the new values
      CurrentConfig.tokens.in = updatedConfig.tokens.in;
      CurrentConfig.tokens.amountIn = updatedConfig.tokens.amountIn;

      // You may want to trigger other updates here if needed
    } else {
      // Handle the case where the selected token address is not found
      console.error(`Token with address ${selectedTokenOut} not found.`);
    }
  } catch (error) {
    console.error("Error while setting token from address:", error);
  }
}

useEffect(() => {
  setTokenOutFromAddress(selectedTokenOut);
}, [selectedTokenOut, passedAmount]);

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
          value={String(passedAmount)}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (!isNaN(Number(inputValue))) {
              setPassedAmount(inputValue);
              onCreateTrade();
            } else {
              console.error('Invalid input. Please enter a valid number.');
            }
          } } />
        <select value={selectedTokenIn} onChange={onSelectTokenIn}>
          {Tokens.map((tokenOption) => (
            <option key={tokenOption.address} value={tokenOption.address}>
              {tokenOption.symbol}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div className={styles.formGroup}>
      <input
        className={styles.formControl}
        placeholder={'0.00'}
        value={trade ? ` ${displayTrade(trade)}` : ''} />
        
      <select value={selectedTokenOut} onChange={onSelectTokenOut}>
        {Tokens.map((tokenOption) => (
          <option key={tokenOption.address} value={tokenOption.address}>
            {tokenOption.symbol}
          </option>
        ))}
      </select>
    </div>
    <button
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
  </div>
 
  </>
);

}
// Export the swapTokens function
export default SwapTokens;


