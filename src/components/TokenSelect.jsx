import React,{ useMemo, useState} from 'react';
import {Typography,Stack, TextField, Autocomplete, useTheme, useMediaQuery,ListSubheader, Avatar,InputAdornment, AvatarGroup, Dialog, DialogContent, DialogTitle, DialogActions} from '@material-ui/core';

import {useAtom} from 'jotai'
import {activeTokenListsAtom} from '../store/index'
import { VariableSizeList } from 'react-window';
import Button from './Button'

const TokenSelect = React.memo(({token0, token1,setToken0, setToken1}) =>{
  const [token0Tmp, setToken0Tmp] = useState(token0);
  const [token1Tmp, setToken1Tmp] = useState(token1);
  const [openDialog, setOpenDialog] = useState(false);

  const [tokenLists] = useAtom(activeTokenListsAtom)
  const tokenOptions = useMemo(()=>Object.values(tokenLists),[])

  const LISTBOX_PADDING = 8; // px

  function renderRow(props) {
    const { data, index, style } = props;
    return React.cloneElement(data[index], {
      style: {
        ...style,
        top: style.top + LISTBOX_PADDING,
      },
    });
  }

  const OuterElementContext = React.createContext({});

  const OuterElementType = React.forwardRef((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  function useResetCache(data) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (ref.current != null) {
        ref.current.resetAfterIndex(0, true);
      }
    }, [data]);
    return ref;
  }

  // Adapter for react-window
  const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = React.Children.toArray(children);
    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
      noSsr: true,
    });

    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child) => {
      if (React.isValidElement(child) && child.type === ListSubheader) {
        return 48;
      }

      return itemSize;
    };
    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize;
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };
    const gridRef = useResetCache(itemCount);
    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

  return <>
    <Button 
      variant='outlined'
      color='grey'
      sx={{minWidth: 150}}
      startIcon={
        <AvatarGroup max={2}>
        <Avatar sx={{ width: 24, height: 24 }} src={token0.logoURI}>{token0.symbol}</Avatar>  
        <Avatar sx={{ width: 24, height: 24 }} src={token1.logoURI}>{token1.symbol}</Avatar> 
      </AvatarGroup>}
      onClick={()=>{setOpenDialog(true)}}
    >
      {token0.symbol}/{token1.symbol}
    </Button>
    <Dialog open={openDialog} onClose={e=>{setOpenDialog(false)}}>
      <DialogTitle>Select Token Pair</DialogTitle>
      <DialogContent>
        <Stack direction='row' spacing={3} justifyContent ="center" sx={{width:1}}>
          <Autocomplete
            fullWidth
            value={token0Tmp.symbol} 
            style={{ width: 200 }}
            disableListWrap
            ListboxComponent={ListboxComponent}
            sx ={{backgroundColor: 'white'}}
            options={tokenOptions.filter(token=>token.address != token1Tmp.address)}
            disableClearable
            renderInput={(params) => <TextField  required {...params} size="small" InputProps={{...params.InputProps,startAdornment:<InputAdornment position='start'><Avatar sx={{ width: 18, height: 18 }} src= {tokenOptions.find(x=> x.symbol == params.inputProps.value)?.logoURI}/></InputAdornment>}}/>}
            onChange={(e,token) => {setToken0Tmp(token)}}
            getOptionLabel={(token) => typeof(token)==='string' ? token: token.symbol}
            renderOption={(props, token) => (
              <li {...props}>
                <Stack direction="row" alignContent="center" justifyContent="center" spacing={2}>
                  <Avatar sx={{ width: 18, height: 18, my:1}} src={token.logoURI}>{token.symbol}</Avatar>
                  <Stack>
                    <Typography noWrap>{token.symbol}</Typography>
                    <Typography variant='caption' noWrap sx={{color:'text.disabled', mt:-1}}>{token.name}</Typography>
                  </Stack>
                </Stack>
              </li>
            )}                   
          />         
          <Autocomplete
            value={token1Tmp.symbol} 
            style={{ width : 200 }}
            fullWidth
            disableListWrap
            ListboxComponent={ListboxComponent}
            sx ={{backgroundColor: 'white'}}
            options={tokenOptions.filter(token=>token.address != token0Tmp.address)}
            disableClearable
            renderInput={(params) => 
              <TextField required {...params} size="small" InputProps={{...params.InputProps,startAdornment:<InputAdornment position='start'><Avatar sx={{ width: 18, height: 18 }} src= {tokenOptions.find(x=> x.symbol == params.inputProps.value)?.logoURI}/></InputAdornment>}} />}
              onChange={(e,token) => {setToken1Tmp(token)}}
            getOptionLabel={(token) => typeof(token)==='string' ? token: token.symbol}
            renderOption={(props, token) => (
              <li {...props}>
                <Stack direction="row" alignContent="center" spacing={3}>
                  <Avatar sx={{ width: 18, height: 18, my:1 }} src={token.logoURI}>{token.symbol}</Avatar>
                  <Stack>
                    <Typography noWrap>{token.symbol}</Typography>
                    <Typography variant='caption' noWrap sx={{color:'text.disabled', mt:-1}}>{token.name}</Typography>
                  </Stack>
                </Stack>
              </li>
            )}                   
          />          
        </Stack>   
      </DialogContent>
      <DialogActions>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Button color='grey' variant='outlined' disabled={token0Tmp.address ===token0.address && token1Tmp.address ===token1.address } onClick={()=>{setToken0(token0Tmp);setToken1(token1Tmp); setOpenDialog(false)}}>Select</Button>
          <Button color='grey' onClick={()=>{setToken0Tmp(token0); setToken1Tmp(token1);setOpenDialog(false)}} sx={{ml:1}}>Cancel</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  </>
})

export default TokenSelect