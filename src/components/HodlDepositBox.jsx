import React,{ useMemo} from 'react';
import {Stack, Box, TextField, OutlinedInput, InputAdornment, Button, Avatar, Typography} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { token0Atom, token1Atom,  ethPriceAtom,token0PriceAtom, token1PriceAtom, selectedPositionAtom} from '../store/index'
import ReactiveInput from './ReactiveInput'

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
      <Box py={2}>
        <Typography variant='subtitle2' color='text.secondary'>Total deposit value: ~${formatter.format(depositValue)}</Typography>
        <Stack direction='row' spacing={2} sx={{mt:1}}>
          <ReactiveInput 
            value = {Number(Number(token0Amount).toPrecision(4))}  
            updateValue={(value)=>{setPosition(old=>({...old, token0Value: value * token0Price * ethPrice}))}} 
            type = 'text'
            variant='standard'
            startAdornment={<InputAdornment position='start'><Avatar sx={{ width: 21, height: 21,mr:1 }} src={token0.logoURI}/>{token0.symbol}</InputAdornment> }
            fullWidth
            required
            size='small'
            sx={{pl:1}}
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
          />
          <ReactiveInput 
            value = {Number(Number(token1Amount).toPrecision(4))}  
            updateValue={(value)=>{setPosition(old=>({...old, token1Value: value * token1Price * ethPrice}))}} 
            type = 'text'
            variant='standard'
            startAdornment={<InputAdornment position='start'><Avatar sx={{ width: 21, height: 21,mr:1 }} src={token1.logoURI}/>{token1.symbol}</InputAdornment> }
            fullWidth
            required
            size='small'
            sx={{pl:1}}
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
          /> 
        </Stack>        
        <Stack direction='row' spacing={2} sx={{mt:1}}>
          <ReactiveInput 
            value = {Number(Number(token0Value).toPrecision(4))}  
            updateValue={(value)=>{setPosition(old=>({...old, token0Value: value}))}} 
            type = 'text'
            variant='standard'
            startAdornment={<InputAdornment position='start'>$</InputAdornment>  }
            fullWidth
            required
            size='small'
            sx={{pl:1}}
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
          />           
          <ReactiveInput 
            value = {Number(Number(token1Value).toPrecision(4))}  
            updateValue={(value)=>{setPosition(old=>({...old, token1Value: value}))}} 
            type = 'text'
            variant='standard'
            startAdornment={<InputAdornment position='start'>$</InputAdornment>  }
            fullWidth
            required
            size='small'
            sx={{pl:1}}
            inputProps ={{min: 0, style: { textAlign: 'right' }}}
          />   
        </Stack>
      </Box>
    </Box>
  )
})

export default HodlDepositBox