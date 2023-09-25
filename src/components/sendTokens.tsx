/*import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Tokens } from '../libs/constants';

// Your Ethereum wallet provider URL
const providerUrl = 'YOUR_PROVIDER_URL';

// Sample Token object from Uniswap (replace with actual token data)
const uniswapTokens = Tokens;

export const SendTokens = () => {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [selectedToken, setSelectedToken] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenBalances, setTokenBalances] = useState([]);

  useEffect(() => {
    // Initialize the Ethereum wallet provider
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // Initialize the wallet (replace 'YOUR_PRIVATE_KEY' with your private key)
    const privateKey = 'YOUR_PRIVATE_KEY';
    const wallet = new ethers.Wallet(privateKey, provider);
    setWallet(wallet);

    // Fetch the user's token balances
    fetchTokenBalances(wallet);
  }, []);

  const fetchTokenBalances = async (wallet: ethers.Signer | ethers.providers.Provider | null | undefined) => {
    // Fetch and set the user's token balances
    const balances = await Promise.all(
      uniswapTokens.map(async (token) => {
        const tokenContract = new ethers.Contract(token.address, ['function balanceOf(address) view returns (uint256)'], wallet);
        const balance = await tokenContract.balanceOf(wallet.address);
        return { ...token, balance };
      })
    );

    setTokenBalances(balances);
  };

  const handleTokenChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedToken(event.target.value);
  };

  const handleRecipientChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setRecipientAddress(event.target.value);
  };

  const handleAmountChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setAmount(event.target.value);
  };

  const sendTokens = async () => {
    try {
      const token = uniswapTokens.find((token) => token.symbol === selectedToken);
      if (!token) {
        throw new Error('Token not found');
      }

      // Convert the amount to the token's decimal format
      const amountInWei = ethers.utils.parseUnits(amount, token.decimals);

      // Create a transaction object
      const tokenContract = new ethers.Contract(token.address, ['function transfer(address to, uint256 value)'], wallet);
      const tx = await tokenContract.transfer(recipientAddress, amountInWei);

      // Wait for the transaction to be mined
      await tx.wait();

      // Refresh token balances after the transaction is complete
      fetchTokenBalances(wallet);
    } catch (error) {
      console.error('Error sending tokens:', error);
    }
  };

  return (
    <div>
      <h2>Send Tokens</h2>
      <label>
        Select Token:
        <select onChange={handleTokenChange}>
          <option value="">Select a token</option>
          {uniswapTokens.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Recipient Address:
        <input type="text" onChange={handleRecipientChange} value={recipientAddress} />
      </label>
      <br />
      <label>
        Amount:
        <input type="number" onChange={handleAmountChange} value={amount} />
      </label>
      <br />
      <button onClick={sendTokens}>Send Tokens</button>
    </div>
  );
};

export default SendTokens;
*/