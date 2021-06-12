
import Layout from '../src/components/layout'
import {pink,teal,blueGrey} from '@material-ui/core/colors'
import {createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import usePageView from '../src/hooks/usePageView'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: pink[400]
    },
    secondary:{
      main: teal[500]
    },
    grey: {
      main: blueGrey[700]
    }
  },
});

// const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  usePageView()
  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  )
}

export default MyApp
