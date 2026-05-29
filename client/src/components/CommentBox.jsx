import React from 'react';

const CommentBox = ({ value, onChange }) => {
  return (
    <div>
      <label className="label-base">Comments</label>
      <textarea className="input-base min-h-28" value={value} onChange={onChange} placeholder="Add concise feedback for the participant or team" />
    </div>
  );
};

export default CommentBox;
