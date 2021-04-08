import React, {useState, useEffect} from 'react';
import {Slider} from '@material-ui/core'

const PriceRangeSlider =(props) =>{
  const {Pa,Pb,p0,setPrice, RangeMin,RangeMax} = props
  const [tmpPrices, setTmpPrices] = useState([Pa, Pb]);
  return (
    <Slider
      value={tmpPrices}
      onChange={(e,newPrice)=>{setTmpPrices(newPrice)}}
      onChangeCommitted = {(e,newPrice)=>{setTmpPrices(newPrice);setPrice(newPrice)}}
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
      min= {RangeMin}
      max= {RangeMax}
  />)
}

export default PriceRangeSlider