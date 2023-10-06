import { Token } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import {  SWAP_ROUTER_ADDRESS} from '../libs/constants'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import SwapTokens from "./swapTokens";
import { getWalletAddress } from "../libs/providers";
import { TokenTrade, getTokenTransferApproval } from "../libs/trading";




export async function swapTokens(trade: TokenTrade, amount: string): Promise<ethers.providers.TransactionRequest> {
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const amountIn = ethers.utils.parseEther(amount); 
    const walletAddress = getWalletAddress()

    if (!walletAddress || !provider) {
        throw new Error('Cannot execute a trade without a connected wallet')
      }
    
      // Give approval to the router to spend the token
   // const tokenApproval = await getTokenTransferApproval(trade.)
    
    const uniswapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, IUniswapV3PoolABI.abi, provider);
  
    // Define the swap path (token addresses)
    //const path = [tokenIn, tokenOut];
  
    // Minimum amount of output tokens you want to receive
    const amountOutMin = 0;
  
    // Deadline for the transaction (in seconds)
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
  
    // Build the transaction request
    const transactionRequest: ethers.providers.TransactionRequest = {
      to: SWAP_ROUTER_ADDRESS,
      value: 0, // Amount of Ether (in wei) to send with the transaction, 0 for token swaps
     // data: uniswapRouter.interface.encodeFunctionData('swapExactTokensForTokens', [amountIn, amountOutMin, path, provider.getSigner().getAddress(), deadline]),
    };
  
    return transactionRequest;
  }
  

  export default SwapTokens;