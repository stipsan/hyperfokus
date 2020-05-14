import Head from 'next/head'
import Counter from '../components/Counter'

export default () => (
  <>
    <Head>
      <title>Index page</title>
    </Head>
    <div className="container hero bg-gray-300">
      Hello world! <Counter />
    </div>
  </>
)
