import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { Token } from '@uniswap/sdk-core'
import {ChainId} from '@uniswap/sdk'
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<{[chainId in ChainId | number]: Readonly<{[tokenAddress: string]: {token: WrappedTokenInfo, list: TokenList}}>}>

const EMPTY_LIST: TokenAddressMap = {
  [ChainId.KOVAN]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.ROPSTEN]: {},
  [ChainId.GÖRLI]: {},
  [ChainId.MAINNET]: {},
}

// const listCache: WeakMap<TokenList, TokenAddressMap> | null = typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export const listToTokenMap = (list: TokenList):TokenAddressMap =>{
  const map = list.tokens.reduce((tokenMap, tokenInfo) =>{
    const tags: TagInfo[] = tokenInfo.tags?.map((tagId)=> list.tags?.[tagId] ? {...list.tags[tagId], id: tagId} : undefined)?.filter((x): x is TagInfo => Boolean(x)) ?? []
    const token = new WrappedTokenInfo(tokenInfo, tags)
    if (tokenMap[token.chainId][token.address] !== undefined) {
      console.error(new Error(`Duplicate token! ${token.address}`))
      return tokenMap
    }
    return {
      ...tokenMap,
      [token.chainId]: {
        ...tokenMap[token.chainId as ChainId],
        [token.address]: {
          token,
          list: list,
        },
      },
    }
  }, {...EMPTY_LIST})
  return map
}

const TRANSFORMED_DEFAULT_TOKEN_LIST = listToTokenMap(DEFAULT_TOKEN_LIST)