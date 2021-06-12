import { atom, useAtom , Atom, WritableAtom} from 'jotai'
import { atomWithQuery } from 'jotai/query'
import {GraphQLClient} from "graphql-request";
import {atomWithLocalStorage, atomWithLocalStorageAndDefault} from '../utils/jotai_helper'
import {DEFAULT_ACTIVE_LIST_URLS} from '../constants/tokenLists'
import {getTokenList} from '../utils/getTokenLists'
import {listTokens, getPairPrice, getEthPrice,getPoolDayData} from '../docments'
import { nanoid } from 'nanoid'
import {getAddress} from '@ethersproject/address'
import keyBy from "lodash/keyBy";
import JSBI from 'jsbi'
import { Token } from '@uniswap/sdk-core'
import {ChainId} from '@uniswap/sdk'
import {computePoolAddress, FACTORY_ADDRESS,FeeAmount, tickToPrice, TickMath} from '@uniswap/v3-sdk'


export type LpPosition = {
  id:string;
  type: string;
  name: string;
  depositValue: number;
  tickUpper: number;
  tickLower: number;
  depositPrice: number;
  feeAmount: FeeAmount
}

export type HodlPosition = {
  id: string;
  type: string;
  name: string;
  token0Value: number;
  token1Value: number;
}

export type Position = LpPosition | HodlPosition

export type Strategy = {
  id: string;
  name: string;
  totalDeposit: number;
  positions: {[key:string]: number}
  token0: TokenInfo
  token1: TokenInfo
}

export type Pair = {
  id: string;
  token0: TokenInfo;
  token1: TokenInfo;
}

export class TokenInfo extends Token {
  public readonly logoURI;
  constructor(chainId, address, decimals, symbol, name, logoURI){
    super(chainId, address, decimals, symbol, name)
    this.logoURI = logoURI;
  }
}

const format = (x: number) => Number(x.toPrecision(6))
export const Q128 = JSBI.exponentiate(JSBI.BigInt(2),JSBI.BigInt(128))
export const Q96 = JSBI.exponentiate(JSBI.BigInt(2),JSBI.BigInt(96))
export const Q224 = JSBI.multiply(Q128,Q96)


interface model {id: string}

const selectAtom = <A extends model>(listAtom: Atom<Atom<A>[]>, idAtom: Atom<string>) => {
  return atom(
    (get)=> {
      if(get(idAtom) === null) return null
      const itemAtom  = get(listAtom).find(x=>get(x)?.id === get(idAtom)) as Atom<A>
      return  get(itemAtom)
    },
    (get,set,update: A) =>{
      const itemAtom  = get(listAtom).find(x=>get(x)?.id === get(idAtom))  as WritableAtom<A,A>
      set(itemAtom, update)
    }    
  )
}

export const convertToTokenInfo = token => new TokenInfo(ChainId.MAINNET,token.address, token.decimals,token.symbol,token.name,token.logoURI)


