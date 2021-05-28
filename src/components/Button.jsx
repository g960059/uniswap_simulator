import { experimentalStyled as styled } from '@material-ui/core/styles';
import MuiButton from '@material-ui/core/Button';

const Button = styled(MuiButton)({
  boxShadow: '0 2px 4px -2px rgb(0 0 0 / 10%)',
  backgroundColor: 'white',
  border: '1px solid #5c93bb2b',
  '&:hover': {
    backgroundColor: '#eff6fb99',
    borderColor: '#cfdce6',
  },
});


export default Button