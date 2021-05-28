import React,{ useMemo} from 'react';
import {Stack, Box, TextField, OutlinedInput, InputAdornment, Grid, Typography, IconButton, Menu, MenuItem} from '@material-ui/core';
import {useAtom} from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import {currentPricesAtom, positionsAtom,ethPriceAtom, selectedStrategyAtom,selectedStrategyIdAtom, slideDirectionAtom, deleteStrategyAtom, selectedStrategyPositionsAtom,createNewLpPositionAtom,createNewHodlPositionAtom, selectedPositionIdAtom} from '../store/index'
import { alpha } from '@material-ui/core/styles';
import { Add, Delete,ArrowBack } from '@material-ui/icons'
import ReactiveInput from '../components/ReactiveInput'
import Button from './Button'
import TokenSelect from './TokenSelect'


const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const formatter3 = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 3 })
const format = (x) => Number(x.toPrecision(4))

const StrategyBox = React.memo(() =>{

  const [strategy,setStrategy] = useAtom(selectedStrategyAtom)

  const token0 = strategy.token0
  const token1 = strategy.token1
  const currentPrices = useAtomValue(currentPricesAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const token0Price = currentPrices[token0.address] * ethPrice
  const token1Price = currentPrices[token1.address] * ethPrice
  const currentPrice = currentPrices[token0.address] / currentPrices[token1.address]

  const [selectedStrategyId, setSelectedStrategyId] = useAtom(selectedStrategyIdAtom)
  const positions = useAtomValue(positionsAtom).map(position => useAtomValue(position))
  const strategyPositions =  Object.entries(strategy.positions).map(([id,ratio]) => ({id, ratio, position: positions.find(pos => pos.id === id)}))
  const selectedStrategyPositions = useAtomValue(selectedStrategyPositionsAtom)

  const createLpPosition = useUpdateAtom(createNewLpPositionAtom)
  const createHodlPosition = useUpdateAtom(createNewHodlPositionAtom)

  const [anchorEl, setAnchorEl] = React.useState(null);

  // const deletePositionFromStrategy = useUpdateAtom(deletePositionFromStrategyAtom)
  const deleteStrategy = useUpdateAtom(deleteStrategyAtom)
  const getPositionValue = (item) =>{
    if(item.position.type == 'uniswap_v3_lp') return item.position.depositValue * item.ratio;
    if(item.position.type == 'hodl') return (Number(item.position.token1Value) + Number(item.position.token0Value))*item.ratio;
    else return 0
  }

  const getToken0Amount = (item) => {
    if(item.position.type == 'uniswap_v3_lp'){
      const m = item.position.tickLower
      const M = item.position.tickUpper
      const depositAmount = item.position.depositValue / token1Price
      if(m<=1 && 1<=M)  return depositAmount * (1-1/ Math.sqrt(M))/(2-1/Math.sqrt(M) - Math.sqrt(m)) / currentPrice * item.ratio;
      if(1 <= m) return depositAmount / currentPrice * item.ratio;
      if(M<= 1) return 0         
    }
    if(item.position.type == 'hodl') return Number(item.position.token0Value)/ token0Price * item.ratio;
    else return 0
  }

  const getToken1Amount = (item) => {
    if(item.position.type == 'uniswap_v3_lp'){
      const m = item.position.tickLower
      const M = item.position.tickUpper
      const depositAmount = item.position.depositValue / token1Price
      if(m<=1 && 1<=M) return depositAmount *((1-Math.sqrt(m))/(2-1/Math.sqrt(M) - Math.sqrt(m)))*item.ratio
      if(1 <= m) return 0
      if(M<= 1) return depositAmount * item.ratio
    }
    if(item.position.type == 'hodl') return Number(item.position.token1Value)/ token1Price * item.ratio
    else return 0
  }

  const token0AmountTotal = strategyPositions.reduce((totalAmount, item)=> getToken0Amount(item)+totalAmount, 0)
  const token1AmountTotal = strategyPositions.reduce((totalAmount, item)=> getToken1Amount(item)+totalAmount, 0)


  const getDepositValue = () => {
    if(strategy.totalDeposit != null){
      return strategy.totalDeposit
    }else{
      return strategyPositions.reduce((total, item) => getPositionValue(item) + total,0) 
    }
  }

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);
  };
 
  const handleClose = (e)=>{
    e.stopPropagation()
    setAnchorEl(null);
  }
  const selectUniswapV3 = () => {
    createLpPosition()
    setAnchorEl(null);
  }
  const selectHodl = () => {
    createHodlPosition()
    setAnchorEl(null);
  }

  // const addPosition = (id) =>{
  //   setStrategy(prev => ({...prev, positions: {...prev.positions, [id]:1}}))
  // }

  return <Box mt={1} mb={2}>
    <Button startIcon={<ArrowBack/>} sx={{ml:2, mt:2}} color='grey' variant='outlined' onClick={e=>{setSelectedStrategyId(null)}}>All Strategy</Button>              
    <Box p={2} m={1} mt={2} sx={{backgroundColor:'white',boxShadow:"0 3px 6px -2px rgb(0 10 60 / 20%)", mx:1,border: '1px solid #eff6fb99'}}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' >
        <ReactiveInput 
          value = {strategy.name}  
          updateValue={(value)=>{setStrategy(prev=>({...prev, name:value}))}} 
          type = 'text'
          variant='standard'
          useAdornment = {false}
          sx={{ maxWidth:280, fontWeight: 600, mr:2}}
          fullWidth
        />
        <TokenSelect token0={token0} token1={token1} setToken0={(token)=>{setStrategy(prev => ({...prev, token0: token}))}} setToken1={(token)=>{setStrategy(prev => ({...prev, token1: token}))}}/>
      </Stack>    
      <Box pt={2} >
        <Stack direction = "row" alignItems='center' justifyContent='space-between' sx={{mb:1, mt:0}}>
        <Typography variant='subtitle1' sx={{py:'6px', fontWeight:600}} color='text.secondary'>Positions</Typography>
          <Button 
            id="positioned-menu"
            startIcon={<Add/>}
            aria-controls="positioned-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            variant='outlined'     
            color='grey'
          >
            Add Position
          </Button>
          <Menu
            id="positioned-menu"
            aria-labelledby="positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={selectUniswapV3}>Add Uniswap V3 LP Position</MenuItem>
            <MenuItem onClick={selectHodl}>Add HODL Position</MenuItem>
          </Menu>               
        </Stack>

        {selectedStrategyPositions.length ==0 ? <>
          <Box sx={{bgcolor: 'white', borderRadius: 2,border:1, borderColor: 'grey.300', my:1,p:2, pt:1}}>
            <Typography variant='subtitle1'>No positions in this strategy</Typography>
          </Box>
        </>:(
          selectedStrategyPositions.map((positionAtom) => (
            Object.keys(positionAtom).length != 0 &&  <PositionItem positionAtom ={positionAtom} token0={token0} token1={token1} token0Price={token0Price} token1Price={token1Price}/>
          ))
        )}

    
        <Box sx={{backgroundColor:'#f1f5f9', mx:-2, mb:2, px:1, py:2,mt:3}}>
          <Typography variant='subtitle2' sx={{ml:2, pb:1}}>Strategy Summary</Typography>
          <Grid container justifyContent='center' alignItems='center'>
            <Grid item xs={3}>
              <Typography variant='caption'>Total Value</Typography>
              <Typography variant='h6' sx={{fontWeight: 600}}>${formatter.format(getDepositValue())}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant='caption'>{token0.symbol}</Typography>
              <Stack direction = 'row' justifyContent='flex-start' alignItems='center'>
                <Typography variant='h6' sx={{fontWeight: 600}}>{formatter.format(token0AmountTotal)}</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ml:.5}}>(${formatter.format(token0AmountTotal * token0Price)})</Typography>
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Typography variant='caption'>{token1.symbol}</Typography>
              <Stack direction = 'row' justifyContent='flex-start' alignItems='center'>
                <Typography variant='h6' sx={{fontWeight: 600}}>{formatter.format(token1AmountTotal)}</Typography>
                <Typography variant='caption'  color='text.secondary' sx={{ml:.5}}>(${formatter.format(token1AmountTotal * token1Price)})</Typography>
              </Stack>
            </Grid>          
          </Grid>
        </Box>        

        <Stack direction = "row" justifyContent='center' alignItems="center">
          <Button startIcon={<Delete/>} sx={{mt:2}} variant='outlined' color='grey' onClick={e=>{deleteStrategy(strategy.id)}}>Delete Strategy</Button>
        </Stack>      
      </Box>
    </Box>
  </Box>
})