export const ETH = new TokenInfo(ChainId.MAINNET, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",18,"ETH","Ether", "https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627")
export const USDC = new TokenInfo(ChainId.MAINNET,  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", 6, "USDC", "USD Coin", "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389")

const prefix = 'osushi_2.0.1'

const client = new GraphQLClient("https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2")
const clientV3 = new GraphQLClient('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-alt')

export const accountAtom = atomWithLocalStorage(prefix+'account',null)
export const accountsAtom = atomWithLocalStorage(prefix+'accounts',[])
export const poolAtom = atomWithLocalStorage(prefix+'pool',null)

export const ethPriceAtom = atomWithQuery((get)=>({
  queryKey:'eth_price',
  queryFn: async () => {
    const {bundles} = await client.request(getEthPrice)
    return Number(bundles[0].ethPrice)
  }
}))

// export const selectedPairIdAtom = atomWithLocalStorage<string>(prefix+'selectedPairId', "ETH-USDC")
export const selectedPositionIdAtom = atomWithLocalStorage<string>(prefix+'selectedPositionId',null)
export const selectedStrategyIdAtom = atomWithLocalStorage<string>(prefix+'selectedStrategyId',null)

export const defaultLpPosition = atomWithLocalStorage(prefix+'firstPositionLpId',{
    id: `${prefix}firstPositionLpId`,
    type: 'uniswap_v3_lp',
    name: 'Moderate Range',
    depositValue : 100000,
    tickUpper: 2.5,
    tickLower: 0.4,
    feeAmount: FeeAmount.MEDIUM
  }
)
export const defaultHodlPosition1 = atomWithLocalStorage<HodlPosition>(prefix+'firstPositionHodlId',{
    id: `${prefix}firstPositionHodlId`,
    type: 'hodl',
    name: '100:0 HODL',
    token0Value: 100000,
    token1Value: 0,
  }
)
export const defaultHodlPosition2 = atomWithLocalStorage<HodlPosition>(prefix+'secondPositionHodlId',{
    id: `${prefix}secondPositionHodlId`,
    type: 'hodl',
    name: '50:50 HODL',
    token0Value: 50000,
    token1Value: 50000,
  }
)

export const positionsAtom = atomWithLocalStorage<Atom<LpPosition | HodlPosition>[]>(prefix+'positions_atom',[defaultLpPosition,defaultHodlPosition1,defaultHodlPosition2])

export const createNewLpPositionAtom = atom(null,
  (get,set) =>{
    const id = prefix+nanoid()
    set(positionsAtom,([
      ...get(positionsAtom), atomWithLocalStorage<LpPosition>(id, {
        id, 
        name: `Position ${get(positionsAtom).length+1}`,
        type: 'uniswap_v3_lp',
        depositValue : 100000,
        tickUpper: 2.5,
        tickLower: 0.4, 
        feeAmount: FeeAmount.MEDIUM
      })
    ]));
    const prevStrategy = get(selectedStrategyAtom)
    const newStrategy = {...prevStrategy}
    newStrategy.positions[id] = 1
    set(selectedStrategyAtom, newStrategy)
    set(selectedPositionIdAtom, id)
  }
)
export const createNewHodlPositionAtom = atom(null,
  (get,set) =>{
    const id = prefix+nanoid()
    set(positionsAtom,[
      ...get(positionsAtom), atomWithLocalStorage<HodlPosition>(id, {
        id,    
        name: `Position ${get(positionsAtom).length+1}`,
        type: 'hodl',
        token0Value: 50000,
        token1Value: 50000
      })
    ]);
    const prevStrategy = get(selectedStrategyAtom)
    const newStrategy = {...prevStrategy}
    newStrategy.positions[id] = 1
    set(selectedStrategyAtom, newStrategy)
    set(selectedPositionIdAtom, id)
  }
)  
export const createNewStrategyAtom = atom(null,
  (get,set) => {
    const id = prefix+nanoid();
    const name = `Strategy ${get(strategiesAtom).length+1}`

    set(strategiesAtom, [
      ...get(strategiesAtom), atomWithLocalStorage<Strategy>(id,{
        id,
        name,
        totalDeposit:null,
        positions:{},
        token0: ETH,
        token1: USDC
      })
    ]);
    set(selectedStrategyIdAtom, id);
  }
)
export const deletePositionAtom = atom(null,
  (get,set, id:string) => {
    set(positionsAtom, get(positionsAtom).filter(position => get(position).id != id))

    get(strategiesAtom).forEach(strategyAtom =>{
      const prev = get(strategyAtom)
      if(id in prev.positions){
        const {[id]: _ , ...positions} = prev.positions
        set(selectAtom(strategiesAtom, atom(prev.id)), {...prev, positions})
      }
    })

    set(selectedPositionIdAtom, null)
  }
)
export const deletePositionFromStrategyAtom = atom(null,
  (get,set,id : string) => {
    const prev = get(selectedStrategyAtom)
    const {[id]: _ ,...positions} = prev.positions
    set(selectedStrategyAtom, {...prev, positions })
  }
)
export const deleteStrategyAtom = atom(null,
  (get,set,id:string) => {
    const selectedStrategyPositionIds = Object.keys(get(selectedStrategyAtom).positions)
    set(positionsAtom, get(positionsAtom).filter(positionAtom => !selectedStrategyPositionIds.includes(get(positionAtom).id)))
    set(strategiesAtom, get(strategiesAtom).filter(strategyAtom => get(strategyAtom).id != id ))
    set(selectedStrategyIdAtom, null)
  }
)

export const defaultStrategy1 = atomWithLocalStorage<Strategy>(prefix+'defaultStrategy1',
  {
    id: `${prefix}defaultStrategy1`,
    name: 'Moderate Range Strategy',
    totalDeposit: null,
    positions: { 
      [prefix+'firstPositionLpId']: 1
    },
    token0: ETH,
    token1: USDC,
  },
)
export const defaultStrategy2 = atomWithLocalStorage<Strategy>(prefix+'defaultStrategy2',
  {
    id: `${prefix}defaultStrategy2`,
    name: '50:50 HODL Strategy',
    totalDeposit: null,
    positions: { 
      [prefix+'secondPositionHodlId']: 1
    },
    token0: ETH,
    token1: USDC,
  },
)
export const defaultStrategy3 = atomWithLocalStorage<Strategy>(prefix+'defaultStrategy3',
  {
    id: `${prefix}defaultStrategy3`,
    name: '100:0 HODL Strategy',
    totalDeposit: null,
    positions: { 
      [prefix+'firstPositionHodlId']: 1
    },
    token0: ETH,
    token1: USDC,
  },
)
export const strategiesAtom = atomWithLocalStorage<Atom<Strategy>[]>(prefix+'strategiesAtom',[defaultStrategy1,defaultStrategy2,defaultStrategy3])
export const strategiesReadOnlyAtom = atom(get => {
  const positions = get(positionsAtom).map(position => get(position))
  return get(strategiesAtom).map(strategyAtom => {
    const strategy = get(strategyAtom)
    return {id:strategy.id, name: strategy.name,token0:strategy.token0,token1:strategy.token1, positions: Object.entries(strategy.positions).map(([id,ratio]) => ({ratio, ...positions.find(pos => pos.id === id)}))}
  })
})

export const selectedStrategyPositionsAtom = atom((get)=> {
  const selectedStrategyPositionIds = Object.keys(get(selectedStrategyAtom).positions)
  return  get(positionsAtom).filter(positionAtom => selectedStrategyPositionIds.includes(get(positionAtom).id))
})

export const selectedPositionAtom = selectAtom<LpPosition | HodlPosition>(positionsAtom, selectedPositionIdAtom)
export const selectedStrategyAtom = selectAtom<Strategy>(strategiesAtom, selectedStrategyIdAtom)

export const token0Atom = atom((get)=>get(selectedStrategyAtom).token0)
export const token1Atom = atom((get)=>get(selectedStrategyAtom).token1)

export const priceV2Atom = atom<number>((get)=>{
  const currentPrices = get(currentPricesAtom)
  return currentPrices[get(token0Atom).address]/currentPrices[get(token1Atom).address]
})

export const token0PriceAtom = atom<number>((get)=>{
  const currentPrices = get(currentPricesAtom)
  return currentPrices[get(token0Atom).address]
})

export const token1PriceAtom = atom<number>((get)=>{
  const currentPrices = get(currentPricesAtom)
  return currentPrices[get(token1Atom).address]
})

export const getTokenEthPriceAtom = (token:TokenInfo) => atom<number>((get)=> get(currentPricesAtom)[token.address])
export const getTokenPriceAtom = (token:TokenInfo) => atom<number>((get)=> get(currentPricesAtom)[token.address]*get(ethPriceAtom))

// export const liquidityAtom = atom((get)=>{
//   const token1Price = get(token1PriceAtom)
//   const token0Price = get(token0PriceAtom)
//   const ethPrice = get(ethPriceAtom)
//   const p = token0Price / token1Price
//   const {tickLower: m , tickUpper:M, depositValue} = get(selectedPositionAtom) as LpPosition
//   const depositAmount = depositValue / ethPrice / token1Price
//   const liquidity = getLiquidityForAmountsVariant(p,m,M,depositAmount)
//   return liquidity
// })

// export const poolDayDataAtom = atom(async (get)=>{
//   if(get(selectedPositionAtom) && get(selectedStrategyAtom)){
//     const {feeAmount} = get(selectedPositionAtom) as LpPosition
//     const {token0, token1} = get(selectedStrategyAtom)
//     const tokenA = convertToTokenInfo(token0)
//     const tokenB = convertToTokenInfo(token1)
//     let liquidity = 0
//     const poolAddress = computePoolAddress({factoryAddress: FACTORY_ADDRESS, tokenA, tokenB, fee: feeAmount}).toLowerCase()
//     const {poolDayDatas} = await clientV3.request(getPoolDayData, {poolAddress})
//     const formattedData: {feeGrowthGlobal0X128: string,feeGrowthGlobal1X128:string }[] = poolDayDatas.map(d => ({...d,date: dayjs.unix(d.date).format()}))
//     const token1Price = get(token1PriceAtom)
//     const token0Price = get(token0PriceAtom)
//     const ethPrice = get(ethPriceAtom)
//     const {tickLower: m , tickUpper:M, depositValue} = get(selectedPositionAtom) as LpPosition
//     const meanDecimals = (tokenA.decimals + tokenB.decimals)/2
//     if(tokenA.sortsBefore(tokenB)){
//       const p = token0Price / token1Price
//       liquidity = getLiquidityForAmountsVariant(p,m,M,depositValue / ethPrice / token1Price)
//       console.log(liquidity)
//       const fees0 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal0X128)-Number(formattedData[i].feeGrowthGlobal0X128)) * liquidity / (2**128) * 365/i * 10**(meanDecimals -tokenA.decimals)])))
//       const fees1 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal1X128)-Number(formattedData[i].feeGrowthGlobal1X128)) * liquidity / (2**128) * 365/i * 10**(meanDecimals -tokenB.decimals)])))
//       console.log(fees0,fees1)
//       return {fees0,fees1, poolDayData: formattedData}
//     }else{
//       const p = token1Price / token0Price
//       console.log(p)
//       liquidity = getLiquidityForAmountsVariant(p,1/M,1/m,depositValue / ethPrice / token0Price)
//       console.log(poolAddress)
//       const fees1 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal0X128)-Number(formattedData[i].feeGrowthGlobal0X128)) * liquidity / (2**128) * 365/i * 10**(meanDecimals -tokenB.decimals)])))
//       const fees0 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal1X128)-Number(formattedData[i].feeGrowthGlobal1X128)) * liquidity / (2**128) * 365/i * 10**(meanDecimals -tokenA.decimals)])))   
//       console.log(fees0,fees1)
//       return {fees0,fees1, poolDayData: formattedData} 
//     }
//   }
// })

export const topCoinListsAtom = atomWithQuery(()=>({
  queryKey:'top_coin_lists',
  queryFn: async() =>{
    const {tokens} = await client.request(listTokens)
    return tokens.filter(token => !token.name.includes('blacklist'))
  }
}))

export const allTokenListAtom = atomWithQuery((get) => ({
  queryKey: 'allTokenList',
  queryFn: async () =>{
    const res = (await Promise.all(DEFAULT_ACTIVE_LIST_URLS.map(url => getTokenList(url))).then(tokenLists => tokenLists.map(tokenList=> tokenList.tokens))).flat()
    return res
  }
}))

export const activeTokenListsAtom =atomWithQuery((get) =>({
  queryKey: 'activeTokenList',
  queryFn: async ()=> {
    const tokenAddressMap =  Object.fromEntries(get(allTokenListAtom).flat().map(token => [token.address, token]))
    const res =  Object.fromEntries(get(topCoinListsAtom).filter(token =>tokenAddressMap[token.id]?.address).map(token => {
      const tokenInfo = convertToTokenInfo(tokenAddressMap[token.id])
      return [tokenInfo.address, tokenInfo]
    }))
    res[ETH.address] =  ETH
    return res
  }
}))

export const currentPricesAtom = atom((get) =>{
  return Object.fromEntries(get(topCoinListsAtom).map(token => [getAddress(token.id), token.derivedETH]))
})

export const slideDirectionAtom = atomWithLocalStorage(prefix+'slideDirection','right')


// export const TicksSurroundingPriceAtom = atomWithQuery((get)=>({
//   queryKey: prefix+'initializedTicks',
//   queryFn: async () => {
//     const {data} = await fetchTicksSurroundingPrice(get(poolAddressAtom))
//     return data
//   }
// }))


const PRICE_FIXED_DIGITS = 4
const DEFAULT_SURROUNDING_TICKS = 300
const FEE_TIER_TO_TICK_SPACING = (feeTier: string): number => {
  switch (feeTier) {
    case '10000':
      return 200
    case '3000':
      return 60
    case '500':
      return 10
    default:
      throw Error(`Tick spacing for fee tier ${feeTier} undefined.`)
  }
}

interface TickPool {
  tick: string
  feeTier: string
  token0: {
    symbol: string
    id: string
    decimals: string
  }
  token1: {
    symbol: string
    id: string
    decimals: string
  }
  sqrtPrice: string
  liquidity: string
}

interface Tick {
  tickIdx: string
  liquidityGross: string
  liquidityNet: string
  price0: string
  price1: string
}

export interface TickProcessed {
  liquidityGross: JSBI
  liquidityNet: JSBI
  tickIdx: number
  liquidityActive: JSBI
  price0: string
  price1: string
}

const fetchInitializedTicks = async (
  poolAddress: string,
  tickIdxLowerBound: number,
  tickIdxUpperBound: number
) => {
  const tickQuery = `
    query surroundingTicks(
      $poolAddress: String!
      $tickIdxLowerBound: BigInt!
      $tickIdxUpperBound: BigInt!
      $skip: Int!
    ) {
      ticks(
        first: 1000
        skip: $skip
        where: { poolAddress: $poolAddress, tickIdx_lte: $tickIdxUpperBound, tickIdx_gte: $tickIdxLowerBound }
      ) {
        tickIdx
        liquidityGross
        liquidityNet
        price0
        price1
      }
    }
  `
  let surroundingTicks: Tick[] = []
  let surroundingTicksResult: Tick[] = []
  let skip = 0
  do {
    const {ticks} = await clientV3.request(tickQuery,{
        poolAddress,
        tickIdxLowerBound,
        tickIdxUpperBound,
        skip,
      })

    surroundingTicksResult = surroundingTicksResult.concat(ticks)
    skip += 1000
  } while (surroundingTicks.length > 0)
  return surroundingTicksResult
}

export interface PoolTickData {
  ticksProcessed: TickProcessed[]
  feeTier: string
  tickSpacing: number
  activeTickIdx: number
}

const poolQuery = `
  query pool($poolAddress: String!) {
    pool(id: $poolAddress) {
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      feeTier
      sqrtPrice
      liquidity
    }
  }
`
export const fetchTicksSurroundingPrice = async (
  poolAddress: string,
  numSurroundingTicks = DEFAULT_SURROUNDING_TICKS
) => {
  const {
    pool: {
      tick: poolCurrentTick,
      feeTier,
      liquidity,
      token0: { id: token0Address, decimals: token0Decimals },
      token1: { id: token1Address, decimals: token1Decimals },
    }}= await clientV3.request(poolQuery,{poolAddress})

  const poolCurrentTickIdx = parseInt(poolCurrentTick)
  const tickSpacing = FEE_TIER_TO_TICK_SPACING(feeTier)

  // The pools current tick isn't necessarily a tick that can actually be initialized.
  // Find the nearest valid tick given the tick spacing.
  const activeTickIdx = Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing

  // Our search bounds must take into account fee spacing. i.e. for fee tier 1%, only
  // ticks with index 200, 400, 600, etc can be active.
  const tickIdxLowerBound = activeTickIdx - numSurroundingTicks * tickSpacing
  const tickIdxUpperBound = activeTickIdx + numSurroundingTicks * tickSpacing

  const initializedTicks= await fetchInitializedTicks(poolAddress, tickIdxLowerBound, tickIdxUpperBound)

  const tickIdxToInitializedTick = keyBy(initializedTicks, 'tickIdx')

  const token0 = new Token(1, token0Address, parseInt(token0Decimals))
  const token1 = new Token(1, token1Address, parseInt(token1Decimals))

  let activeTickIdxForPrice = activeTickIdx
  if (activeTickIdxForPrice < TickMath.MIN_TICK) {
    activeTickIdxForPrice = TickMath.MIN_TICK
  }
  if (activeTickIdxForPrice > TickMath.MAX_TICK) {
    activeTickIdxForPrice = TickMath.MAX_TICK
  }

  const activeTickProcessed: TickProcessed = {
    liquidityActive: JSBI.BigInt(liquidity),
    tickIdx: activeTickIdx,
    liquidityNet: JSBI.BigInt(0),
    price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(PRICE_FIXED_DIGITS),
    price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(PRICE_FIXED_DIGITS),
    liquidityGross: JSBI.BigInt(0),
  }

  const activeTick = tickIdxToInitializedTick[activeTickIdx]
  if (activeTick) {
    activeTickProcessed.liquidityGross = JSBI.BigInt(activeTick.liquidityGross)
    activeTickProcessed.liquidityNet = JSBI.BigInt(activeTick.liquidityNet)
  }

  enum Direction {
    ASC,
    DESC,
  }

  const computeSurroundingTicks = (
    activeTickProcessed: TickProcessed,
    tickSpacing: number,
    numSurroundingTicks: number,
    direction: Direction
  ) => {
    let previousTickProcessed: TickProcessed = {
      ...activeTickProcessed,
    }

    let processedTicks: TickProcessed[] = []
    for (let i = 0; i < numSurroundingTicks; i++) {
      const currentTickIdx =
        direction == Direction.ASC
          ? previousTickProcessed.tickIdx + tickSpacing
          : previousTickProcessed.tickIdx - tickSpacing

      if (currentTickIdx < TickMath.MIN_TICK || currentTickIdx > TickMath.MAX_TICK) {
        break
      }

      const currentTickProcessed: TickProcessed = {
        liquidityActive: previousTickProcessed.liquidityActive,
        tickIdx: currentTickIdx,
        liquidityNet: JSBI.BigInt(0),
        price0: tickToPrice(token0, token1, currentTickIdx).toFixed(PRICE_FIXED_DIGITS),
        price1: tickToPrice(token1, token0, currentTickIdx).toFixed(PRICE_FIXED_DIGITS),
        liquidityGross: JSBI.BigInt(0),
      }

      const currentInitializedTick = tickIdxToInitializedTick[currentTickIdx.toString()]
      if (currentInitializedTick) {
        currentTickProcessed.liquidityGross = JSBI.BigInt(currentInitializedTick.liquidityGross)
        currentTickProcessed.liquidityNet = JSBI.BigInt(currentInitializedTick.liquidityNet)
      }

      // Update the active liquidity.
      // If we are iterating ascending and we found an initialized tick we immediately apply
      // it to the current processed tick we are building.
      // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
      if (direction == Direction.ASC && currentInitializedTick) {
        currentTickProcessed.liquidityActive = JSBI.add(
          previousTickProcessed.liquidityActive,
          JSBI.BigInt(currentInitializedTick.liquidityNet)
        )
      } else if (direction == Direction.DESC && JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))) {
        // We are iterating descending, so look at the previous tick and apply any net liquidity.
        currentTickProcessed.liquidityActive = JSBI.subtract(
          previousTickProcessed.liquidityActive,
          previousTickProcessed.liquidityNet
        )
      }

      processedTicks.push(currentTickProcessed)
      previousTickProcessed = currentTickProcessed
    }

    if (direction == Direction.DESC) {
      processedTicks = processedTicks.reverse()
    }

    return processedTicks
  }

  const subsequentTicks: TickProcessed[] = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.ASC
  )

  const previousTicks: TickProcessed[] = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.DESC
  )

  const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

  return {
    data: {
      ticksProcessed,
      feeTier,
      tickSpacing,
      activeTickIdx,
    },
  }
}


