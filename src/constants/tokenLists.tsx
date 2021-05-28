const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const UMA_LIST = 'https://umaproject.org/uma.tokenlist.json'
// const AAVE_LIST = 'tokenlist.aave.eth'
// const SYNTHETIX_LIST = 'synths.snx.eth'
// const WRAPPED_LIST = 'wrapped.tokensoft.eth'
const SET_LIST = 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json'
const OPYN_LIST = 'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-v1.tokenlist.json'
const ROLL_LIST = 'https://app.tryroll.com/tokens.json'
const COINGECKO_LIST = 'https://tokens.coingecko.com/uniswap/all.json'
// const CMC_ALL_LIST = 'defi.cmc.eth'
// const CMC_STABLECOIN = 'stablecoin.cmc.eth'
// const KLEROS_LIST = 't2crtokens.eth'
const GEMINI_LIST = 'https://www.gemini.com/uniswap/manifest.json'
const MYCRYPT_LIST = "https://uniswap.mycryptoapi.com/"

export const DEFAULT_ACTIVE_LIST_URLS: string[] = [COINGECKO_LIST]

export const LIST_OF_LISTS: string[] = [
  COMPOUND_LIST,
  UMA_LIST,
  SET_LIST,
  OPYN_LIST,
  ROLL_LIST,
  COINGECKO_LIST,
  GEMINI_LIST,
]