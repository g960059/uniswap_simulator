import React from 'react';
import {Box,Table,TableBody,Grid,TableHead,TableCell as MuiTableCell,TableRow,Paper,Divider,Avatar,Typography,Hidden,OutlinedInput, Slider, CardContent, Stack, FormControl, DialogTitle,DialogActions,DialogContent,DialogContentText,Button, TextField} from '@material-ui/core';
import {useAtom} from 'jotai'
import {poolAtom, token0Atom,token1Atom} from '../store/index'



const PriceSimulationBox = ()=>{
  const [pool] = useAtom(poolAtom)
  const [token0, setToken0] = useAtom(token0Atom);
  const [token1, setToken1] = useAtom(token1Atom);
  
  if(!pool) return null
  return <>
    <Paper sx={{p:2,m:1,mt:3,pb:3}} variant='outlined'>
      <Typography variant='h6'>Simulation Box</Typography>
      <Stack sx={{mt:2}}>
        <Grid container spacing={1} alignItems='center' justifyContent='center'>
          <Grid item xs={3}>
            <Stack direction='row' spacing={1} alignItems='center' justifyContent='center' >
              <Avatar sx={{ width: 21, height: 21 }} src={pool.token_0.logo_url}>{pool.token_0.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
              <Typography variant='subtitle2'>{pool?.token_0?.contract_ticker_symbol}</Typography> 
            </Stack>
          </Grid>
          <Grid item xs={2}>
            <OutlinedInput value={token0} onChange={e=>{setToken0(e.target.value)}} size="small" sx={{width: 60}}/>
          </Grid>
          <Grid item xs={7}>
            <Stack direction='row' spacing={1}  alignItems='center' justifyContent='center' sx={{pl:1}}>
              <Typography>x0.01</Typography> 
              <Slider 
              value={Math.log10(token0)} 
              onChange={(e,newValue)=>{if(newValue>1){setToken0(Math.round(10**newValue))}else{setToken0(Number(10**newValue).toFixed(2))}}} 
              step={0.01} min={-2} max={2} 
              />
              <Typography sx={{pl:.5}}>x100</Typography> 
            </Stack>
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems='center' justifyContent='center' sx={{mt:2}}>
          <Grid item xs={3}>
            <Stack direction='row' spacing={1} alignItems='center' justifyContent='center'>
              <Avatar sx={{ width: 21, height: 21 }} src={pool.token_1.logo_url}>{pool.token_1.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
              <Typography variant='subtitle2'>{pool?.token_1?.contract_ticker_symbol}</Typography> 
            </Stack>
          </Grid>
          <Grid item xs={2}>
            <OutlinedInput value={token1} onChange={e=>{setToken1(e.target.value)}} size="small" sx={{width: 60}}/>
          </Grid>
          <Grid item xs={7}>
            <Stack direction='row' spacing={1}  alignItems='center' justifyContent='center' sx={{pl:1}}>
              <Typography>x0.01</Typography> 
              <Slider 
              value={Math.log10(token1)} 
              onChange={(e,newValue)=>{if(newValue>1){setToken1(Math.round(10**newValue))}else{setToken1(Number(10**newValue).toFixed(2))}}} 
              step={0.01} min={-2} max={2} 
              />
              <Typography sx={{pl:.5}}>x100</Typography> 
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Typography variant='subtitle1' sx={{pt:2}}>Select price range</Typography>
    </Paper>
  </>
}

export default PriceSimulationBox