export const getLiquidityForAmountsVariant = (p0,m,M,w0)=>{
  const sqrt_p0 = Math.sqrt(p0);
  const sqrt_m = Math.sqrt(m);
  const sqrt_M = Math.sqrt(M);
  if(1<=m){
    return w0/sqrt_p0 * sqrt_m * sqrt_M / (sqrt_M-sqrt_m) 
  }else if(M<=1){
    return w0/sqrt_p0/(sqrt_M-sqrt_m)
  }else{
    return w0/sqrt_p0/(2-sqrt_m-1/sqrt_M) 
  }
}

export const getLiquidityForAmountsOriginal = (sqrtP0, sqrtPa, sqrtPb,amount0,amount1) =>{
  const w0 = amount1 + amount0 * sqrtP0 * sqrtP0;
  if(sqrtP0 <= sqrtPa){
    return w0 / sqrtP0 /sqrtP0 * sqrtPa * sqrtPb/(sqrtPb-sqrtPa)
  }else if(sqrtPb <= sqrtP0 ){
    return w0/(sqrtPb-sqrtPa)
  }else{
    return w0/(2*sqrtP0 -sqrtPa - sqrtP0*sqrtP0/sqrtPb)
  }
}

// export const token1AmountAtom = atom(
//   (get)=>{
//     const M = get(tickUpperAtom);
//     const m = get(tickLowerAtom);
//     const depositAmount = get(depositValueAtom)/ get(ethPriceAtom)/ get(token1PriceAtom);
//     if(m<=1 && 1<=M) return format(depositAmount *((1-Math.sqrt(m))/(2-1/Math.sqrt(M) - Math.sqrt(m))))
//     if(1 <= m) return 0
//     if(M<= 1) return format(depositAmount)
//   },
//   (get,set,newAmount :number) => {
//     const M = get(tickUpperAtom);
//     const m = get(tickLowerAtom);
//     if(m <= 1 && 1<= M){ set(depositValueAtom, newAmount * (2-1/Math.sqrt(M) - Math.sqrt(m))/ (1- Math.sqrt(m)) * get(ethPriceAtom) * get(token1PriceAtom))}
//     if(M <= 1){ set(depositValueAtom, newAmount  * get(ethPriceAtom) * get(token1PriceAtom))}
//     if(1 <= m){ throw Error('token1 amount should be 0') }
//   }
// )


