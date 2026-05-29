import React from 'react';

const ScoreInput = ({ label, maxMarks, value, onChange }) => {
  return (
    <div>
      <label className="label-base">{label} <span className="text-slate-400">(Max {maxMarks})</span></label>
      <input className="input-base" type="number" min="0" max={maxMarks} value={value} onChange={onChange} required />
    </div>
  );
};

export default ScoreInput;
