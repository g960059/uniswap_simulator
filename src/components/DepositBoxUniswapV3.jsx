import React,{useState, useMemo, useEffect} from 'react';
import {Box,Paper,Input,Typography,IconButton,FormControl,MenuItem, Stack, Dialog, DialogTitle,DialogContent,Button, Divider} from '@material-ui/core';
import {Settings, Close, Add, Delete, ArrowBack} from '@material-ui/icons';
import {useAtom} from 'jotai'
import PriceRangeSlider from './PriceRangeSliderV2'
import DepositAmountInputs  from './DepositAmoutInputs'

const DepositBoxUniswapV3 = React.memo(() =>{

  return (
    <>        
      <Box p={2} pt={2}>
        <PriceRangeSlider/>
      </Box>           
      <Box p={2} pt={1} pb={3}>
        <DepositAmountInputs/>
      </Box>       
    </>
  )
})

export default DepositBoxUniswapV3


            {/* <Typography variant='subtitle1'><strong>Select Ratio</strong></Typography>
            <Stack direction='row' spacing={2} alignItems='center' sx={{bgcolor: 'grey.100', borderRadius: 5, p:3, mt:1}}>
              <Input value={ratio} type='number' onChange={e=>{setRatio(e.target.value)}} min={0} max={100} sx={{width: 70}} size='small' endAdornment={<InputAdornment>%</InputAdornment>} inputProps={{min: 0, style: { textAlign: 'center' }}}/>
              <AirbnbSlider value={ratio} onChange={e=>{setRatio(e.target.value)}} min={0} max={100} valueLabelDisplay="auto" />
            </Stack> */}