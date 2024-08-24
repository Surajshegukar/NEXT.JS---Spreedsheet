import Head from 'next/head';
import Spreadsheet from './components/page';


export default function Home() {
  return (
    <div>
      <Head>
        <title>Spreadsheet App</title>
        <meta name="description" content="A simple spreadsheet application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spreadsheet />
      </main>
    </div>
  );
}
