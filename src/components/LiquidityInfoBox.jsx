import React,{ useMemo, useEffect, useState} from 'react';
import {Stack, Box,  Typography, Grid} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { token0Atom, token1Atom,  ethPriceAtom, token1PriceAtom,token0PriceAtom, selectedPositionAtom, getLiquidityForAmountsVariant, convertToTokenInfo} from '../store/index'
import {FiberManualRecord} from '@material-ui/icons'
import {GraphQLClient} from "graphql-request";
import {withStyles} from '@material-ui/core/styles';
import {getPoolDayData} from '../docments'
import {computePoolAddress, FACTORY_ADDRESS,FeeAmount} from '@uniswap/v3-sdk'
import dayjs from 'dayjs'


const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const formatter3 = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 3 })

const green = "#27AE60"
const clientV3 = new GraphQLClient('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-alt')

const LiquidityInfoBox = React.memo(() =>{
  const [poolData, setPoolData] = useState();
  const [fees0, setFees0] = useState();
  const [fees1, setFees1] = useState();
  const [isPoolExisted, setIsPoolExisted] = useState(false);
  const token0 = convertToTokenInfo(useAtomValue(token0Atom))
  const token1 = convertToTokenInfo(useAtomValue(token1Atom))
  const token1Price = useAtomValue(token1PriceAtom)
  const token0Price = useAtomValue(token0PriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const {tickLower: m , tickUpper:M, depositValue, feeAmount} = useAtomValue(selectedPositionAtom)
  const depositAmount = depositValue / ethPrice / token1Price
  const meanDecimals = (token0.decimals + token1.decimals)/2

  const efficancy =useMemo(()=> (1 < m || M <1) ? 0 : 2/(2 - Math.sqrt(m)- 1 / Math.sqrt(M)), [m,M]) 
  const minEfficancy = useMemo(()=>Math.min(1/(1-(m/M)**(1/4)),4000), [m,M])

  const deposit_ratio = useMemo(()=>{
    if (M <= 1){
      return '0 : 100'
    }else if( m >= 1){
      return '100 : 0'
    }else{
      const x0 = 1 - 1 / Math.sqrt(M)
      const y0 = 1 - Math.sqrt(m)
      if(x0  <= y0){
        const r = Math.round((x0/(x0+y0))*100)
        return  r + ' : ' + (100 - r)
      }else{
        const r = Math.round((y0/(x0+y0))*100)
        return (100-r) + ' : ' + r
      }      
    }
  },[m,M])

  const getAveratePoolData = (poolDataType, window) =>{
    if(!poolData) return null
    return poolData.slice(1,window+1).reduce((acc,c)=>acc+Number(c[poolDataType]),0)/window
  }

  const aggregatePoolData = async()=>{
    let liquidity = 0
    setIsPoolExisted(false)
    const poolAddress = computePoolAddress({factoryAddress: FACTORY_ADDRESS, tokenA:token0, tokenB:token1, fee: feeAmount}).toLowerCase()
    const {poolDayDatas} = await clientV3.request(getPoolDayData, {poolAddress})
    const formattedData = poolDayDatas.map(d => ({...d,date: dayjs.unix(d.date).format()}))
    if(formattedData && formattedData.length > 14){
      setIsPoolExisted(true)
      if(token0.sortsBefore(token1)){
        const p = token0Price / token1Price
        liquidity = getLiquidityForAmountsVariant(p,m,M,depositValue / ethPrice / token1Price)
        const fees0 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal0X128)-Number(formattedData[i].feeGrowthGlobal0X128)) * liquidity / (2**128) * 10**(meanDecimals -token0.decimals)])))
        const fees1 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal1X128)-Number(formattedData[i].feeGrowthGlobal1X128)) * liquidity / (2**128) * 10**(meanDecimals -token1.decimals)])))
        setFees0(fees0)
        setFees1(fees1)
        setPoolData(formattedData)
      }else{
        const p = token1Price / token0Price
        liquidity = getLiquidityForAmountsVariant(p,1/M,1/m,depositValue / ethPrice / token0Price)
        const fees1 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal0X128)-Number(formattedData[i].feeGrowthGlobal0X128)) * liquidity / (2**128) * 10**(meanDecimals -token1.decimals)])))
        const fees0 = Object.fromEntries(([3,7,14]).map(i=>([i,(Number(formattedData[0].feeGrowthGlobal1X128)-Number(formattedData[i].feeGrowthGlobal1X128)) * liquidity / (2**128) * 10**(meanDecimals -token0.decimals)])))   
        setFees0(fees0)
        setFees1(fees1)
        setPoolData(formattedData)
      }
    }
  }
  useEffect(() => {
    if(token0 != undefined && token1 != undefined){
      aggregatePoolData()
    }
  }, [feeAmount,m,M,depositValue]);
  
  return (
    <Box p={1} sx={{backgroundColor:'#f1f5f9', mx:-2, mb:2, px:1, py:2,mt:3, color:'slategrey'}}>
      <Box>
        <Typography variant='subtitle1' sx={{ml:1,fontWeight:600}}>Position Summary</Typography>
        <Grid container justifyContent="center" alignItems="flex-start">
          <Grid item xs={6}>
            <Box pl={1}>
              <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', mt:1, mb:1}}><FiberManualRecord fontSize="small" style={{color: green}}/>V3 Range Position</Typography>
              <Typography variant='caption'>Capital Required</Typography>
              <Typography variant='h5' style={{color:green}}>${formatter.format(depositValue)}</Typography>
              <Typography variant='caption'>Deposit ratio ({token0.symbol}:{token1.symbol})</Typography>
              <Typography variant='h5' style={{color:green}}>{deposit_ratio}</Typography>                  
              <Typography variant='caption'>Current fees per $ vs. V2</Typography>
              <Typography variant='h5' style={{color:green}}>{formatter3.format(minEfficancy)}x </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', mt:1, mb:1}}><FiberManualRecord fontSize="small" style={{color: 'gray'}}/>V2 Range Position</Typography>
              <Typography variant='caption'>Capital Required</Typography>
              <Typography variant='h5'>${formatter.format(depositValue * efficancy).toLocaleString()}</Typography>
              <Typography variant='caption'>Deposit ratio ({token0.symbol}:{token1.symbol})</Typography>
              <Typography variant='h5'>50 : 50</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {
        isPoolExisted ? <>
          <Box pt={2}>
            <Typography variant='subtitle1' sx={{ml:1,fontWeight:600}}>Estimated Fee</Typography>
            <Typography variant='body2' sx={{ml:1}}>(The same liquidity was provided / Price was always in LP Range)</Typography>
            <Grid container justifyContent="center" alignItems="flex-start">
              <Grid item xs={6}>
                <Box pl={1}>
                  <Typography variant='caption'>{token0.symbol} fees (7Day)</Typography>
                  <Typography variant='h5'>$ {fees0 && formatter.format(fees0[7])}</Typography> 
                  <Typography variant='caption'>{token1.symbol} fees (7Day)</Typography>
                  <Typography variant='h5'>$ {fees1 && formatter.format(fees1[7])}</Typography>    
                  <Typography variant='caption'>APY (Avg. 7Day)</Typography>
                  <Typography variant='h5'>{fees1 && fees0 && formatter.format((fees1[7] + fees0[7] * token0Price / token1Price)/depositAmount/7*365*100)} %</Typography>                           
                </Box> 
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant='caption'>{token0.symbol} fees (14Day)</Typography>
                  <Typography variant='h5'>$ {fees0 && formatter.format(fees0[14])}</Typography> 
                  <Typography variant='caption'>{token1.symbol} fees (14Day)</Typography>
                  <Typography variant='h5'>$ {fees1 &&formatter.format(fees1[14])}</Typography>    
                  <Typography variant='caption'>APY (Avg. 14Day)</Typography>
                  <Typography variant='h5'>{fees1 && fees0 && formatter.format((fees1[14] + fees0[14] * token0Price / token1Price)/depositAmount/14*365*100)} %</Typography>              
                </Box> 
              </Grid>          
            </Grid>
          </Box>      
          <Box pt={2}>
            <Typography variant='subtitle1' sx={{ml:1,fontWeight:600}}>Pool Info</Typography>
            <Grid container justifyContent="center" alignItems="flex-start">
              <Grid item xs={6}>
                <Box pl={1}>
                  <Typography variant='caption'>TVL(7Day Avg.)</Typography>
                  <Typography variant='h5'>$ {formatter.format(getAveratePoolData('tvlUSD',7))}</Typography> 
                  <Typography variant='caption'>Volume(7Day Avg.)</Typography>
                  <Typography variant='h5'>$ {formatter.format(getAveratePoolData('volumeUSD',7))}</Typography> 
                  <Typography variant='caption'>Total Fees(7Day Avg.)</Typography>
                  <Typography variant='h5'>$ {formatter.format(getAveratePoolData('feesUSD',7))}</Typography>                        
                </Box> 
              </Grid>
              <Grid item xs={6}>
                <Box>
                <Typography variant='caption'>TVL(14Day Avg.)</Typography>
                  <Typography variant='h5'>$ {formatter.format(getAveratePoolData('tvlUSD',14))}</Typography> 
                  <Typography variant='caption'>Volume(14Day Avg.)</Typography>
                  <Typography variant='h5'>$ {formatter.format(getAveratePoolData('volumeUSD',14))}</Typography> 
                  <Typography variant='caption'>Total Fees(14Day Avg.)</Typography>
                  <Typography variant='h5'>$ {formatter.format(getAveratePoolData('feesUSD',14))}</Typography>                            
                </Box> 
              </Grid>          
            </Grid>
          </Box>               
        </>: <>
          <Box pt={2}>
            <Typography variant='subtitle1' sx={{ml:1,fontWeight:600}}>Estimated Fee & Pool Info</Typography>
            <Box width='100%' display='flex' justifyContent='center'>
              <Typography variant='subtitle1' sx={{ml:1}}>Pool doesn't exist</Typography>
            </Box>
          </Box>
        </>
      }      
    </Box>
  )
})

