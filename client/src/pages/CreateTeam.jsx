import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', maxMembers: 5 });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await teamService.createTeam({
        ...form,
        maxMembers: Number(form.maxMembers),
      });
      navigate(`/teams/${response.data.team._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Team Management</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Create a new team</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Start a team for your event projects, manage the roster, and invite members.
          </p>
        </section>

        <div className="page-card p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Team Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-400"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Max Members</label>
              <input
                type="number"
                name="maxMembers"
                min="1"
                value={form.maxMembers}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-400"
                required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-3 disabled:opacity-60">
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
