import React, {useState, useEffect} from "react";
import { OutlinedInput, InputAdornment, InputBase as MuiInputBase, TextField} from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';

export const Input = withStyles((theme) => ({
  root: {
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    border: '1px solid #5c93bb2b',
    '&:hover': {
      borderColor: '#3ea8ff',
    },    
  },
  input: {
    border: 'none',
    padding: '8px 16px'
  },
}))(MuiInputBase);



const ReactiveInput = ({value, updateValue, useAdornment=true, type ='number',variant='outlined', ...args}) => {
  const [tmpValue, setTmpValue] = useState<number | string>();
  useEffect(() => {
    setTmpValue(value)
  }, [value]);
  if(variant == 'outlined'){
    return (
      <TextField
        value={tmpValue}
        type = {type}
        onChange={e=>{
          if(e.target.value==''){
            if(type === 'number'){
              setTmpValue(NaN)
            }else{
              setTmpValue('')
            }
          }else{
            if(type === 'number'){
              setTmpValue(Number(e.target.value))
            }else{
              setTmpValue(e.target.value)
            }
          }
        }}
        onBlur = {e => {if(tmpValue!=0 && e.target.value != '') updateValue(tmpValue)}}
        onKeyDown={e => {
          if (e.key == 'Enter' && tmpValue!=0 && e.currentTarget.value != '') {
            updateValue(tmpValue);
            e.currentTarget.blur();
          }
        }}
        InputProps = {useAdornment && {startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        {...args}
      />  
    )
  }else{
    if(variant == 'standard'){
      return (
        <Input
          value={tmpValue}
          type = {type}
          onChange={e=>{
            if(e.target.value==''){
              if(type === 'number'){
                setTmpValue(NaN)
              }else{
                setTmpValue('')
              }
            }else{
              if(type === 'number'){
                setTmpValue(Number(e.target.value))
              }else{
                setTmpValue(e.target.value)
              }
            }
          }}
          onBlur = {e => {if(tmpValue!=0 && e.target.value != '') updateValue(tmpValue)}}
          onKeyDown={e => {
            if (e.key == 'Enter' && tmpValue!=0 && e.currentTarget.value != '') {
              updateValue(tmpValue);
              e.currentTarget.blur();
            }
          }}
          startAdornment={useAdornment && <InputAdornment position="start">$</InputAdornment>}
          {...args}
        />  
      )    
    }else{
      return <></>
    }
  }
}

export default ReactiveInput