import React from 'react';
import {Box, Paper} from '@material-ui/core'
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });


const ChartBox = React.memo(({options, series}) =>{
  return (
    <Paper sx={{p:.5,py:1,m:.8,mt:1}}>
      <Box>
        <Chart 
          type="line" 
          options={options} 
          series={series} 
        />
      </Box>
    </Paper>
  )
})

export default ChartBox