import React, { useEffect, useState } from 'react';

const CriteriaForm = ({ initial = {}, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    maxMarks: initial.maxMarks || '',
  });

  useEffect(() => {
    setForm({
      title: initial.title || '',
      description: initial.description || '',
      maxMarks: initial.maxMarks || '',
    });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      description: form.description,
      maxMarks: Number(form.maxMarks),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label-base">Title</label>
        <input className="input-base" name="title" value={form.title} onChange={handleChange} required placeholder="Innovation" />
      </div>
      <div>
        <label className="label-base">Description</label>
        <textarea className="input-base min-h-24" name="description" value={form.description} onChange={handleChange} placeholder="Describe this criterion" />
      </div>
      <div>
        <label className="label-base">Max Marks</label>
        <input className="input-base" type="number" min="1" name="maxMarks" value={form.maxMarks} onChange={handleChange} required placeholder="30" />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary px-5 py-3 disabled:opacity-60">
        {submitting ? 'Saving...' : 'Save Criteria'}
      </button>
    </form>
  );
};

export default CriteriaForm;