// export const token0AmountAtom = atom(
//   (get) => {
//     const p = get(priceV2Atom);
//     const M = get(tickUpperAtom);
//     const m = get(tickLowerAtom);
//     const depositAmount = get(depositValueAtom)/ get(ethPriceAtom)/ get(token1PriceAtom);
//     const token1Amount = get(token1AmountAtom)
//     if(m<=1 && 1<=M){ return format(token1Amount * (1-1/Math.sqrt(M))/(1 - Math.sqrt(m)) / p) }
//     if(1 <= m) return format(depositAmount / p)
//     if(M<= 1) return 0   
//   },
//   (get,set,newAmount : number) => {
//     const M = get(tickUpperAtom);
//     const m = get(tickLowerAtom);
//     const p = get(priceV2Atom);
//     if(m <= 1 && 1<= M){ set(token1AmountAtom, newAmount * p *  (1 - Math.sqrt(m))/ (1-1/Math.sqrt(M)))}
//     if(M <= 1){ throw Error('token0 amount should be 0')}
//     if(1 <= m){ set(depositValueAtom, newAmount * p) }    
//   }
// )

// export const defaultPair = atomWithLocalStorage<Atom<Pair>>('firstPairId',{
//     id: 'firstPairId',
//     token0: ETH,
//     token1: USDC,
//   })