export default StrategyBox


export const PositionItem = React.memo(({positionAtom, token0, token1, token0Price, token1Price})=>{
  const [position, setPosition] = useAtom(positionAtom)
  const [selectedPositionId, setSelectedPositionId] = useAtom(selectedPositionIdAtom);
  const currentPrice = token0Price / token1Price
  const symbol = `${token0.symbol}/${token1.symbol}`

  const positionType = useMemo(()=>{
    if(position.type === 'uniswap_v3_lp') return (
      <Box sx={{backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1),color: 'success.main',p: 0.5, display:'flex', justifyContent:'center',borderRadius: '5px',width: '110px',fontSize:11,}}>
        Uniswap v3 LP
      </Box>)
    if(position.type === 'hodl') return (
      <Box sx={{backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),color: 'info.main',p: 0.5, display:'flex', justifyContent:'center',borderRadius: '5px',width: '110px',fontSize:11,}}>
        HODL
      </Box>)
    else{　return 'Others' }
  })
  if(position.type === 'uniswap_v3_lp'){
    return (
      <Box sx={{bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 4px -2px rgb(0 0 0 / 10%)', border: '1px solid #5c93bb2b', my:1.5,p:2, pt:1, cursor: 'pointer', '&:hover': {backgroundColor: '#eff6fb99',borderColor: '#cfdce6'}}}
        onClick={e=>{setSelectedPositionId(position.id); }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='subtitle1'>{position.name}</Typography>
          {positionType}
        </Stack>
        <Stack direction='row' justifyContent='space-around' alignItems='center'>
          <Grid container justifyContent='center' alignItems='center'>
            <Grid item xs={4} >
              <Typography variant='caption'>Deposit Value</Typography>
              <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}}>$ {formatter.format(position.depositValue)}</Typography>
            </Grid>
            <Grid item xs={8} justifyContent='center' alignItems='flex-start' >
              <Typography variant='caption'>Liquidity Range ({symbol})</Typography>
              <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                <Stack direction='row' alignItems='center'>
                  <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} >{formatter.format(position.tickLower * currentPrice)}</Typography>
                  <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(x{formatter3.format(position.tickLower)})</Typography>
                </Stack>
                <Stack direction='row' alignItems='center' sx={{ml:1}}>
                  <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} > - {formatter.format(position.tickUpper * currentPrice)}</Typography>
                  <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(x{formatter3.format(position.tickUpper)})</Typography>
                </Stack>
              </Stack>
            </Grid>  
          </Grid>
        </Stack>
      </Box>
    )
  }
  if(position.type === 'hodl'){
    return (
      <Box  sx={{bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 4px -2px rgb(0 0 0 / 10%)', border: '1px solid #5c93bb2b', my:1.5,p:2, pt:1, cursor: 'pointer', '&:hover': {backgroundColor: '#eff6fb99',borderColor: '#cfdce6'}}}
        onClick={e=>{setSelectedPositionId(position.id)}}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='subtitle1'>{position.name}</Typography>
          {positionType}
        </Stack>
        <Stack direction='row' justifyContent='space-around' alignItems='center'>
          <Grid container justifyContent='center' alignItems='center'>
            <Grid item xs={4} >
              <Typography variant='caption'>Deposit Value</Typography>
              <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}}>$ {formatter.format(Number(position.token0Value) + Number(position.token1Value))}</Typography>
            </Grid>            
            <Grid item xs={4} justifyContent='center' alignItems='flex-start'>
              <Typography variant='caption'>{token0.symbol}</Typography>
              <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} >{formatter.format(position.token0Value/ token0Price )}</Typography>
                <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(${formatter3.format(position.token0Value)})</Typography>
              </Stack>
            </Grid>
            <Grid item xs ={4} justifyContent='center' alignItems='flex-start'>
              <Typography variant='caption'>{token1.symbol}</Typography>
              <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} >{formatter.format(position.token1Value/ token1Price )}</Typography>
                <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(${formatter3.format(position.token1Value)})</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    )
  }  
})