export default LiquidityInfoBox


      // <Table size="small">
      //   <TableHead>
      //     <TableRow>
      //       <TableCell align='center' />
      //       <TableCell align='center' padding='none'>Capital Required</TableCell>
      //       <TableCell align='center' padding='none'>Deposit ratio ({token0.symbol}:{token1.symbol})</TableCell>
      //       <TableCell align='center' padding='none'>Fees per $ vs. V2</TableCell>
      //     </TableRow>
      //   </TableHead>
      //   <TableBody>
      //     <TableRow>
      //       <TableCell component="th" scope="row"align='center' ><Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center'}}><FiberManualRecord fontSize="small" style={{color: green}}/>V3 {isLgMd && <>Position</>}</Typography></TableCell>
      //       <TableCell align='center' padding='none'>
      //         <Typography variant='h5' style={{color:green}}>${formatter.format(depositValue)}</Typography>
      //       </TableCell>
      //       <TableCell align='center' padding='none'>
      //         <Typography variant='h5' style={{color:green}}>{deposit_ratio}</Typography>
      //       </TableCell>
      //       <TableCell align='center' padding='none'>
      //         <Typography variant='h5' style={{color:green}}>{efficancy.toPrecision(3)}x</Typography>
      //       </TableCell>
      //     </TableRow>
      //     <TableRow>
      //       <TableCell component="th" scope="row" align='center' ><Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', mt:2, mb:1.5}}><FiberManualRecord fontSize="small" style={{color: 'gray'}}/>V2 {isLgMd && <>Position</>}</Typography></TableCell>
      //       <TableCell align='center' padding='none'>
      //         <Typography variant='h5'>${formatter.format(depositValue * efficancy).toLocaleString()}</Typography>
      //       </TableCell>
      //       <TableCell align='center' padding='none'>
      //         <Typography variant='h5'>50 : 50</Typography>
      //       </TableCell>
      //       <TableCell align='center' padding='none'>
      //         <Typography variant='h5'>1.0x</Typography>
      //       </TableCell>
      //     </TableRow>                                                                           
      //   </TableBody>
      // </Table>    

//       const TableCell = withStyles({
//   root: {
//     borderBottom: "none"
//   }
// })(MuiTableCell);

        {/* <Typography variant='caption'>Fees per $ vs. V2 (at Range geometric mean price)</Typography> */}