// export const upperPriceAtom = focusAtom(selectedPositionAtom, (optic)=>optic.prop('upperPrice').optional())
// export const lowerPriceAtom = focusAtom(selectedPositionAtom, (optic)=>optic.prop('lowerPrice').optional())
// export const depositValueAtom = focusAtom(selectedPositionAtom, (optic)=>optic.prop('depositValue').optional())
// export const tickUpperAtom = focusAtom(selectedPositionAtom, (optic)=>optic.prop('tickUpper').optional())
// export const tickLowerAtom = focusAtom(selectedPositionAtom, (optic)=>optic.prop('tickLower').optional())

// export const tickUpperAtom = atom(
//   (get) => get(upperPriceAtom) / get(priceV2Atom),
//   (get,set,newValue :number) => {
//     set(upperPriceAtom, newValue * get(priceV2Atom))
//   }
// )
// export const tickLowerAtom = atom(
//   (get) => get(lowerPriceAtom) / get(priceV2Atom),
//   (get,set,newValue :number) => {
//     set(lowerPriceAtom, newValue * get(priceV2Atom))
//   }
// )


// export const useInit = ()=>{
//   const [selectedPairId,setSelectedPairId] = useAtom(selectedPairIdAtom)
//   const [selectedPositionId,setSelectedPositionId] = useAtom(selectedPositionIdAtom)
//   const [pairs,setPairs] = useAtom(pairsAtom)
//   if(Object.keys(pairs).length == 0){
//     const newPairId = nanoid()
//     const newPositionId = nanoid()
//     setSelectedPairId(newPairId)
//     setSelectedPositionId(newPositionId)
//     setPairs({
//         [newPairId] : atom<Pair>({
//           token0: ETH,
//           token1: USDC,
//           positions:{
//             [newPositionId]: atom<LpPosition>({
//               type: 'uniswap_v3_lp',
//               depositValue : 100000,
//               tickUpper: 10,
//               tickLower: 0.1
//             }),
//           }
//         })
//       }
//     )
//   }
// }


