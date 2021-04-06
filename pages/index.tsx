import React, {useState} from 'react';
import {Box, Paper, Slider, Typography, Tooltip, TextField, InputAdornment, FormControl, Divider, OutlinedInput,Grid} from '@material-ui/core'
import {FiberManualRecord} from '@material-ui/icons';
import arange from 'lodash/range'
import dynamic from 'next/dynamic';
import { makeStyles, createStyles } from '@material-ui/core/styles';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });


export const background = '#f3f3f3';
const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };
const width = 480
const height = 480
const green = "#27AE60"

export default function Simulator() {
  const [price, setPrice] = useState([1200, 2800]);
  const [w0, setW0] = useState(15000);
  const p0 = 1820
  const Pa = price[0]
  const Pb = price[1]
  const RangeMax = p0*2.5
  const RangeMin = p0/5
  const y0 = w0/2
  const x0 = y0/p0
  const L = Math.sqrt((w0/2)**2/p0)
  const w0_concentrated = L*(2*Math.sqrt(p0) - Math.sqrt(Pa) - p0/Math.sqrt(Pb))
  const Effeciancy = w0 /w0_concentrated
  const w_v3 = (p) =>{
    if(p<= Pa){
      return Effeciancy * L * (Math.sqrt(Pa) - Pa/Math.sqrt(Pb))
    }else if(p >= Pb){
      return  Effeciancy * L * (Math.sqrt(Pb) - Math.sqrt(Pa))
    }else{
      return Effeciancy *  L*(2*Math.sqrt(p) - Math.sqrt(Pa) - p/Math.sqrt(Pb))
    }
  }
  const w_v2 = (p) => L*2*Math.sqrt(p)
  const w_hold = (p)=> y0 + p * x0
  const getILv3 = (p)=>(w_v3(p) - w_hold(p))/w_hold(p) * 100
  const getILv2 = (p)=>(w_v2(p) - w_hold(p))/w_hold(p) * 100
  const px = arange(RangeMin, RangeMax,p0*0.01)
  const ILv3_trace = px.map(d=>{return {x:d,y: getILv3(d)}})
  const ILv2_trace = px.map(d=>{return {x:d,y: getILv2(d)}})
  const w_v3_trace = px.map(d=>{return {x:d,y: w_v3(d)}})
  const w_v2_trace = px.map(d=>{return {x:d,y: w_v2(d)}})
  const w_hold_trace = px.map(d=>{return {x:d,y: w_hold(d)}})
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

  
  return (
    <Box>
      <Grid container justifyContent='center' sx={{pt:.5}}>
        <Grid item xs={12} sm={6} md={5}>
          <Paper sx={{p:2,m:.8,mt:1, pb:1}}>
            <Typography gutterBottom sx={{pb:1}}>
              Liquidity Deposit Value
            </Typography>
            <FormControl>
              <OutlinedInput
                id="deposit_valuet"
                value={w0}
                type = 'number'
                onChange={e=>{setW0(Number(e.target.value))}}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
              />
            </FormControl>
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
                  top: "10px",
                }
              }}
              aria-labelledby="range-slider"
              valueLabelDisplay = 'on'
              marks={[{value: 1820, label: 'current price: $1820'}]}
              components = {{
                // ValueLabel: ({children, value})=><Tooltip enterTouchDelay={0} placement="top" open={true} title={"$"+value}>{children}</Tooltip>,
              }}
              min= {RangeMin}
              max= {RangeMax}
            />
          </Paper>
        </Grid>
        <Grid item  xs={12} sm={6} md={5}>
          <Paper sx={{p:2,m:.8,mt:1, py:1}}>
            <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
              <Grid item>
                <Box >
                  <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', my:2}}><FiberManualRecord fontSize="small" style={{color: green}}/>V3 Range Position</Typography>
                  <Typography variant='caption'>Capital Required</Typography>
                  <Typography variant='h5' style={{color:green}}>${w0}</Typography>
                  <Typography variant='caption'>Fees per $ vs. V2</Typography>
                  <Typography variant='h5' style={{color:green}}>{Effeciancy.toPrecision(3)}x</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box>
                  <Typography variant='subtitle1' sx={{display:'flex', alignItems: 'center', my:2}}><FiberManualRecord fontSize="small" style={{color: 'gray'}}/>V2 Range Position</Typography>
                  <Typography variant='caption'>Capital Required</Typography>
                  <Typography variant='h5'>${Math.round(w0 * Effeciancy)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid container justifyContent='center'>
        <Grid item xs={12} sm={9} md={6}>
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
        <Grid item xs={12} sm={9} md={6}>
          <Paper sx={{p:.5,py:1,m:.8,mt:1}}>
            <Box>
              <Chart 
                type="line" 
                options={options2} 
                series={[{name:'Uniswap v2', data:w_v2_trace},{name:'Uniswap v3' ,data:w_v3_trace}, {name:'HODL', data:w_hold_trace}]} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
