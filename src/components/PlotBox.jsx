import React,{ useMemo, useState} from 'react';
import {Stack, Box, Grid, Button, FormControl,InputLabel,Select, MenuItem, Typography,Divider, Tab, useMediaQuery, Avatar, AvatarGroup} from '@material-ui/core';
import {TabContext, TabList, TabPanel} from '@material-ui/lab'
import { useAtomValue } from 'jotai/utils'
import { strategiesReadOnlyAtom, currentPricesAtom, ethPriceAtom, ETH, USDC, LpPosition, Position} from '../store/index'
import arange from 'lodash/range'
import {Scatter} from 'react-chartjs-2';
import {COLORS} from "../utils/color_palette";
import { alpha, Theme } from '@material-ui/core/styles';
import Slider from './AirbnbSlider'
import SwipeableViews from 'react-swipeable-views';
import Input from './Input'


const formatter = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 4 })
const format = (x) => Number(x.toPrecision(3))


const PlotBox = React.memo(() =>{
  const [tabValue, setTabValue] = useState(0);
  const [token0, setToken0] = useState(ETH);
  const [token1, setToken1] = useState(USDC);
  
  const currentPrices = useAtomValue(currentPricesAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const token0Price = currentPrices[token0.address] * ethPrice
  const token1Price = currentPrices[token1.address] * ethPrice
  const p0 = currentPrices[token0.address] / currentPrices[token1.address]

  const allStrategies = useAtomValue(strategiesReadOnlyAtom)
  const strategies = useMemo(()=> allStrategies.filter(s => s.token0.address === token0.address && s.token1.address === token1.address,[token0,token1]))
  const pairs = allStrategies.reduce((acc,s)=>{
    const id = s.token0.address + "__" + s.token1.address
    for(let pair of acc){
      if(id === pair.id) 
      return acc
    }
    return [...acc,{id, token0: s.token0, token1: s.token1}]
  },[])

  const [rangeMin, setRangeMin] = useState(Math.min(p0 / 2, strategies.map(s=> s.positions.filter(p =>p.type==='uniswap_v3_lp').map((p) =>p?.tickLower)).flat().reduce((a,b)=> a>b?b:a,1)* 0.1 * p0 ));
  const [rangeMax, setRangeMax] = useState(Math.max(p0*2, strategies.map(s=> s.positions.filter(p=>p.type==='uniswap_v3_lp').map(p=>p?.tickUpper)).flat().reduce((a,b)=> a<b?b:a,1)* 1.2 * p0));

  const [targetStrategyId, setTargetStrategyId] = useState(strategies[0].id);
  const [baseStrategyId, setBaseStrategyId] = useState(strategies.length>1 ? strategies[1].id : null);
  const targetStrategy = useMemo(()=>strategies.find(({id})=>targetStrategyId === id),[targetStrategyId])
  const baseStrategy = useMemo(()=>strategies.find(({id})=>baseStrategyId === id),[baseStrategyId])

  const isUpMd= useMediaQuery((theme) => theme.breakpoints.up('md'));

  const px = arange(rangeMin, rangeMax, Number((rangeMax*0.008).toPrecision(1)))
  const getPositionValueTrace = (position, px) =>{
    if(position.type === 'uniswap_v3_lp'){
      const {tickUpper: M, tickLower: m, depositValue} = position
      const sqrt_m = Math.sqrt(m)
      const sqrt_M = Math.sqrt(M) 
      const w0 = depositValue / token1Price
      return px.map(p => {
        const r = p / p0
        if(1 <= m){
          if(r <= m) return w0 * r
          else if(M <= r) return w0 * sqrt_m * sqrt_M
          else if(m <r && r < M) return w0 / (1/ sqrt_m - 1/ sqrt_M)* (2 * Math.sqrt(r) - sqrt_m - r / sqrt_M)
        }
        else if(m < 1 < M){
          if(r <= m) return w0 / (2 - sqrt_m  - 1 / sqrt_M ) * (1 / sqrt_m - 1 / sqrt_M) * r ;
          else if(M <= r) return w0 / (2 - sqrt_m  - 1 / sqrt_M ) * (sqrt_M - sqrt_m); 
          else if(m <r && r < M) return w0 / (2 - sqrt_m  - 1 / sqrt_M ) * (2 * Math.sqrt(r) - sqrt_m - r / sqrt_M);
        }
        else if(M <= 1){
          if(r <= m) return w0 * r / sqrt_m / sqrt_M
          else if(M <= r)  return w0
          else if(m <r && r < M) return w0 / (sqrt_M - sqrt_m) * (2 * Math.sqrt(r) - sqrt_m - r / sqrt_M )
        }
      })
    }
    else if(position.type === 'hodl'){
      const {token0Value, token1Value} = position
      const token0Amount = token0Value / token0Price 
      const token1Amount = token1Value  / token1Price
      return px.map(p => token0Amount * p + token1Amount)
    }
  }

  const getStrategyValueTrace = (strategy, px) => strategy.positions.reduce(
    (acc, pos)=>{
      const trace = getPositionValueTrace(pos, px)
      acc.forEach((d,i) => {
        acc[i] += trace[i]
      })
      return acc
    }, new Array(px.length).fill(0)) 
  
  const getPositionToken0ValueTrace = (position, px) => {
    if(position.type === 'uniswap_v3_lp'){
      const {tickUpper: M, tickLower: m, depositValue} = position
      const sqrt_m = Math.sqrt(m)
      const sqrt_M = Math.sqrt(M) 
      const w0 = depositValue / token1Price
      return px.map(p => {
        const r = p / p0
        if(1 <= m){
          if(r <= m) return w0 * r
          else if(M <= r) return 0
          else if(m <r && r < M) return w0 /(1/sqrt_m - 1/ sqrt_M)* (Math.sqrt(r) - r / sqrt_M)
        }
        else if(m < 1 < M){
          if(r <= m) return w0 / (2 - sqrt_m  - 1 / sqrt_M ) * (1 / sqrt_m - 1 / sqrt_M) * r ;
          else if(M <= r) return 0
          else if(m <r && r < M) return w0 / (2 - sqrt_m  - 1 / sqrt_M ) * (Math.sqrt(r) - r / sqrt_M);
        }
        else if(M <= 1){
          if(r <= m) return w0 * r / sqrt_m / sqrt_M
          else if(M <= r)  return 0
          else if(m <r && r < M) return w0 / (sqrt_M - sqrt_m) * (Math.sqrt(r) - r / sqrt_M)
        }
      })
    }
    else if(position.type === 'hodl'){
      const {token0Value, token1Value} = position
      const token0Amount = token0Value / token0Price 
      return px.map(p => token0Amount * p )
    }
  }

  const getStrategyToken0ValueTrace =  (strategy, px) => strategy.positions.reduce(
    (acc, pos)=>{
      const trace = getPositionToken0ValueTrace(pos, px)
      acc.forEach((d,i) => {
        acc[i] += trace[i]
      })
      return acc
    }, new Array(px.length).fill(0)) 
  
  const getStrategyToken0RatioTrace = (strategy,px) => {
    const total = getStrategyValueTrace(strategy, px)
    const token0Value = getStrategyToken0ValueTrace(strategy, px)
    return total.map((t,i)=>token0Value[i]/t*100)
  }

  const getStrategyImpermanentLossTrace = (strategy1, strategy2,px) => {
    const strategyTrace1 = getStrategyValueTrace(strategy1, px);
    const strategyTrace2 = getStrategyValueTrace(strategy2, px);
    return strategyTrace1.map((v,i)=> (v -strategyTrace2[i])/ strategyTrace2[i] * 100)
  }

  const formatTrace = (py,px) =>{
    return px.map((p,i) => ({x:p, y:py[i]}))
  }

  const options1 = {
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: `Price (${token0.symbol}/${token1.symbol})`
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `Asset Value (${token1.symbol})`
        }
      }
    },
    animation: false,
    radius: 0,
    fill: false,
    aspectRatio: isUpMd ? 2 : 1.5,
    plugins: {
      legend: {
        labels: {
          filter: (item) => !item.text.includes('LP_TO_HIDE')
        },    
        onClick: (e, legendItem, legend)=>{
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            if (ci.isDatasetVisible(index)) {
                ci.hide(index);
                if(index <=ci._metasets.length-2 && ci._metasets[index+1]?.label.includes('LP_TO_HIDE')){
                  ci.hide(index+1);
                }
                legendItem.hidden = true;
            } else {
                ci.show(index);
                if(index <=ci._metasets.length-2 && ci._metasets[index+1]?.label.includes('LP_TO_HIDE')){
                  ci.show(index+1);
                }
                legendItem.hidden = false;
            }
        }
      },
    }
  };
  const options2 = {
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: `Price (${token0.symbol}/${token1.symbol})`
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `${token0.symbol} Ratio (%)`
        }
      }
    },
    animation: false,
    radius: 0,
    fill: false, 
    aspectRatio: isUpMd ? 2 : 1.5,
  }
  const options3 = {
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: `Price (${token0.symbol}/${token1.symbol})`
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `Impermanent Loss (%)`
        }
      }
    },
    animation: false,
    radius: 0,
    fill: false, 
    aspectRatio: isUpMd ? 2 : 1.5,
  }  


  const getLiquidityWidthMap = (strategy,px,p0) => {
    const base = new Array(px.length).fill(0)
    strategy.positions.forEach(position=>{
      if(position.type === 'uniswap_v3_lp'){
        const {tickUpper, tickLower} = position
        const l = tickLower * p0
        const u = tickUpper * p0
        px.forEach((x,i)=>{
          if(l <= x && x<=u ){
            base[i] = 1
          }
        })
      }
    })
    return Object.fromEntries(px.map((x,i)=>[x, base[i]]))
  }

  return <Box sx={{ml:[0,1], mr:[0,2]}}>
    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{p:2, pb:1, pt:[3,2]}}>
      <Typography variant='h6' fontWeight={600}>Analysis</Typography>
        <FormControl sx={{minWidth:140}}>
          <Select
            id="pairSelect"
            value={`${token0.address}__${token1.address}`}
            size='small'
            variant='outlined'
            color='grey'
            sx={{boxShadow:"0 3px 6px -2px rgb(0 10 60 / 20%)",border: '1px solid #eff6fb99' ,backgroundColor:'white'}}
            onChange={e => {
              const pair = pairs.find(p=>p.id===e.target.value)
              if(pair.token0.address != token0.address || pair.token1.address != token1.address){
                setToken0(pair.token0);
                setToken1(pair.token1);
                const newStrategies = allStrategies.filter(s => s.token0.address === pair.token0.address && s.token1.address === pair.token1.address)
                if(newStrategies.length>1){
                  setTargetStrategyId(newStrategies[0].id)
                  setBaseStrategyId(newStrategies[1].id)
                }
              }
            }}
            input={<Input/>}
          >
            {pairs.map((pair) =>(
              <MenuItem value={pair.id}>
                <Stack direction="row" alignItems="center" justifyContent="center">
                  <AvatarGroup max={2} sx={{mr:.5}}>
                    <Avatar sx={{ width: 24, height: 24 }} src={pair.token0.logoURI}>{pair.token0.symbol}</Avatar>  
                    <Avatar sx={{ width: 24, height: 24 }} src={pair.token1.logoURI}>{pair.token1.symbol}</Avatar> 
                  </AvatarGroup>
                  {pair.token0.symbol}/{pair.token1.symbol}
                </Stack>
              </MenuItem>))}
          </Select>
        </FormControl>
    </Stack>
    <TabContext value={tabValue}>
      <TabList 
        onChange={(e,newTabValue)=>{setTabValue(newTabValue)}} 
        variant="fullWidth"
        sx={{backgroundColor:'white'}}       
      >
        <Tab label="Asset Value" value={0} />
        <Tab label={`${token0.symbol} Ratio`} value={1} />
        <Tab label="IL / Price Risk" value={2} />
      </TabList>
      <SwipeableViews index={tabValue} onChangeIndex={index=>setTabValue(index)}>
        <TabPanel value={tabValue} index={0} sx={{p:0}}>
          <Box sx={{backgroundColor:'white',boxShadow:'0 2px 4px rgb(67 133 187 / 7%)',borderColor: 'grey.300', p:[1,2], pt:2}}>
            <Scatter 
              data={{
                datasets: [...strategies.map((strategy,i) =>{
                    const widthMap = getLiquidityWidthMap(strategy,px,p0)
                    const baseData = formatTrace(getStrategyValueTrace(strategy,px),px)
                    const baseLine = {
                        label: strategy.name,
                        data: baseData,
                        showLine: true,
                        borderColor: COLORS[i % COLORS.length],
                        backgroundColor: alpha(COLORS[i % COLORS.length],0.2),
                        borderWidth: 2,
                        parsing:true,
                      }                
                    if(strategy.positions.map(p => p.type).includes('uniswap_v3_lp')){
                      const liquidityLine = {
                        data: baseData,
                        showLine: true,
                        borderColor: alpha(COLORS[i % COLORS.length],0.3),
                        backgroundColor: alpha(COLORS[i % COLORS.length],0.2),
                        label: `LP_TO_HIDE_${i}`,
                        parsing: true,
                        segment: {
                          borderWidth: ctx =>Number(widthMap[ctx.p0.parsed.x] || widthMap[ctx.p1.parsed.x]) ? 10 :1 ,
                        }
                      }
                      return [baseLine,liquidityLine]
                    }else{          
                      return baseLine;
                    }
                  })
                ].flat()
              }} 
              options = {options1}
            />
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1} sx={{p:0}}>
          <Box sx={{backgroundColor:'white',boxShadow:'0 2px 4px rgb(67 133 187 / 7%)', p:[1,2], pt:2}}>
            <Scatter 
              data={{
                datasets: strategies.map((strategy,i) =>({
                  label: strategy.name,
                  data: formatTrace(getStrategyToken0RatioTrace(strategy,px),px),
                  showLine: true,
                  borderColor: COLORS[i % COLORS.length],
                  backgroundColor: alpha(COLORS[i % COLORS.length],0.2),
                  borderWidth: 2,
                  parsing:true,
                }))
              }} 
              options = {options2}
            />
          </Box>        
        </TabPanel>
          <TabPanel value={tabValue} index={2} sx={{p:0}}>  
            <Box sx={{backgroundColor:'white',boxShadow:'0 2px 4px rgb(67 133 187 / 7%)',borderColor: 'grey.300', p:[1,2],pt:2,height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
            {strategies.length > 1 ?
              <Scatter 
                data={{
                  datasets: [{
                    label: `${targetStrategy?.name} vs ${baseStrategy?.name}`,
                    data: formatTrace(getStrategyImpermanentLossTrace(targetStrategy,baseStrategy,px),px),
                    showLine: true,
                    borderColor: COLORS[0],
                    backgroundColor: alpha(COLORS[0],0.2),
                    borderWidth: 2,
                    parsing:true,
                  }]
                }} 
                options = {options3}
              /> : <Typography variant='subtitle1' color='text.secondary'>Add another strategy to this token pair</Typography>}
            </Box>       
          </TabPanel>
      </SwipeableViews>
    </TabContext> 
    {(strategies.length >1 || tabValue != 2)  && <Box sx={{backgroundColor:'white', px:2, pb:1}}>
      <Stack direction='row' justifyContent='center' alignItems='center'>
        <Typography variant='subtitle2' color='text.secondary' sx={{width:120}}>Plot Range</Typography>
        <Slider 
          value={[Math.log2(rangeMin), Math.log2(rangeMax)]} 
          onChange={(e,newValue)=>{setRangeMin(2 ** newValue[0]);setRangeMax(2 ** newValue[1])}}
          min = {Math.log2(p0/100)}
          max = {Math.log2(p0*100)}
          step={0.1}
          valueLabelDisplay="auto"
          getAriaValueText ={v => format(2 ** v)}
          valueLabelFormat ={v => format(2 ** v)}
          size='small'
        />
      </Stack>   
    </Box>} 
    {tabValue === 2  && strategies.length >1 && <Box sx={{backgroundColor:'white', px:[1,2],pb:2}}>
      <Stack direction='row' justifyContent='center' alignItems='center' sx={{width:'100%', display: 'flex', mb:1}}>
        <FormControl sx={{minWidth:140,mr:1}}>
          <Select
            labelId="targetStrategyLabel"
            id="targetStrategySelect"
            value={targetStrategyId}
            placeholder="Target Strategy"
            size='small'
            variant='outlined'
            onChange={e => {setTargetStrategyId(e.target.value);}}
          >
            {strategies.filter(s=>s.id!=baseStrategyId).map((strategy) => <MenuItem value={strategy.id}>{strategy.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant='subtitle2' color='text.secondary'>vs</Typography>
        <FormControl sx={{minWidth:140,ml:1}}>
          <Select
            labelId="baseStrategyLabel"
            id="baseStrategySelect"
            value={baseStrategyId}
            placeholder="Base Strategy"
            size='small'
            variant='outlined'
            onChange={e => {setBaseStrategyId(e.target.value)}}
          >
            {strategies.filter(s=>s.id!=targetStrategyId).map((strategy) => <MenuItem value={strategy.id}>{strategy.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>      
    </Box>}   
  </Box>
})

export default PlotBox