// export const token0PriceAtom = atom(async (get) =>{
//   if (typeof window !== "undefined"){
//     const {data:{data:{items}}} = await axios.get(`https://api.covalenthq.com/v1/pricing/tickers/?tickers=${get(token0Atom).symbol}`)
//     return items[0].quote_rate
//   }else{
//     return null
//   }
// })

// export const token1PriceAtom = atom(async (get) =>{
//   if (typeof window !== "undefined"){
//     const {data:{data:{items}}} = await axios.get(`https://api.covalenthq.com/v1/pricing/tickers/?tickers=${get(token1Atom).symbol}`)
//     return items[0].quote_rate
//   }else{
//     return null
//   }
// })



// export const pairV2DataAtom = atomWithQuery((get)=>({
//   queryKey: ['pair_v2_data',Pair.getAddress(get(token0Atom),get(token1Atom))],
//   queryFn: async ()=>{
//     const [token0, token1] = get(token0Atom).sortsBefore(get(token1Atom)) ? tokens : [get(token1Atom), get(token0Atom)]
//     const address = Pair.getAddress(token0,token1)
//     console.log(address)
//     const data = await client.request(getPairPrice, {address})
//     return data
//   }
// }))


// export const pairV2Atom = atomWithQuery((get)=>({
//   queryKey: ['pair_v2_data',Pair.getAddress(get(token0Atom),get(token1Atom))],
//   queryFn: async ()=>{
//     const pair = await Fetcher.fetchPairData(get(token0Atom),get(token1Atom))
//     return pair
//   }
// }))

