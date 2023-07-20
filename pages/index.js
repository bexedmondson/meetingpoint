import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Selector from './multiselectcomponent';
import MeetingPoint from './meetingpoint';
import london from '../data/london.json';

let stations = [];
london.stations.forEach(station => {
    stations.push({value: station.id, label: station.name})
});

export default function Home() {
  var state = {
    hasResult: false,
    result: null,
    selectedStarts: [],
    selectedEnds: []
  };

  const handleStartChange = (selectedOptions) => {
    state.selectedStarts = selectedOptions;
  };

  const getStarts = () => {
    return state.selectedStarts;
  }

  const handleEndChange = (selectedOptions) => {
    state.selectedEnds = {selectedOptions};
  };

  const getEnds = () => {
    return state.selectedEnds;
  }

  const setResult = (result) => {
    state.result = result;
    state.hasResult = true;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Find some things!
        </h1>

        <div className={styles.grid}>

          <div className={styles.container}>
            <h3>Select start stations</h3>
            <Selector stations={stations} selectedOptions={state.selectedStarts} set={handleStartChange}></Selector>
          </div>

          <div className={styles.container}>
            <h3>Select possible end stations</h3>
            <Selector stations={stations} selectedOptions={state.selectedEnds} set={handleEndChange}></Selector>
          </div>

          <div className={styles.container}>
            <h3>
            <MeetingPoint starts={getStarts} ends={getEnds} setResult={setResult}></MeetingPoint>
            </h3>
          </div>

        </div>

      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
