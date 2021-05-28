import { atom, useAtom , Atom, WritableAtom} from 'jotai'
import { atomWithDefault, atomFamily} from 'jotai/utils'
import { focusAtom } from 'jotai/optics'
import { atomWithQuery } from 'jotai/query'
import { LiquidityPositionsDocument} from '../generated/graphql'
import {GraphQLClient} from "graphql-request";
import dynamic from 'next/dynamic';
import {atomWithLocalStorage, atomWithLocalStorageAndDefault} from '../utils/jotai_helper'
import axios from "axios"
import {DEFAULT_ACTIVE_LIST_URLS} from '../constants/tokenLists'
import {getTokenList} from '../utils/getTokenLists'
import {listTokens, getPairPrice, getEthPrice} from '../docments'
import { ChainId, } from '@uniswap/sdk'
import { nanoid } from 'nanoid'


export type LpPosition = {
  id:string;
  type: string;
  name: string;
  depositValue: number;
  tickUpper: number;
  tickLower: number;
  depositPrice: number;
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

export class TokenInfo {
  public readonly logoURI;
  public readonly chainId
  public readonly address
  public readonly decimals
  public readonly symbol : string
  public readonly name :string
  constructor(chainId, address, decimals, symbol, name, logoURI){
    this.chainId = chainId;
    this.address = address;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name= name;
    this.logoURI = logoURI;
  }
}

const format = (x: number) => Number(x.toPrecision(6))

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

export const convertToTokenInfo = token => new TokenInfo(1,token.address, token.decimals,token.symbol,token.name,token.logoURI)


export const ETH = new TokenInfo(ChainId.MAINNET, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",18,"ETH","Ether", "https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627")
export const USDC = new TokenInfo(ChainId.MAINNET,  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", 6, "USDC", "USD Coin", "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389")

const prefix = 'uniswap_simulator_'

const endpoint = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2"
const client = new GraphQLClient(endpoint)

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

// export const defaultPair = atomWithLocalStorage<Atom<Pair>>('firstPairId',{
//     id: 'firstPairId',
//     token0: ETH,
//     token1: USDC,
//   })

export const defaultLpPosition = atomWithLocalStorage('firstPositionLpId',{
    id: 'firstPositionLpId',
    type: 'uniswap_v3_lp',
    name: 'Moderate Range',
    depositValue : 100000,
    tickUpper: 2.5,
    tickLower: 0.4,
  }
)
export const defaultHodlPosition1 = atomWithLocalStorage<HodlPosition>('firstPositionHodlId',{
    id: 'firstPositionHodlId',
    type: 'hodl',
    name: '100:0 HODL',
    token0Value: 100000,
    token1Value: 0,
  }
)
export const defaultHodlPosition2 = atomWithLocalStorage<HodlPosition>('secondPositionHodlId',{
    id: 'secondPositionHodlId',
    type: 'hodl',
    name: '50:50 HODL',
    token0Value: 50000,
    token1Value: 50000,
  }
)

export const positionsAtom = atomWithLocalStorage<Atom<LpPosition | HodlPosition>[]>('positions_atom',[defaultLpPosition,defaultHodlPosition1,defaultHodlPosition2])

export const createNewLpPositionAtom = atom(null,
  (get,set) =>{
    const id = nanoid()
    set(positionsAtom,([
      ...get(positionsAtom), atomWithLocalStorage<LpPosition>(id, {
        id, 
        name: `Position ${get(positionsAtom).length+1}`,
        type: 'uniswap_v3_lp',
        depositValue : 100000,
        tickUpper: 2.5,
        tickLower: 0.4, 
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
    const id = nanoid()
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
    const id = nanoid();
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

export const defaultStrategy1 = atomWithLocalStorage<Strategy>('defaultStrategy1',
  {
    id: 'defaultStrategy1',
    name: 'Moderate Range Strategy',
    totalDeposit: null,
    positions: { 
      'firstPositionLpId': 1
    },
    token0: ETH,
    token1: USDC,
  },
)
export const defaultStrategy2 = atomWithLocalStorage<Strategy>('defaultStrategy2',
  {
    id: 'defaultStrategy2',
    name: '50:50 HODL',
    totalDeposit: null,
    positions: { 
      'secondPositionHodlId': 1
    },
    token0: ETH,
    token1: USDC,
  },
)
export const defaultStrategy3 = atomWithLocalStorage<Strategy>('defaultStrategy3',
  {
    id: 'defaultStrategy3',
    name: '100:0 HODL',
    totalDeposit: null,
    positions: { 
      'firstPositionHodlId': 1
    },
    token0: ETH,
    token1: USDC,
  },
)
export const strategiesAtom = atomWithLocalStorage<Atom<Strategy>[]>('strategiesAtom',[defaultStrategy1,defaultStrategy2,defaultStrategy3])
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
export const selectedPositionAtom = selectAtom<LpPosition | HodlPosition>(positionsAtom, selectedPositionIdAtom)
export const selectedStrategyAtom = selectAtom<Strategy>(strategiesAtom, selectedStrategyIdAtom)

export const token0Atom = atom((get)=>get(selectedStrategyAtom).token0)
export const token1Atom = atom((get)=>get(selectedStrategyAtom).token1)

// export const targetStrategyIdAtom = atomWithLocalStorage('targetStrategyId','defaultStrategy1')
// export const baseStrategyIdAtom = atomWithLocalStorage('baseStrategyId','defaultStrategy2')

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
  return Object.fromEntries(get(topCoinListsAtom).map(token => [token.id, token.derivedETH]))
})

export const slideDirectionAtom = atomWithLocalStorage('slideDirection','right')

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