// export const uniswapV2BalanceAtom = atom(async (get) =>{
//   if (typeof window !== "undefined" && get(accountAtom)){
//     const {data:{data}} = await axios.get(`https://api.covalenthq.com/v1/1/address/${get(accountAtom)}/stacks/uniswap_v2/balances/?key=ckey_3f9a70622146474385e91bfc74a`)
//     return data?.uniswap_v2?.balances
//   }else{
//     return []
//   }
// })



// type FruitMarket = {
//   marketA: number;
//   marketB: number;
// }

// const pricesAtom = atom({
//   apple: atom({
//     marketA: 15,
//     marketB: 12
//   }),
//   orange: atom({
//     marketA: 12,
//     marketB: 10
//   }),
//   pineapple: atom({
//     marketA: 20,
//     marketB: 25
//   }),
// })

// const selectetPriceNameAtom = atom<string>('apple')

// const selectedPriceAtom = atom(
//   (get)=>get(get(pricesAtom)[get(selectetPriceNameAtom)]),
//   (get,set,newPrice) => {
//     const priceAtom = get(pricesAtom)[get(selectetPriceNameAtom)]
//     set(priceAtom, newPrice);
//   }
// )

// const marketA_Atom = focusAtom(selectedPriceAtom, (optic)=>optic.prop('marketA'))


