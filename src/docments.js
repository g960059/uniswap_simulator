export const LiquidityPositionsDocument = `
  query liquidityPositions($account: Bytes!) {
    user(id: $account) {
      liquidityPositions {
        id
        liquidityTokenBalance
        pair {
          token0 {
            id
            symbol
            name
            decimals
            derivedETH
          }
          token1 {
            id
            symbol
            name
            decimals
            derivedETH
          }
          reserve0
          reserve1
          token0Price
          token1Price
          volumeToken0
          volumeToken1
          reserveUSD
          reserveETH
          volumeUSD
          totalSupply
          createdAtTimestamp
        }
      }
    }
  }
`;

export const listTokens = `
  query {
    tokens(orderBy:tradeVolumeUSD,orderDirection:desc,first:100){
      id
      symbol    
      name
      derivedETH
    }
}`

export const getPairPrice = `
  query getPairPrice($address: Bytes!){
    pair(id: $address){
      id
      token0{
        symbol
      }
      token1{
        symbol
      }
      token0Price
      token1Price
    }
  }
`

export const getEthPrice = `
  query {
    bundles{
      ethPrice
    }    
  }
`