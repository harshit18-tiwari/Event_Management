import React from 'react';

const TeamSelector = ({ teams = [], value, onChange }) => {
  return (
    <div>
      <label className="label-base">Select Team</label>
      <select className="input-base" value={value} onChange={onChange} required>
        <option value="">Choose a team</option>
        {teams.map((team) => (
          <option key={team._id} value={team._id}>
            {team.name} ({team.members?.length || 0}/{team.maxMembers})
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamSelector;
