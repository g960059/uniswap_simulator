import React,{ useMemo} from 'react';
import {Stack, Box,  Typography, Grid} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { token0Atom, token1Atom,  ethPriceAtom, token1PriceAtom,token0PriceAtom, selectedPositionAtom} from '../store/index'
import {FiberManualRecord} from '@material-ui/icons'
import {withStyles} from '@material-ui/core/styles';


const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })

const green = "#27AE60"


const LiquidityInfoBox = React.memo(() =>{
  const token0 = useAtomValue(token0Atom)
  const token1 = useAtomValue(token1Atom)
  const token1Price = useAtomValue(token1PriceAtom)
  const token0Price = useAtomValue(token0PriceAtom)

  const {tickLower: m , tickUpper:M, depositValue} = useAtomValue(selectedPositionAtom)


  const efficancy =useMemo(()=> (1 < m || M <1) ? 0 : 2/(2 - Math.sqrt(m)- 1 / Math.sqrt(M)), [m,M]) 
  const minEfficancy = useMemo(()=>1 / (1- (m / M)**(1 / 4)), [m,M])

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

  return (
    <Box p={1} sx={{backgroundColor:'#f1f5f9', mx:-2, mb:2, px:1, py:2,mt:3}}>
      <Typography variant='subtitle1' sx={{ml:1}}>Position Summary</Typography>
      <Grid container justifyContent="center" alignItems="flex-start">
        <Grid item xs={6}>
          <Box pl={1}>
            <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', mt:1, mb:1.5}}><FiberManualRecord fontSize="small" style={{color: green}}/>V3 Range Position</Typography>
            <Typography variant='caption'>Capital Required</Typography>
            <Typography variant='h5' style={{color:green}}>${formatter.format(depositValue)}</Typography>
            <Typography variant='caption'>Deposit ratio ({token0.symbol}:{token1.symbol})</Typography>
            <Typography variant='h5' style={{color:green}}>{deposit_ratio}</Typography>                  
            <Typography variant='caption'>Current fees per $ vs. V2</Typography>
            <Typography variant='h5' style={{color:green}}>{minEfficancy.toPrecision(3)}x </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', mt:1, mb:1.5}}><FiberManualRecord fontSize="small" style={{color: 'gray'}}/>V2 Range Position</Typography>
            <Typography variant='caption'>Capital Required</Typography>
            <Typography variant='h5'>${formatter.format(depositValue * efficancy).toLocaleString()}</Typography>
            <Typography variant='caption'>Deposit ratio ({token0.symbol}:{token1.symbol})</Typography>
            <Typography variant='h5'>50 : 50</Typography>
          </Box>
        </Grid>
      </Grid>          
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
