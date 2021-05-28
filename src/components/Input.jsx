import { withStyles } from '@material-ui/core/styles';
import MuiInputBase from '@material-ui/core/InputBase';

const Input = withStyles((theme) => ({
  root: {
    boxShadow: '0 2px 4px -2px rgb(0 0 0 / 10%)',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #5c93bb2b',
    '&:focus': {
      backgroundColor: '#eff6fb99',
      borderColor: '#cfdce6',
    },    
  },
  input: {
    border: 'none',
    padding: '6px'
  },
}))(MuiInputBase);


export default Input
