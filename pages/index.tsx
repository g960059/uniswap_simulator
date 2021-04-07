import React, {useState} from 'react';
import {Box, Paper, Slider, Typography, Tooltip, InputLabel,Input, InputAdornment, FormControl, Divider, OutlinedInput,Grid} from '@material-ui/core'
import {FiberManualRecord} from '@material-ui/icons';
import arange from 'lodash/range'
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const background = '#f3f3f3';
const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };
const width = 480
const height = 480
const green = "#27AE60"

export default function Simulator() {
  const [price, setPrice] = useState([1200, 2800]);
  const [p0, setP0] = useState(1820);
  const [w0, setW0] = useState(15000);
  const Pa = price[0]
  const Pb = price[1]
  const RangeMax = p0*2.5
  const RangeMin = p0/5
  const get_y = (w, p) => {
    if(p <= Pa){
      return 0
    }else if(p >= Pb){
      return w
    }else{
      return w * (1-Math.sqrt(Pa/p))/(2-Math.sqrt(Pa/p)-Math.sqrt(p/Pb))
    }
  }
  const get_x = (w, p) => (w-get_y(w,p)) / p
  const y0 = get_y(w0, p0)
  const x0 = get_x(w0, p0)
  const get_deposit_ratio = ()=>{
    if (y0 == 0){
      return '100 : 0'
    }else if(x0 == 0){
      return '0 : 100'
    }else if(x0 * p0 >= y0){
      const r = Math.round((x0*p0/w0)*100)
      return  r + ' : ' + (100 - r)
    }else{
      const r = Math.round((y0/w0)*100)
      return (100-r) + ' : ' + r
    }
  }
  const L_v3 = p =>  w0/(2*Math.sqrt(p) - Math.sqrt(Pa)- p/Math.sqrt(Pb))
  const L_v2 = p =>  w0/(2*Math.sqrt(p))

  const Effeciancy = p => 1/(1-0.5 * Math.sqrt(Pa/p)- 0.5 * Math.sqrt(p/Pb))
  const w_v3 = (p) =>{
    if(p<= Pa){
      return  L_v3(p0) * p * (1/Math.sqrt(Pa) - 1/Math.sqrt(Pb))
    }else if(p >= Pb){
      return  L_v3(p0) * (Math.sqrt(Pb) - Math.sqrt(Pa))
    }else{
      return  L_v3(p0) *(2*Math.sqrt(p) - Math.sqrt(Pa) - p/Math.sqrt(Pb))
    }
  }
  const w_v2 = (p) => L_v2(p0) *2*Math.sqrt(p)
  const w_hold = (p)=> w0/2 + p * w0/2/p0
  const w_hold_imbalance = (p) => y0 + p * x0
  const getILv3 = (p)=>(w_v3(p) - w_hold(p))/w_hold(p) * 100
  const getILv2 = (p)=>(w_v2(p) - w_hold(p))/w_hold(p) * 100
  const getILv3_imbalance = (p)=>(w_v3(p) - w_hold_imbalance(p))/w_hold_imbalance(p) * 100
  const getILv2_imbalance = (p)=>(w_v2(p) - w_hold_imbalance(p))/w_hold_imbalance(p) * 100
  const px = arange(RangeMin, RangeMax,p0*0.01)
  const ILv3_trace = px.map(d=>{return {x:d,y: getILv3(d)}})
  const ILv2_trace = px.map(d=>{return {x:d,y: getILv2(d)}})
  const ILv3_imbalance_trace = px.map(d=>{return {x:d,y: getILv3_imbalance(d)}})
  const ILv2_imbalance_trace = px.map(d=>{return {x:d,y: getILv2_imbalance(d)}})
  const w_v3_trace = px.map(d=>{return {x:d,y: w_v3(d)}})
  const w_v2_trace = px.map(d=>{return {x:d,y: w_v2(d)}})
  const w_hold_trace = px.map(d=>{return {x:d,y: w_hold(d)}})
  const w_hold_imbalance_trace = px.map(d=>{return {x:d,y: w_hold_imbalance(d)}})

  const options1 = {
    chart: {
      zoom: {enabled: false},
      animations: {
        easing: "linear",
        dynamicAnimation: {
          speed: 500
        }
      }
    },
    title: {
      text: 'Impermanent Loss',
      align: 'left'
    },
    subtitle: {
      text: 'vs. 50:50 HODL (' + (w0/2/p0).toPrecision(3) + ' ETH, ' + Math.round(w0/2) + ' USD)'
    },
    annotations:{
      xaxis: [
        {
          x: Pa,
          x2: Pb,
          fillColor: '#B3F7CA',
          label: {
            textAnchor: 'start',
            position: 'top',
            orientation: 'horizontal',
            offsetX: 5,
            offsetY: 7,
            text: 'Liquidity Range in V3'
          }
        }
      ],
    },
    stroke:{width:2},
    xaxis: {
      title: {text: "ETH/USD"},
      tickAmount: 5,
      type: 'numeric',
    },
    yaxis: {
      title: { text: "Impermanent Loss (%)" },
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        formatter: v => Math.round(v)
      }
    },
    tooltip: {
      x:{
        formatter: d => "ETH/USD $"+ Math.round(d)
      },
      y:{
        formatter: d => "IL " + d.toFixed(1)+ "%"
      }
    }
  };
  const options2 = {
    chart: {
      zoom: {enabled: false},
      animations: {
        easing: "linear",
        dynamicAnimation: {
          speed: 500
        }
      },
    },
    title: {
      text: 'Deposit Value',
      align: 'left'
    },
    annotations:{
      xaxis: [
        {
          x: Pa,
          x2: Pb,
          fillColor: '#B3F7CA',
          label: {
            textAnchor: 'start',
            position: 'top',
            orientation: 'horizontal',
            offsetX: 5,
            offsetY: 7,
            text: 'Liquidity Range in V3'
          }
        }
      ],
    },
    stroke:{width:2},
    xaxis: {
      type: 'numeric',
      title: {text: "ETH/USD"},
      tickAmount: 5,
    },
    yaxis: {
      title: { text: "Deposit Value(USD)" },
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        formatter: v => Math.round(v)
      }
    },
    tooltip: {
      x:{
        formatter: d => "ETH/USD $"+ Math.round(d)
      },
      y:{
        formatter: d => "$" + Math.round(d)
      }
    }
  };
  const options3 = {
    chart: {
      zoom: {enabled: false},
      animations: {
        easing: "linear",
        dynamicAnimation: {
          speed: 500
        }
      }
    },
    title: {
      text: 'Impermanent Loss',
      align: 'left'
    },
    subtitle: {
      text: 'vs. Imbalanced HODL (' + x0.toPrecision(3) + 'ETH, ' + Math.round(y0) + ' USD)'
    },
    annotations:{
      xaxis: [
        {
          x: Pa,
          x2: Pb,
          fillColor: '#B3F7CA',
          label: {
            textAnchor: 'start',
            position: 'top',
            orientation: 'horizontal',
            offsetX: 5,
            offsetY: 7,
            text: 'Liquidity Range in V3'
          }
        }
      ],
    },
    stroke:{width:2},
    xaxis: {
      title: {text: "ETH/USD"},
      tickAmount: 5,
      type: 'numeric',
    },
    yaxis: {
      title: { text: "Impermanent Loss (%)" },
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        formatter: v => Math.round(v)
      }
    },
    tooltip: {
      x:{
        formatter: d => "ETH/USD $"+ Math.round(d)
      },
      y:{
        formatter: d => "IL " + d.toFixed(1)+ "%"
      }
    }
  };
  
  return (
    <Box>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={5} lg={4} sx={{pt:.5}} justifyContent='center'>
          <Paper sx={{p:2,m:.8,mt:1,pt:3, pb:1.5}}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl variant="outlined" fullWidth >
                  <InputLabel htmlFor="deposit_valuet">Liquidity Deposit Value</InputLabel>
                  <OutlinedInput
                    id="deposit_valuet"
                    value={w0}
                    type = 'number'
                    onChange={e=>{setW0(Number(e.target.value))}}
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    label = 'Liquidity Deposit Value'
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl variant="outlined" fullWidth >
                  <InputLabel htmlFor="current_eth_price">Current ETH price</InputLabel>
                  <OutlinedInput
                    id="current_eth_price"
                    value={p0}
                    type = 'number'
                    onChange={e=>{setP0(Number(e.target.value))}}
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    label = 'Current ETH price'
                  />
                </FormControl>                 
              </Grid>
            </Grid>
            <Typography id="range-slider" gutterBottom sx={{pb:6, pt:3}}>
              Select ETH price range
            </Typography>
            <Slider
              value={price}
              onChange={(e,newPrice)=>{setPrice(newPrice as number[])}}
              sx = {{
                '& .MuiSlider-mark': {
                  background: "gray",
                  width: "2px",
                  height: "20px",
                  marginTop: "-9px"
                }
              }}
              aria-labelledby="range-slider"
              valueLabelDisplay = 'on'
              marks={[{value: p0, label: 'current price: $'+p0}]}
              components = {{
                // ValueLabel: ({children, value})=><Tooltip enterTouchDelay={0} placement="top" open={true} title={"$"+value}>{children}</Tooltip>,
              }}
              min= {RangeMin}
              max= {RangeMax}
            />
            <Divider sx={{py: 0.5}}/>
            <Grid container justifyContent="center" alignItems="flex-start">
              <Grid item xs={6}>
                <Box px={1}>
                  <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', my:2}}><FiberManualRecord fontSize="small" style={{color: green}}/>V3 Range Position</Typography>
                  <Typography variant='caption'>Capital Required</Typography>
                  <Typography variant='h5' style={{color:green}}>${w0}</Typography>
                  <Typography variant='caption'>Deposit ratio (ETH:USD)</Typography>
                  <Typography variant='h5' style={{color:green}}>{get_deposit_ratio()}</Typography>                  
                  <Typography variant='caption'>Fees per $ vs. V2</Typography>
                  <Typography variant='h5' style={{color:green}}>{Effeciancy(p0).toPrecision(3)}x</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box px={1}>
                  <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', my:2}}><FiberManualRecord fontSize="small" style={{color: 'gray'}}/>V2 Range Position</Typography>
                  <Typography variant='caption'>Capital Required</Typography>
                  <Typography variant='h5'>${Math.round(w0 * Effeciancy(p0))}</Typography>
                  <Typography variant='caption'>Deposit ratio (ETH:USD)</Typography>
                  <Typography variant='h5'>50 : 50</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7} container justifyContent='center'>
          <Grid item xs={12} lg={11}>
            <Paper sx={{p:.5,py:1,m:.8,mt:1}}>
              <Box>
                <Chart 
                  type="line" 
                  options={options2} 
                  series={[{name:'Uniswap v2', data:w_v2_trace},{name:'Uniswap v3' ,data:w_v3_trace}, {name:'HODL', data:w_hold_trace}, {name:'HODL Imbalanced', data:w_hold_imbalance_trace}]} 
                />
              </Box>
            </Paper>
          </Grid>        
          <Grid item xs={12} lg={11}>
            <Paper sx={{p:.5,py:1,m:.8,mt:1}}>
              <Box>
                <Chart 
                  type="line" 
                  options={options1} 
                  series={[{name:'Uniswap v2', data:ILv2_trace},{name:'Uniswap v3' ,data:ILv3_trace}]} 
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={11}>
            <Paper sx={{p:.5,py:1,m:.8,mt:1}}>
              <Box>
                <Chart 
                  type="line" 
                  options={options3} 
                  series={[{name:'Uniswap v2', data:ILv2_imbalance_trace},{name:'Uniswap v3' ,data:ILv3_imbalance_trace}]} 
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
