import React from 'react';

const JudgeSelector = ({ judges = [], value, onChange }) => {
  return (
    <div>
      <label className="label-base">Select Judge</label>
      <select className="input-base" value={value} onChange={onChange} required>
        <option value="">Choose a judge</option>
        {judges.map((judge) => (
          <option key={judge._id} value={judge._id}>
            {judge.name} ({judge.email})
          </option>
        ))}
      </select>
    </div>
  );
};

export default JudgeSelector;
