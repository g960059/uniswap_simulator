import React, {useState, useMemo} from 'react';
import {Stack, Typography, FormControl,  InputAdornment, Divider, Box, useMediaQuery} from '@material-ui/core'
import NumberFormat from 'react-number-format';
import AirbnbSlider from '../components/AirbnbSlider'
import {token0Atom, token1Atom,  priceV2Atom, selectedPositionAtom} from '../store/index'
import {useAtom} from 'jotai'
import { useAtomValue } from 'jotai/utils'
import LiquidityInfoBox from '../components/LiquidityInfoBox'
import {useDebounce} from '../hooks/index'
import {Input} from './ReactiveInput'
import DepositAmountInputs from './DepositAmoutInputs'


const formatPowValue = v => v >0 ? Number((10**v).toPrecision(3)): Number((10**v).toFixed(2))
const formatValueText = v => v >0 ? `x ${(10**v).toPrecision(3)}` :`x ${Number(10**v).toFixed(2)}` 

const getPrecision = v => String(v).split('.')[1]?.search(/[^0]/) + 1
const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const formatter3 = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 3 })



const PriceRangeSlider = React.memo(()=>{
  const p0 = useAtomValue(priceV2Atom)
  const token0 = useAtomValue(token0Atom)
  const token1 = useAtomValue(token1Atom)
  const [{tickLower, tickUpper}, setPosition] = useAtom(selectedPositionAtom)
  const setTickLower = v => setPosition(old => ({...old, tickLower: v}))
  const setTickUpper = v => setPosition(old => ({...old, tickUpper: v}))

  const ticker = useMemo(()=>`${token1.symbol}/${token0.symbol}`,[token0,token1])

  const [minPrice, setMinPrice] = useState(tickLower);
  const [maxPrice, setMaxPrice] = useState(tickUpper);
  const precision = useMemo(()=> getPrecision(p0),[p0],[p0])+3

  const isUpMd = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const debouncedSetMinPrice = useDebounce((e)=> {
    if(e?.value) {
      setMinPrice(e.value / p0);
      setTickLower(e.value / p0);
    }
  }, 50)
  const debouncedSetMaxPrice = useDebounce((e)=> {
    if(e?.value){
      setMaxPrice(e.value / p0);
      setTickUpper(e.value / p0);
    }
  }, 50)


  return <>
    <Stack>
      <Typography variant='subtitle1' sx={{color:'text.secondary', alignSelf:'center', mt:1.5}} ><strong>{formatter.format(p0)} </strong>{ticker}</Typography>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Typography>x0.01</Typography> 
        <AirbnbSlider
          value={[Math.log10(minPrice),Math.log10(maxPrice)]} 
          onChange={(e,newPrice)=>{setMinPrice(formatPowValue(newPrice[0]));setMaxPrice(formatPowValue(newPrice[1]))}} 
          onChangeCommitted = {(e,newPrice)=>{setTickLower(formatPowValue(newPrice[0]));setTickUpper(formatPowValue(newPrice[1]))}}
          step={0.01} min={-2} max={2} 
          sx = {{
              '& .MuiSlider-mark': {
                background: "gray",
                width: "2px",
                height: "20px",
                marginTop: "-9px"
              }
            }}
            aria-labelledby="range-slider"
            getAriaValueText ={formatValueText}
            valueLabelFormat = {formatValueText}
            valueLabelDisplay="auto"
            marks={[{value: 0, label: ``}]}
          />
        <Typography sx={{pl:.5}}>x100</Typography> 
      </Stack>  
      <Stack direction='row' spacing={2} alignItems='center' justifyContent='center' sx={{mt:1}}>
        <Box>
          <FormControl sx={{display:'flex', alignItems:'flex-start', justifyContent: 'center'}}>
            <Typography variant='subtitle2' sx={{mb:.5, color:'text.secondary'}} >Min Price (x{formatter3.format(minPrice)})</Typography>
            <NumberFormat  
              value={minPrice * p0} 
              onValueChange={({value})=>{ 
                setMinPrice(value / p0);
                setTickLower(value / p0);}}
              customInput={Input}
              variant='standard'
              thousandSeparator={true}
              decimalScale ={minPrice * p0 <= 10 ? precision : 0}
              inputProps={{min: 0, style: { textAlign: 'center' }}}
              endAdornment= {<InputAdornment position="start" sx={{fontSize:'caption.fontSize'}}>{ticker}</InputAdornment>}
            />
          </FormControl>
        </Box>
        <Box>
          <FormControl sx={{display:'flex', alignItems:'flex-start', justifyContent: 'center'}}>
            <Typography variant='subtitle2' sx={{mb:1, color:'text.secondary'}} >Max Price (x{formatter3.format(maxPrice)})</Typography>
            <NumberFormat  
              value={maxPrice * p0} 
              onValueChange={({value})=>{ 
                setMaxPrice(value / p0);
                setTickUpper(value / p0);}}
              customInput={Input}
              thousandSeparator={true}
              decimalScale ={maxPrice * p0 <= 10 ? precision : 0}
              inputProps={{min: 0, style: { textAlign: 'center' }}}
              endAdornment= {<InputAdornment position="start">{ticker}</InputAdornment>}
            />          

          </FormControl>
        </Box>      
      </Stack>       
      <DepositAmountInputs/> 
      <LiquidityInfoBox/>
    </Stack>
  </>
})

export default PriceRangeSlider