import React, { useState, useEffect, useLayoutEffect } from 'react';
import {Box,TableCell as MuiTableCell,Divider,Typography,Hidden, Stack,Slide,Grid} from '@material-ui/core';
import { makeStyles, createStyles} from '@material-ui/core/styles';
import {useAtom} from 'jotai'
import { useUpdateAtom, useAtomValue } from 'jotai/utils'
import {selectedPositionIdAtom, selectedPositionAtom, deletePositionAtom, selectedStrategyIdAtom, slideDirectionAtom} from '../src/store/index'
import StrategyList from '../src/components/StrategyList'
import StrategyBox from '../src/components/StrategyBox'
import PlotBox from '../src/components/PlotBox'
import PositionBox from '../src/components/PositionBox'


const useStyles = makeStyles((theme) =>
  createStyles({
    containerBox: {
      overflow: 'hidden',
      overflowY: 'scroll',
      height: `auto`,
      [theme.breakpoints.up('md')]: {
        height: `calc(100vh - 56px)`,
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
    },
  })
);

const Simulator = () => {
  const classes = useStyles();
  const selectedPositionId = useAtomValue(selectedPositionIdAtom);
  const selectedStrategyId = useAtomValue(selectedStrategyIdAtom);
  const [slideDirection, setSlideDirection] = useAtom(slideDirectionAtom);
  
  return (
    <> 
      <Hidden smDown>
        <Divider sx={{ mt: -0.5 }} />
      </Hidden>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={5} lg={4} justifyContent='center' sx={{order:[1,0]}}>
          <Box className={classes.containerBox}>
            {(selectedPositionId != null  && selectedPositionId != null) && <Slide direction="left" in={selectedPositionId != null && selectedPositionId != null} mountOnEnter unmountOnExit>
                <div><PositionBox/></div>
              </Slide>
            }
            {(selectedStrategyId != null && selectedPositionId === null) && 
              <Slide direction={slideDirection} in={selectedStrategyId != null && selectedPositionId === null} mountOnEnter unmountOnExit>
                <div><StrategyBox/></div>
              </Slide>
            }              
            {selectedPositionId == null && selectedStrategyId == null && <Slide direction="right" in={selectedPositionId == null && selectedStrategyId == null} mountOnEnter unmountOnExit>
                <div><StrategyList/></div>
              </Slide>
            }
        </Box>
          <Hidden smDown>
            <Divider orientation="vertical" flexItem/>
          </Hidden>            
        </Grid>
        <Grid item xs={12} md={7} lg={8} sx={{order:[0,1]}}>
          <Box className={classes.containerBox}>
            <PlotBox/>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Simulator;

