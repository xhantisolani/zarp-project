import { TransactionState, getProvider, getWalletAddress, sendTransaction } from '../libs/providers';
import { CurrentConfig, Environment } from '../config';
import { useCallback, useState } from 'react';
import { createTrade, executeTrade, TokenTrade } from '../libs/trading';
import { ERC20_ABI, ZARP_ABI, Tokens } from '../libs/constants'; 
import { displayTrade } from '../libs/utils';
import styles from './swapToken.module.css';
import Spinner from './Spinner';
import { Token } from '@uniswap/sdk-core';
import ErrorModal from './ErrorModal';
import { getCurrencyBalance } from '../libs/wallet';

export function SwapTokens() {
  const [selectedTokenIn, setSelectedTokenIn] = useState<Token | null>(null);
  const [selectedTokenOut, setSelectedTokenOut] = useState<Token | null>(null);
  const [tokenInBalance, setTokenInBalance] = useState<string>();
  const [passedAmount, sePassedAmount] = useState<string>("");
  const [trade, setTrade] = useState<TokenTrade>();
  const [txState, setTxState] = useState<TransactionState>(TransactionState.New);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const tokenOptions = Tokens;

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
      const provider = getProvider();
      if (provider) {
        const address = getWalletAddress();
        const user = address as string;
        setTokenInBalance(await getCurrencyBalance(provider, user, selectedToken));
      } else {
        openErrorModal('Error connecting to Ethereum provider');
      }
    } catch (error) {
      openErrorModal('Error fetching wallet balance');
    }
  }

  function setTokenIn(token: Token) {
    try {
      CurrentConfig.tokens.in = token;
    } catch (error) {
      openErrorModal('Error setting up CurrentConfig');
    }
  }

  function setTokenOut(token: Token) {
    try {
      CurrentConfig.tokens.out = token;
    } catch (error) {
      openErrorModal('Error setting up CurrentConfig');
    }
  }

  function setAmountIn(amount: string) {
    try {
      CurrentConfig.tokens.amountIn = Number(amount);
      sePassedAmount(amount);
      return CurrentConfig.tokens.amountIn;
    } catch (error) {
      openErrorModal('Error setting up CurrentConfig');
    }
  }

  const onCreateTrade = useCallback(async () => {
    setTrade(await createTrade());
  }, []);

  const onTrade = useCallback(async (trade: TokenTrade | undefined) => {
    if (trade) {
      setIsLoading(true); 
      try {
        setTxState(await executeTrade(trade));
      } catch (error) {
        openErrorModal(`Token with address ${error} not found.`);
      } finally {
        setTxState(TransactionState.Rejected);
        setIsLoading(false);
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
              <h2 className="error">Please install a wallet to use this example configuration</h2>
            )}
          </div>
          <p className={styles.label}>Balance: {tokenInBalance} {selectedTokenIn?.symbol} Transaction State: {txState}</p>
          <div className={styles.formGroup}>
            <input
              className={styles.formControl}
              placeholder={'0.00'}
              name={"displayFirstToken"}
              value={passedAmount}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!isNaN(Number(inputValue))) {
                  setAmountIn(inputValue);
                  onCreateTrade();
                } else {
                  openErrorModal('Invalid input. Please enter a valid number.');
                }
              }}
            />
            <select
              value={selectedTokenIn ? selectedTokenIn.address : ''}
              name={"FirstToken"}
              onChange={(e) => {
                const selectedTokenAddress = e.target.value;
                const token = tokenOptions.find((token) => token.address === selectedTokenAddress);
                setSelectedTokenIn(token || null);
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
            disabled 
          />
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
            !selectedTokenIn ||
            txState === TransactionState.Sending ||
            getProvider() === null ||
            CurrentConfig.rpc.mainnet === ''
          }
          title="Select Tokens"
        >
          Swap
        </button>
        {isLoading && <Spinner />}
        <ErrorModal isOpen={isErrorModalOpen} onClose={closeErrorModal} error={error} />
      </div>
    </>
  );
}

export default SwapTokens;
