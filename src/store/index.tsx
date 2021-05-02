import { atom, useAtom } from 'jotai'
import { atomWithQuery } from 'jotai/query'
import { LiquidityPositionsDocument} from '../generated/graphql'
import {GraphQLClient} from "graphql-request";
import dynamic from 'next/dynamic';
import {atomWithLocalStorage} from '../utils/jotai_helper'
import axios from "axios"

const prefix = 'uniswap_simulator_'

// const endpoint = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2"
// const client = new GraphQLClient(endpoint)

export const accountAtom = atomWithLocalStorage(prefix+'account',null)
export const accountsAtom = atomWithLocalStorage(prefix+'accounts',[])
export const poolAtom = atomWithLocalStorage(prefix+'pool',null)
export const token0Atom = atom(1)
export const token1Atom = atom(1)
export const priceRangeMinAtom = atom(0.1)
export const priceRangeMaxAtom = atom(1)

export const uniswapV2BalanceAtom = atom(async (get) =>{
  if (typeof window !== "undefined" && get(accountAtom)){
    const {data:{data}} = await axios.get(`https://api.covalenthq.com/v1/1/address/${get(accountAtom)}/stacks/uniswap_v2/balances/?key=ckey_3f9a70622146474385e91bfc74a`)
    return data?.uniswap_v2?.balances
  }else{
    return []
  }
})