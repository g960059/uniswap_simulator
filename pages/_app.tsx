
import Layout from '../src/components/layout'
import {pink} from '@material-ui/core/colors'
import {createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import * as gtag from '../src/lib/gtag'
import usePageView from '../src/hooks/usePageView'
import {NoSsr} from '@material-ui/core'
// import { QueryClient, QueryClientProvider } from 'react-query'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: pink[400]
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
