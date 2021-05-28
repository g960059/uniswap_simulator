import React,{ useMemo, useState} from 'react';
import {Stack, Box,  Typography, Grid, Menu ,MenuItem, Accordion as MuiAccordion,AccordionDetails as MuiAccordionDetails,AccordionSummary as MuiAccordionSummary, Avatar, AvatarGroup} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { positionsAtom,createNewStrategyAtom, strategiesAtom, selectedStrategyIdAtom, slideDirectionAtom} from '../store/index'
import { Add, ExpandMore, ArrowForwardIosSharp} from '@material-ui/icons'
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import Button from './Button' 

const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const formatter3 = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 3 })

const StrategyList = React.memo(({props}) =>{
  const [strategies, setStrategies] = useAtom(strategiesAtom)

  const createNewStrategy = useUpdateAtom(createNewStrategyAtom)
  const setSlideDirection = useUpdateAtom(slideDirectionAtom);

  return <Box px={[0,2]} pt={2}>
    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{px:[2,0]}}>
      <Typography variant='h6' sx={{py:'6px'}}><strong>Strategies</strong></Typography>
      <Button color='grey' variant='outlined' startIcon={<Add/>} onClick={()=>{setSlideDirection('left');createNewStrategy()}}>New Strategy</Button>
    </Stack>
    {strategies.map((strategyAtom) => (
      Object.keys(strategyAtom).length != 0 && <StrategyItem atom={strategyAtom}/>
    ))}   
  </Box>
})
export default StrategyList




export const StrategyItem = React.memo(({atom})=>{
  const [strategy, setStrategy] = useAtom(atom)
  const setSelectedStrategyID = useUpdateAtom(selectedStrategyIdAtom)
  const positions = useAtomValue(positionsAtom).map(position => useAtomValue(position))
  const strategyPositions =  Object.entries(strategy.positions).map(([id,ratio]) => ({id, ratio, position: positions.find(pos => pos.id === id)}))
  const setSlideDirection = useUpdateAtom(slideDirectionAtom);

  const getPositionValue = (item) =>{
    if(item.position.type == 'uniswap_v3_lp') return item.position.depositValue * item.ratio;
    if(item.position.type == 'hodl') return (Number(item.position.token1Value) + Number(item.position.token0Value))*item.ratio;
    else return 0
  }
  const getDepositValue = () => {
    if(strategy.totalDeposit != null){
      return strategy.totalDeposit
    }else{
      return strategyPositions.reduce((total, item) => getPositionValue(item) + total,0) 
    }
  }

  const getPositionLabel = (item)=>{
    if(! item?.position?.type) return null
    if(item.position.type === 'uniswap_v3_lp') return (
      <Box sx={{backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1),color: 'success.main',p: 0.5, display:'flex', justifyContent:'center',borderRadius: '5px',width: '110px',fontSize: 12,}}>
        {item.position.name} {item.ratio == 1 ? null : `x${item.ratio}`}
      </Box>)
    if(item.position.type === 'hodl') return (
      <Box sx={{backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),color: 'info.main',p: 0.5, display:'flex', justifyContent:'center',borderRadius: '5px',width: '110px',fontSize: 12,}}>
        {item.position.name} {item.ratio == 1 ? null : `x${item.ratio}`}
      </Box>)
    else{　return 'Others' }
  }

  return (
      <Box sx={{bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 4px -2px rgb(0 0 0 / 10%)', border: '1px solid #5c93bb2b', my:1.5,p:2, pt:1, cursor: 'pointer', '&:hover': {backgroundColor: '#eff6fb99',borderColor: '#cfdce6'}}}
        onClick={e=>{setSlideDirection('left');setSelectedStrategyID(strategy.id)}}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='subtitle1'>{strategy.name}</Typography>
          <Stack direction='row' alignItems='center' >
            <AvatarGroup max={2}>
              <Avatar sx={{ width: 18, height: 18 }} src={strategy.token0.logoURI}>{strategy.token0.symbol}</Avatar>  
              <Avatar sx={{ width: 18, height: 18 }} src={strategy.token1.logoURI}>{strategy.token1.symbol}</Avatar> 
            </AvatarGroup>
            <Typography variant='caption'>{strategy.token0.symbol}/{strategy.token1.symbol}</Typography>
          </Stack>
        </Stack>
        <Stack>
          <Grid container justifyContent='center' alignItems='center'>
            <Grid item xs={4} >
              <Typography variant='caption' color='text.secondary'>Asset Value</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant='caption' color='text.secondary'>Positions</Typography>
            </Grid>
          </Grid>
          <Grid container justifyContent='center' alignItems='flex-start'>
            <Grid item xs={4} >
              <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}}>$ {formatter.format(getDepositValue())}</Typography>
            </Grid> 
            <Grid item xs={8}>
              {strategyPositions.length ===0 && <Typography variant='caption' color='text.secondary'>No Position</Typography>}
              <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                <Grid container spacing={1}>
                  {strategyPositions.map(item => (
                    <Grid item xs={6}>{ getPositionLabel(item)}</Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>    
  )
})


// const Accordion = styled((props) => (
//   <MuiAccordion disableGutters elevation={0} square {...props} />
// ))(({ theme }) => ({
//   border: 0,
//   backgroundColor: 'transparent',
//   '&:not(:last-child)': {
//     borderBottom: 0,
//   },
//   '&:before': {
//     display: 'none',
//   },
//   '& .MuiAccordionSummary-root': {
//     '&:hover:not(.Mui-expanded)':{
//       backgroundColor: '#80808014'
//     }
//   },    
// }));

// const AccordionSummary = styled((props) => (
//   <MuiAccordionSummary
//     expandIcon={<ArrowForwardIosSharp sx={{ fontSize: '0.9rem' }} />}
//     {...props}
//   />
// ))(({ theme }) => ({
//   flexDirection: 'row-reverse',
//   '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
//     transform: 'rotate(90deg)',
//   },
//   '& .MuiAccordionSummary-content': {
//     marginLeft: theme.spacing(1),
//     marginTop: theme.spacing(.5),
//     marginBottom: theme.spacing(.5),
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
// }));

// const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
//   padding: theme.spacing(2),
//   paddingTop:0,
//   paddingBottom:0
// }));