{/* {strategyPositions.map(({id, ratio, position}) => {
        if(position.type === 'uniswap_v3_lp') return <>
          <Box sx={{bgcolor: 'white', borderRadius: 2,border:1, borderColor: 'grey.300', my:1,p:2, pt:1}}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='subtitle1'>{position.name}</Typography>
              {positionType(position)}
            </Stack>
            <Stack direction='row' justifyContent='space-around' alignItems='center'>
              <Grid container justifyContent='center' alignItems='center'>
                <Grid item xs={3} >
                  <Typography variant='caption'>Deposit Value</Typography>
                  <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}}>$ {formatter.format(position.depositValue)}</Typography>
                </Grid>
                <Grid item xs={8} justifyContent='center' alignItems='flex-start' >
                  <Typography variant='caption'>Liquidity Range ({symbol})</Typography>
                  <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                    <Stack direction='row' alignItems='center'>
                      <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} >{formatter.format(position.tickLower * currentPrice)}</Typography>
                      <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(x{formatter3.format(position.tickLower)})</Typography>
                    </Stack>
                    <Stack direction='row' alignItems='center' sx={{ml:1}}>
                      <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} > - {formatter.format(position.tickUpper * currentPrice)}</Typography>
                      <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(x{formatter3.format(position.tickUpper)})</Typography>
                    </Stack>
                  </Stack>
                </Grid> 
                <Grid item xs={1}>
                  <IconButton onClick={e=>{deletePositionFromStrategy(id)}}><Delete/></IconButton>
                </Grid> 
              </Grid>
            </Stack>         
          </Box>
        </>
        if(position.type === 'hodl') return <>
          <Box sx={{bgcolor: 'white', borderRadius: 2,border:1, borderColor: 'grey.300', my:1,p:2, pt:1}}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='subtitle1'>{position.name}</Typography>
              {positionType(position)}
            </Stack>
            <Stack direction='row' justifyContent='space-around' alignItems='center'>
              <Grid container justifyContent='center' alignItems='center'>
                <Grid item xs={3} >
                  <Typography variant='caption'>Deposit Value</Typography>
                  <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}}>$ {formatter.format(Number(position.token0Value) + Number(position.token1Value))}</Typography>
                </Grid>            
                <Grid item xs={4} justifyContent='center' alignItems='flex-start'>
                  <Typography variant='caption'>{token0.symbol}</Typography>
                  <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                    <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} >{formatter.format(position.token0Value / token0Price / ethPrice)}</Typography>
                    <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(${formatter3.format(position.token0Value)})</Typography>
                  </Stack>
                </Grid>
                <Grid item xs ={4} justifyContent='center' alignItems='flex-start'>
                  <Typography variant='caption'>{token1.symbol}</Typography>
                  <Stack direction='row' justifyContent='flex-start' alignItems='center'>
                    <Typography variant='subtitle1' sx={{color: 'primary.main',fontWeight: 600}} >{formatter.format(position.token1Value/ token1Price / ethPrice)}</Typography>
                    <Typography variant='caption' sx={{color: 'gray', ml:.5}} >(${formatter3.format(position.token1Value)})</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={e=>{deletePositionFromStrategy(id)}}><Delete/></IconButton>
                </Grid>                 
              </Grid>
            </Stack>        
          </Box>          
        </>
      })} */}

        {/* <Typography variant='subtitle1' ><strong>Positions</strong></Typography>
        {restPositions.length!=0 &&<> 
          <Button 
            id="positioned-menu"
            startIcon={<Add/>}
            aria-controls="positioned-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}        
          >
            Add Position
          </Button>
          <Menu
            id="positioned-menu"
            aria-labelledby="positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {restPositions.map(position => (
              <MenuItem onClick={e=>{addPosition(position.id)}}>{position.name}</MenuItem>
            ))}
          </Menu>
        </>}       */}



