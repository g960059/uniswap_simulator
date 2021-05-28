import React,{ useMemo} from 'react';
import {Stack, Box, TextField, OutlinedInput, InputAdornment, Button, Avatar, Typography} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { token0Atom, token1Atom,  ethPriceAtom,token0PriceAtom, token1PriceAtom, selectedPositionAtom} from '../store/index'

const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const format = (x) => Number(x.toPrecision(6))

const HodlDepositBox = React.memo(() =>{
  const token0 = useAtomValue(token0Atom)
  const token1 = useAtomValue(token1Atom)
  const token0Price = useAtomValue(token0PriceAtom)
  const token1Price = useAtomValue(token1PriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)  
  const p = token0Price / token1Price

  const [position,setPosition] = useAtom(selectedPositionAtom)
  const token0Value = position?.token0Value || 0
  const token1Value = position?.token1Value || 0


  const depositValue = Number(token0Value) + Number(token1Value);

  const token0Amount = token0Value / token0Price / ethPrice
  const token1Amount = token1Value / token1Price / ethPrice
  
  console.log(position)
  return (
    <Box p={2}>
      <Typography variant='subtitle1' sx={{mb:1}}><strong>Hodl Position</strong></Typography>
      <Box p={2} sx={{bgcolor: 'white', borderRadius: 5, border:1, borderColor: 'grey.300'}}>
        <Typography variant='subtitle2' color='text.secondary'>Total deposit value: ~${formatter.format(depositValue)}</Typography>
        <Stack direction='row' spacing={2} sx={{mt:1}}>
          <TextField 
            value={Number(Number(token0Amount).toPrecision(4))} 
            onChange={e=>setPosition(old=>({...old, token0Value: e.target.value * token0Price * ethPrice}))} 
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
            InputProps={{
              startAdornment:<InputAdornment position='start'><Avatar sx={{ width: 21, height: 21,mr:1 }} src={token0.logoURI}/>{token0.symbol}</InputAdornment> 
            }}
            fullWidth
            size='small'
            sx={{'& .MuiFormHelperText-root':{textAlign:'right', marginRight:1}}}
            required
          />
          <TextField 
            value={Number(Number(token1Amount).toPrecision(4))} 
            onChange={e=>setPosition(old=>({...old, token1Value: e.target.value * token1Price * ethPrice}))} 
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
            InputProps={{
              startAdornment:<InputAdornment position='start'><Avatar sx={{ width: 21, height: 21,mr:1 }} src={token1.logoURI}/>{token1.symbol}</InputAdornment>
            }}
            fullWidth
            size='small'
            sx={{'& .MuiFormHelperText-root':{textAlign:'right', marginRight:1}}}
            required
          />      
        </Stack>        
        <Stack direction='row' spacing={2} sx={{mt:1}}>
          <TextField 
            value={Number(Number(token0Value).toPrecision(4))}
            variant = 'standard' 
            onChange={e=>setPosition(old=>({...old, token0Value: e.target.value}))} 
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
            InputProps={{
              endAdornment:<InputAdornment position='end'>USD</InputAdornment> 
            }}
            size='small'
            sx={{'& .MuiFormHelperText-root':{textAlign:'right', marginRight:1}}}
            required
          />
          <TextField 
            value={Number(Number(token1Value).toPrecision(4))} 
            variant = 'standard' 
            onChange={e=>setPosition(old=>({...old, token1Value: e.target.value}))} 
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
            InputProps={{
              endAdornment:<InputAdornment position='end'>USD</InputAdornment> 
            }}
            size='small'
            sx={{'& .MuiFormHelperText-root':{textAlign:'right', marginRight:1}}}
            required
          />      
        </Stack>
      </Box>
    </Box>
  )
})

export default HodlDepositBox