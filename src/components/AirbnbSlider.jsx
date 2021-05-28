import {Slider} from '@material-ui/core'
import { experimentalStyled as styled} from '@material-ui/core/styles';

const AirbnbSlider = styled(Slider)({
  height: 3,
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '#ccc 0 2px 3px 1px',
    },
    '& .bar': {
      // display: inline-block !important;
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  '& .MuiSlider-track': {
    height: 3,
  },
  '& .MuiSlider-rail': {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
  '& .MuiSlider-valueLabel': {
    left: 'calc(-50% + 4px)',
    top: -21,
    '& *': {
      background: 'transparent',
      color: '#000',
    },
  },
  '& .MuiSlider-valueLabelCircle':{
    width: 40
  }
});

export default  AirbnbSlider