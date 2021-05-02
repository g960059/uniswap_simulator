import React, { useState, useEffect, useLayoutEffect } from 'react';
import {Box,Table,TableBody,Grid,TableHead,TableCell as MuiTableCell,TableRow,Paper,Divider,Avatar,Typography,Hidden,OutlinedInput, Slider, CardContent, Stack, FormControl, DialogTitle,DialogActions,DialogContent,DialogContentText,Button, TextField} from '@material-ui/core';
import Image from 'next/image'
// import {Settings, Close, Add, Delete} from '@material-ui/icons';
import { makeStyles, createStyles, Theme, withStyles} from '@material-ui/core/styles';
import Split from 'react-split-grid';
import {useAtom} from 'jotai'
import {poolAtom, token0Atom,token1Atom} from '../src/store/index'
import AccountManagement from '../src/components/AccountManagement'
import PriceSimulationBox from '../src/components/PriceSimulatonBox'
import InfoBox from '../src/components/InfoBox'



const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    containerBox: {
      overflow: 'hidden',
      overflowY: 'scroll',
      height: `calc(100vh - 56px)`,
      [theme.breakpoints.up('xs')]: {
        height: `calc(100vh - 48px)`,
      },
      [theme.breakpoints.up('sm')]: {
        height: `calc(100vh - 64px)`,
      },
    },
    gridBox: {
      display: 'grid',
      gridTemplateColumns: '1fr 1px 2fr',
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr !important',
      },
    }
  })
);

const Simulator = () => {
  const classes = useStyles();
  const [pool] = useAtom(poolAtom)
  const [token0, setToken0] = useAtom(token0Atom);
  const [token1, setToken1] = useAtom(token1Atom);
  
  return (
    <>
      <Divider sx={{ mt: -0.5 }} />
      <Split
        render={({ getGridProps, getGutterProps }) => (
          <Box {...getGridProps()} className={classes.gridBox} >
            <Box  className={classes.containerBox} minWidth={450} sx={{backgroundColor: '#fffcfc94'}}>
              <Box px={2} pt={2}>
                <AccountManagement/>
              </Box>
              <Box px={2}>
                <InfoBox/>
              </Box>
              
            </Box>
            <Hidden smDown>
              <Divider {...getGutterProps('column', 1)} sx={{gridColumn:2, cursor:'col-resize'}} orientation="vertical" flexItem/>
            </Hidden>
            <Box  className={classes.containerBox}>
            </Box>
          </Box>
        )}
      />
    </>
  );
};

export default Simulator;


{/* <Typography variant='h6'>All Current Positions</Typography>
{uniswapV2BalanceData.uniswap_v2.balances.map(balance=>(
  <Paper variant='outlined' sx={{my:1, p:2}} key={balance.pool_token.contract_address}>
    <Grid container>
      <Grid item xs={8}>
        <Stack direction='row' spacing={1}>
          <AvatarGroup max={2}>
            <Avatar sx={{ width: 24, height: 24 }} src={balance.token_0.logo_url}>{balance.token_0.contract_ticker_symbol[0].toUpperCase()}</Avatar>  
            <Avatar sx={{ width: 24, height: 24 }} src={balance.token_1.logo_url}>{balance.token_1.contract_ticker_symbol[0].toUpperCase()}</Avatar> 
          </AvatarGroup>
          <Typography variant='subtitle1'>{balance.token_0.contract_ticker_symbol}-{balance.token_1.contract_ticker_symbol}</Typography>
        </Stack>
      </Grid>
      <Grid item xs={4}>
        <Typography variant='subtitle1'>${Math.round(balance.pool_token.quote).toLocaleString()}</Typography>
      </Grid>
    </Grid>
  </Paper>
))} */}