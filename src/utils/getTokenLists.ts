import { TokenList } from '@uniswap/token-lists'

export async function getTokenList(url: string): Promise<TokenList> {
  let response
  try {
    response = await fetch(url)
  } catch (error) {
    console.debug('Failed to fetch list', url, error)
  }

  const json = await response.json()
  return json
}