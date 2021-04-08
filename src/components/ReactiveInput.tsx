import React, {useState, useEffect} from "react";
import { OutlinedInput, InputAdornment} from "@material-ui/core";

const ReactiveInput = ({value, updateValue}) => {
  const [tmpValue, setTmpValue] = useState<Number>();
  useEffect(() => {
    setTmpValue(value)
  }, [value]);
  return (
    <OutlinedInput
      id="current_eth_price"
      value={tmpValue}
      type = 'number'
      onChange={e=>{if(e.target.value==''){setTmpValue(NaN)}else{setTmpValue(Number(e.target.value))}}}
      onBlur = {e => {if(tmpValue!=0 && e.target.value != '') updateValue(tmpValue)}}
      onKeyDown={e => {
        if (e.key == 'Enter' && tmpValue!=0 && e.currentTarget.value != '') {
          updateValue(tmpValue);
          e.currentTarget.blur();
        }
      }}
      startAdornment={<InputAdornment position="start">$</InputAdornment>}
    />  
  )
}

export default ReactiveInput