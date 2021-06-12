import React from 'react';
import {ETH, USDC, activeTokenListsAtom,allTokenListAtom,topCoinListsAtom, TicksSurroundingPriceAtom,} from '../src/store/index'
import {computePoolAddress, FACTORY_ADDRESS,FeeAmount, tickToPrice, TickMath,maxLiquidityForAmounts, getLiquidityForAmounts} from '@uniswap/v3-sdk'
import { useAtomValue } from 'jotai/utils'
import { ChainId, Token, WETH, Pair, TokenAmount } from '@uniswap/sdk'
import { useAtom } from 'jotai';
import dayjs from 'dayjs'
import JSBI from 'jsbi'
import {getLiquidityForAmountsOriginal,getLiquidityForAmountsVariant} from '../src/store/index'

const Q96 = JSBI.exponentiate(JSBI.BigInt(2),JSBI.BigInt(96))
const Q192 = Q96 * Q96
const Q128 = JSBI.exponentiate(JSBI.BigInt(2),JSBI.BigInt(128))


const tickLower = 68400
const tickUpper = 94620
const tickCurrent = 82175
const tick0 = 82250
const sqrtPrice = JSBI.BigInt("4821872208213895636536707050881")
const GRT = new Token(ChainId.MAINNET, "0xc944e90c64b2c07662a292be6244bdf05cda44a7", 18, "GRT", "Graph Token")
const amount0 = JSBI.BigInt(23.0740042364073941 * (10**18))
const amount1 = JSBI.BigInt(93294.750403940822576026 * (10 **18))

const feeGrowthGlobal0X128 = JSBI.BigInt("49676371269781286751389176908756460") - JSBI.BigInt("31937247133848243465232178454300198")
const feeGrowthGlobal1X128 = JSBI.BigInt("169041058922339567414829147344359172531") - JSBI.BigInt("108659284954099431109715064857087737222")
const Liquidity = JSBI.BigInt("3056296841378122087837")

const Test = () =>{
  console.log(computePoolAddress({factoryAddress:FACTORY_ADDRESS, tokenA: ETH, tokenB: USDC, fee: FeeAmount.MEDIUM}).toLowerCase())
  // const ticks = useAtomValue(TicksSurroundingPriceAtom).ticksProcessed.map(t=>({...t, liquidityActive: parseFloat(t.liquidityActive.toString()), price0: parseFloat(t.price0), price1: parseFloat(t.price1)}))
  console.log(1/Number(TickMath.getSqrtRatioAtTick(tickLower)*TickMath.getSqrtRatioAtTick(tickLower)/Q192))
  console.log(Number(TickMath.getSqrtRatioAtTick(tickUpper)/Q96))
  console.log(tickToPrice(ETH,GRT, tickLower).toSignificant(6))
  console.log(tickToPrice(ETH,GRT, tickUpper).toSignificant(6))
  console.log(tickToPrice(ETH,GRT, tickCurrent).toSignificant(6))
  console.log(String(maxLiquidityForAmounts(TickMath.getSqrtRatioAtTick(tick0),TickMath.getSqrtRatioAtTick(tickLower),TickMath.getSqrtRatioAtTick(tickUpper), amount0,amount1, false)))
  const sqrt_m = TickMath.getSqrtRatioAtTick(tickLower)/TickMath.getSqrtRatioAtTick(tick0)
  const m = Number(sqrt_m * sqrt_m)
  const sqrt_M = TickMath.getSqrtRatioAtTick(tickUpper)/TickMath.getSqrtRatioAtTick(tick0)
  const M = Number(sqrt_M * sqrt_M)
  const p0 = TickMath.getSqrtRatioAtTick(tick0) * TickMath.getSqrtRatioAtTick(tick0) / Q192

  console.log(getLiquidityForAmountsOriginal(TickMath.getSqrtRatioAtTick(tick0),TickMath.getSqrtRatioAtTick(tickLower),TickMath.getSqrtRatioAtTick(tickUpper),amount0, amount1))
  console.log(getLiquidityForAmountsVariant(p0,m,M, (23.0740042364073941*p0 + 93294.750403940822576026)) *(10**18))
  // console.log(sqrtPrice*sqrtPrice/Q192)

  // console.log(Number(sqrtPrice * sqrtPrice / Q192))

  // console.log('token0_fee',feeGrowthGlobal0X128*Liquidity/Q128/JSBI.exponentiate(JSBI.BigInt(10),JSBI.BigInt(ETH.decimals)))
  // console.log('token1_fee',feeGrowthGlobal1X128*Liquidity/Q128/JSBI.exponentiate(JSBI.BigInt(10),JSBI.BigInt(GRT.decimals)))
  // console.log(ETH.sortsBefore(GRT))

  // console.log(dayjs.unix(1622246400).format('MMM DD'))
  // console.log(tickToPrice(ETH, USDC, 198951).toSignificant())
  return <div>

  </div>
}

export default Test