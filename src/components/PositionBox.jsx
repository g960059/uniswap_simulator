import React from 'react';
import {Box,Typography, Stack} from '@material-ui/core';
import {ArrowBack, Delete} from '@material-ui/icons';
import {useAtom} from 'jotai'
import { useAtomValue, useUpdateAtom} from 'jotai/utils'
import {selectedPositionIdAtom, selectedPositionAtom, deletePositionAtom, slideDirectionAtom,selectedStrategyAtom} from '../store/index'
import DepositBoxUniswapV3 from './DepositBoxUniswapV3'
import HodlDepositBox from './HodlDepositBox'
import ReactiveInput from './ReactiveInput'
import Button from './Button'
import PriceRangeSlider from './PriceRangeSliderV2'
import DepositAmountInputs  from './DepositAmoutInputs'


const PositionBox = () => {
  const [selectedPositionId, setSelectedPositionId] = useAtom(selectedPositionIdAtom);
  const [selectedPosition,setSelectedPosition] = useAtom(selectedPositionAtom);
  const deletePosition = useUpdateAtom(deletePositionAtom)
  const setSlideDirection = useUpdateAtom(slideDirectionAtom);
  const selectedStrategy = useAtomValue(selectedStrategyAtom)


  return <>
    <Button startIcon={<ArrowBack/>} sx={{ml:1, mt:3, mb:1}} color='grey' variant='outlined' onClick={e=>{setSlideDirection('right');setSelectedPositionId(null);}}>{selectedStrategy.name}</Button>
    <Box py={2} m={1} mt={2} sx={{backgroundColor:'white',boxShadow:"0 3px 6px -2px rgb(0 10 60 / 20%)", mx:1,border: '1px solid #eff6fb99'}}>
      <ReactiveInput 
        value = {selectedPosition?.name}  
        updateValue={(value)=>{setSelectedPosition(prev=>({...prev, name:value}))}} 
        type = 'text'
        variant='standard'
        useAdornment = {false}
        sx={{ maxWidth:280, fontWeight: 600, mx:2, fontSize: 'subtitle1.fontSize'}}
        fullWidth
      />      
      {selectedPosition?.type === "uniswap_v3_lp" &&  <>
        <Box px={2}>
          <PriceRangeSlider/>
        </Box>
      </>}
      {selectedPosition?.type === "hodl" &&  <HodlDepositBox/>}
      <Stack direction = "row" justifyContent='center' alignItems="center">
        <Button startIcon={<Delete/>} sx={{ml:2, mb:2}} variant='outlined' color='grey' onClick={e=>{deletePosition(selectedPosition.id)}}>Delete Position</Button>
      </Stack>
    </Box>  
  </>
  
}

export default PositionBox