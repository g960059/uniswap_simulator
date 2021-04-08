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
      onChange={e=>{setTmpValue(Number(e.target.value))}}
      onBlur = {()=> {updateValue(tmpValue)}}
      onKeyDown={e => {
        if (e.key == 'Enter') {
          updateValue(tmpValue);
          e.currentTarget.blur();
        }
      }}
      startAdornment={<InputAdornment position="start">$</InputAdornment>}
    />  
  )
}

export default ReactiveInput