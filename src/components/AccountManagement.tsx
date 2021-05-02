import React,{useState} from 'react';
import {Box,Paper,Avatar,AvatarGroup,Typography,IconButton,FormControl,Select, MenuItem, Stack, Dialog, DialogTitle,DialogContent,Button, TextField} from '@material-ui/core';
import {Settings, Close, Add, Delete} from '@material-ui/icons';

import {useAtom} from 'jotai'
import {accountAtom,accountsAtom, uniswapV2BalanceAtom, poolAtom} from '../store/index'
import { useForm, Controller } from "react-hook-form";

const AccountManagement = React.memo(() =>{
  const { handleSubmit, control,watch,setValue } = useForm();
  const [account, setAccount] = useAtom(accountAtom)
  const [accounts, setAccounts] = useAtom(accountsAtom)
  const [uniswapV2Balances] = useAtom(uniswapV2BalanceAtom)
  const [pool, setPool] = useAtom(poolAtom)

  const [openAccountManagement, setOpenAccountManagement] = useState(false);

  return (
    <>
      <Dialog open={openAccountManagement} onClose={()=>{setOpenAccountManagement(false)}} fullWidth maxWidth='sm'>
        <DialogTitle disableTypography sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <Typography variant="h6" component="div">Manage Accounts</Typography>
          <IconButton onClick={()=>{setOpenAccountManagement(false)}} ><Close/></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2}>
            <Controller name='accountInput' control={control} 
              render={({field})=> <TextField error={accounts.includes(watch('accountInput'))} placeholder="Enter valid Ethereum address" helperText={accounts.includes(watch('accountInput')) && 'This address has already been registered.'} fullWidth {...field} />} 
            />
            <Button 
              variant='contained'
              sx={{width:'170px'}}
              disabled={!watch('accountInput')?.match(/^0x[a-fA-F0-9]{40}$/) || accounts.includes(watch('accountInput'))} 
              startIcon={<Add/>} 
              onClick={handleSubmit(({accountInput})=>{
                if(!account) setAccount(accountInput);
                setAccounts([...accounts,accountInput])
                setValue('accountInput','')
            })}>Add</Button>
          </Stack>
          <Box py={2} mt={2}>
            {accounts.length !=0 && <Typography variant='h6'>Watch List</Typography>}
            <Box>
              {accounts.map(address =>(
              <Paper variant='outlined' sx={{px:2,py:0.5,my:2}} key={address}>
                <Stack direction='row' justifyContent="space-between" alignItems="center">
                {address}<IconButton onClick={()=>{setAccounts(accounts.filter(a=> a!=address));if(account===address){setAccount('')}}}><Delete/></IconButton>
                </Stack>
              </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>                
      <Box p={1} pr={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <FormControl variant='outlined' fullWidth sx={{minWidth:200, backgroundColor:'white'}}>
              <Select
                labelId ="eth-address-input-label"
                id = "eth-address-input"
                value={account}
                onChange={e=>{setAccount(e.target.value)}}
                displayEmpty
                renderValue={(value)=>{if(!value){return <Typography color='gray'>Select your ETH address</Typography> }else{return value}}}
                MenuProps={{
                  getContentAnchorEl: null,
                  anchorOrigin:{
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin:{
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
              >
                { accounts.length ===0 ? 
                <MenuItem value='' disabled>No options</MenuItem>:
                accounts.map(address => (
                  <MenuItem value={address} key={address}>{address}</MenuItem>
                ))}
              </Select>
          </FormControl>
          <Button  sx={{ml:1,mr:-1, height:56, width:48}} onClick={()=>{setOpenAccountManagement(true)}}>{accounts.length ===0 ? <Add/> : <Settings/>}</Button>
          {/* <Button variant='outlined' startIcon={<Settings/>} sx={{ml:2, height:56}} onClick={()=>{setOpenAccountManagement(true)}}>Edit</Button> */}
        </Stack>
        {
          uniswapV2Balances?.length != 0 &&
          <FormControl variant='outlined' fullWidth sx={{mt:2, minWidth:200, backgroundColor:'white'}}>
            <Select
              labelId ="eth-address-input-label"
              id = "eth-address-input"
              value={pool?.pool_token?.contract_ticker_symbol}
              onChange={e=>{setPool(uniswapV2Balances?.find(balance =>balance.pool_token.contract_ticker_symbol===e.target.value))}}
              displayEmpty
              renderValue={(value)=>{
                if(!value){
                  return <Typography color='gray'>Select Pool</Typography> 
                }else{
                  console.log(value)
                  const balance_ = uniswapV2Balances.find(balance =>balance.pool_token.contract_ticker_symbol==value)
                  return (
                    <Stack direction='row' spacing={2} alignContent='center'>
                      <AvatarGroup max={2}>
                        <Avatar sx={{ width: 24, height: 24 }} src={balance_.token_0.logo_url}>{balance_.token_0.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
                        <Avatar sx={{ width: 24, height: 24 }} src={balance_.token_1.logo_url}>{balance_.token_1.contract_ticker_symbol[0].toUpperCase()}</Avatar> 
                      </AvatarGroup>
                      <Typography variant='subtitle1'>{balance_.token_0.contract_ticker_symbol}-{balance_.token_1.contract_ticker_symbol}</Typography>
                    </Stack>)
              }}}
              MenuProps={{
                getContentAnchorEl: null,
                anchorOrigin:{
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin:{
                  vertical: 'top',
                  horizontal: 'left',
                }
              }}
            >
              { uniswapV2Balances?.length ===0 ? 
              <MenuItem value='' disabled>No options</MenuItem>:
              uniswapV2Balances?.map(balance => (
                <MenuItem value={balance.pool_token.contract_ticker_symbol} key={balance.pool_token.contract_address}>
                  <Stack direction='row' spacing={1} alignContent='center'>
                    <AvatarGroup max={2}>
                      <Avatar sx={{ width: 24, height: 24 }} src={balance.token_0.logo_url}>{balance.token_0.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
                      <Avatar sx={{ width: 24, height: 24 }} src={balance.token_1.logo_url}>{balance.token_1.contract_ticker_symbol[0].toUpperCase()}</Avatar> 
                    </AvatarGroup>
                    <Typography variant='subtitle1'>{balance.token_0.contract_ticker_symbol}-{balance.token_1.contract_ticker_symbol}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>      
        }
       </Box>
    </>
  )
})

export default AccountManagement