// const pricesAtom = atom([
//   atom({
//     fruit: 'apple',
//     marketA: 15,
//     marketB: 12
//   }),
//   atom({
//     fruit: 'orange',
//     marketA: 12,
//     marketB: 10
//   }),
//   atom({
//     fruit: 'pineapple',
//     marketA: 20,
//     marketB: 25
//   }),
// ])

// const selectedFruitAtom = atom<string>('apple')

// const selectedPriceAtom = atom(
//   (get)=>get(get(pricesAtom).find(a=>a.fruit === get(selectedFruitAtom))),
//   (get,set,update) => {
//     const priceAtom = get(pricesAtom).find(a=>a.fruit === get(selectedFruitAtom))
//     set(priceAtom, update);
//   }
// )

// const marketA_Atom = focusAtom(selectedPriceAtom, (optic)=>optic.prop('marketA'))


// export const token0Atom = atom<TokenInfo>(USDC)



// export const token0AmountAtom = atomWithDefault((get)=> INITIAL_DEPOSIT_VALUE / 2 / get(token0PriceAtom) / get(ethPriceAtom))
// export const token1AmountAtom = atomWithDefault((get)=> INITIAL_DEPOSIT_VALUE / 2 / get(token1PriceAtom) / get(ethPriceAtom))


// export const tickLowerAtom = atom<Number>(0.10)
// export const tickUpperAtom = atom<Number>(10.0)



// export const selectedPairAtom = selectAtom<Pair>(pairsAtom, selectedPairIdAtom)

// export const rangeMaxAtom = atomWithLocalStorageAndDefault('rangeMax',(get)=>{
//   const p0 = get(priceV2Atom)
//   const dynamicMax = get(strategiesReadOnlyAtom).map(s=> s.positions.filter(p=>p.type==='uniswap_v3_lp').map(p=>p?.tickUpper)).flat().reduce((a,b)=> a<b?b:a,1)* 1.2 * p0
//   return Math.max(p0 * 2, dynamicMax)
// })
// export const rangeMinAtom = atomWithLocalStorageAndDefault('rangeMin',(get)=>{
//   const p0 = get(priceV2Atom)
//   const dynamicMin = get(strategiesReadOnlyAtom).map(s=> s.positions.filter(p=>p.type==='uniswap_v3_lp').map(p=>p?.tickLower)).flat().reduce((a,b)=> a>b?b:a,1)* 0.1 * p0
//   return Math.min(p0 * 1/2, dynamicMin)
// })


// export const filteredPositionsAtom =atom(
//   (get)=>{
//     const selectedPair = get(spair)
//     const positions = get(positionsAtom)
//     return positions.filter(posAtom => get(posAtom).pairId === selectedPair.id)
//   }
// )

// export const targetStrategyIdAtom = atomWithLocalStorage('targetStrategyId','defaultStrategy1')
// export const baseStrategyIdAtom = atomWithLocalStorage('baseStrategyId','defaultStrategy2')
