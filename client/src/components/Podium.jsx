import React from 'react';
import WinnerCard from './WinnerCard';

const Podium = ({ entries = [] }) => {
  const winner = entries[0];
  const runnerUp = entries[1];
  const secondRunnerUp = entries[2];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:mt-8">
        <WinnerCard title="Runner-Up" entry={runnerUp} />
      </div>
      <div>
        <WinnerCard title="Winner" entry={winner} />
      </div>
      <div className="lg:mt-12">
        <WinnerCard title="Second Runner-Up" entry={secondRunnerUp} />
      </div>
    </div>
  );
};

export default Podium;