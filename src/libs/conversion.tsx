import { Token } from '@uniswap/sdk-core'
import { ethers } from 'ethers'
import JSBI from 'jsbi'

export function fromReadableAmount(amount: number, decimals: number): JSBI {
  const extraDigits = Math.pow(10, countDecimals(amount))
  const adjustedAmount = amount * extraDigits
  return JSBI.divide(
    JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
    ),
    JSBI.BigInt(extraDigits)
  )
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return JSBI.divide(
    JSBI.BigInt(rawAmount),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
  ).toString()
}

function countDecimals(x: number) {
  if (Math.floor(x) === x) {
    return 0
  }
  return x.toString().split('.')[1].length || 0
}


/*/ function to convert the passed amount to its equavilent decimals
export function convertAmount(amount: string, token: Token): ethers.BigNumber {
  const amountBN = ethers.utils.parseUnits(amount, token.decimals);
  return amountBN;
}

*/
export function convertAmount(amount: string, token: Token): string {
  const amountBN = ethers.utils.parseUnits(amount, token.decimals);

   const passedAmount =parseFloat(ethers.utils.formatUnits(amountBN, token.decimals));
   return passedAmount.toString();
}
