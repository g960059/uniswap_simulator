import React,{ useMemo} from 'react';
import {Stack, Box, TextField, OutlinedInput, InputAdornment, Button, Avatar, Typography} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { token0Atom, token1Atom,  ethPriceAtom,token0PriceAtom, token1PriceAtom, selectedPositionAtom} from '../store/index'
import ReactiveInput from './ReactiveInput'

const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const format = (x) => Number(x.toPrecision(6))

const DepositAmountInputs = React.memo(() =>{
  const token0 = useAtomValue(token0Atom)
  const token1 = useAtomValue(token1Atom)
  const token0Price = useAtomValue(token0PriceAtom)
  const token1Price = useAtomValue(token1PriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)  
  const p = token0Price / token1Price

  const [position,setPosition] = useAtom(selectedPositionAtom)
  const M = position.tickUpper;
  const m = position.tickLower;
  const depositAmount = position.depositValue / ethPrice / token1Price

  const getToken1Amount = () => {
    if(m<=1 && 1<=M) return format(depositAmount *((1-Math.sqrt(m))/(2-1/Math.sqrt(M) - Math.sqrt(m))))
    if(1 <= m) return 0
    if(M<= 1) return format(depositAmount)
  }
  const getToken0Amount = ()=>{
    if(m<=1 && 1<=M)  return format(getToken1Amount() * (1-1/Math.sqrt(M))/(1 - Math.sqrt(m)) / p) 
    if(1 <= m) return format(depositAmount / p)
    if(M<= 1) return 0   
  } 

  const setToken1Amount = (newAmount) =>{
    if(m <= 1 && 1<= M) setPosition(oldPosition => ({...oldPosition, depositValue:  newAmount * (2-1/Math.sqrt(M) - Math.sqrt(m))/ (1- Math.sqrt(m)) * ethPrice * token1Price}))
    if(M <= 1) setPosition(oldPosition =>({...oldPosition, depositValue: newAmount  * ethPrice * token1Price }))
    if(1 <= m) throw Error('token1 amount should be 0') 
  }

  const setToken0Amount = (newAmount) => {
    if(m <= 1 && 1<= M) setToken1Amount(newAmount * (1 - Math.sqrt(m))/ (1- 1/Math.sqrt(M))*p)
    if(M <= 1) throw Error('token0 amount should be 0')
    if(1 <= m)  setPosition(oldPosition =>({...oldPosition, depositValue: newAmount * p * ethPrice * token1Price }))
  }
  

  return (
    <Box pt={1}>
      <Typography variant='subtitle2' color='text.secondary'>Token Amount</Typography>
      <Stack direction='row' spacing={2} >
        <ReactiveInput 
          value = {getToken0Amount()}  
          updateValue={value=>setToken0Amount(value)} 
          type = 'text'
          variant='standard'
          size='small'
          startAdornment={<InputAdornment><Avatar sx={{ width: 21, height: 21,mr:1 }} src={token0.logoURI}/>{token0.symbol}</InputAdornment>}
          sx={{ maxWidth:280,pl:.5}}
          inputProps ={{min:0, style: {textAlign: 'right'}}}
        />    
        <ReactiveInput 
          value = {getToken1Amount()}  
          updateValue={value=>setToken1Amount(value)} 
          type = 'text'
          variant='standard'
          size='small'
          startAdornment={<InputAdornment><Avatar sx={{ width: 21, height: 21,mr:1 }} src={token1.logoURI}/>{token1.symbol}</InputAdornment>}
          sx={{ maxWidth:280, ml:2,pl:.5}}
          inputProps ={{min:0,style: {textAlign: 'right'}}}
        />                      
      </Stack>
    </Box>
  )
})

export default DepositAmountInputs