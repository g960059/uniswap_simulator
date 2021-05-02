import React from 'react';
import {Table,TableBody,TableHead,TableCell as MuiTableCell,TableRow,Avatar,Typography,Stack} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {useAtom} from 'jotai'
import {poolAtom, token0Atom,token1Atom} from '../store/index'


const TableCell = withStyles({
  root: {
    borderBottom: "none"
  }
})(MuiTableCell);

const InfoBox = () =>{
  const [pool] = useAtom(poolAtom)
  const [token0] = useAtom(token0Atom);
  const [token1] = useAtom(token1Atom);
  
  if(!pool) return null
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <MuiTableCell/>
          <MuiTableCell>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Avatar sx={{ width: 21, height: 21 }} src={pool.token_0.logo_url}>{pool.token_0.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
              <Typography variant='subtitle2'>{pool?.token_0?.contract_ticker_symbol}</Typography> 
            </Stack>
          </MuiTableCell>
          <MuiTableCell>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Avatar sx={{ width: 21, height: 21 }} src={pool.token_1.logo_url}>{pool.token_1.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
              <Typography variant='subtitle2'>{pool?.token_1?.contract_ticker_symbol}</Typography> 
            </Stack>
          </MuiTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th" scope="row">Weight</TableCell>
          <TableCell align='center'>{Math.round(pool.token_0.quote/(pool.token_0.quote+pool.token_1.quote)*100)}%</TableCell>
          <TableCell align='center'>{Math.round(pool.token_1.quote/(pool.token_0.quote+pool.token_1.quote)*100)}%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th" scope="row">Deposit Value</TableCell>
          <TableCell align='center'>${Math.round(pool.token_0.quote).toLocaleString()}</TableCell>
          <TableCell align='center'>${Math.round(pool.token_1.quote).toLocaleString()}</TableCell>
        </TableRow>     
        <TableRow>
          <TableCell component="th" scope="row">Current Price</TableCell>
          <TableCell align='center'>${Number(Number(pool.token_0.quote_rate).toPrecision(4)).toLocaleString()}</TableCell>
          <TableCell align='center'>${Number(Number(pool.token_1.quote_rate).toPrecision(4)).toLocaleString()}</TableCell>
        </TableRow>   
        <TableRow>
          <TableCell component="th" scope="row">Simulated Price</TableCell>
          <TableCell align='center'>${Number(Number(pool.token_0.quote_rate*token0).toPrecision(4)).toLocaleString()}</TableCell>
          <TableCell align='center'>${Number(Number(pool.token_1.quote_rate*token1).toPrecision(4)).toLocaleString()}</TableCell>
        </TableRow>                                                                         
      </TableBody>
    </Table>
  )
}

export default InfoBox