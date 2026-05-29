import React, { useState } from 'react';

const categories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];
const registrationTypes = ['Individual', 'Team'];

const EventForm = ({ initial = {}, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || 'Technical',
    venue: initial.venue || '',
    date: initial.date ? initial.date.slice(0,10) : '',
    startTime: initial.startTime || '',
    endTime: initial.endTime || '',
    organizer: initial.organizer || '',
    maxParticipants: initial.maxParticipants || '',
    poster: initial.poster || '',
    registrationType: initial.registrationType || 'Individual',
    minTeamSize: initial.minTeamSize || '',
    maxTeamSize: initial.maxTeamSize || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };

    if (payload.registrationType !== 'Team') {
      delete payload.minTeamSize;
      delete payload.maxTeamSize;
    } else {
      payload.minTeamSize = Number(payload.minTeamSize);
      payload.maxTeamSize = Number(payload.maxTeamSize);
    }

    payload.maxParticipants = Number(payload.maxParticipants);

    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label-base">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input-base" placeholder="Hackathon 2026" />
        </div>

        <div className="md:col-span-2">
          <label className="label-base">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="input-base min-h-32"
            rows={5}
            placeholder="Describe the event, goals, format, and audience."
          />
        </div>

        <div>
          <label className="label-base">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-base">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base">Venue</label>
          <input name="venue" value={form.venue} onChange={handleChange} required className="input-base" placeholder="Auditorium" />
        </div>

        <div>
          <label className="label-base">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required className="input-base" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Start</label>
            <input name="startTime" type="time" value={form.startTime} onChange={handleChange} required className="input-base" />
          </div>
          <div>
            <label className="label-base">End</label>
            <input name="endTime" type="time" value={form.endTime} onChange={handleChange} required className="input-base" />
          </div>
        </div>

        <div>
          <label className="label-base">Organizer</label>
          <input name="organizer" value={form.organizer} onChange={handleChange} required className="input-base" placeholder="Coding Club" />
        </div>

        <div>
          <label className="label-base">Max Participants</label>
          <input
            name="maxParticipants"
            type="number"
            value={form.maxParticipants}
            onChange={handleChange}
            required
            className="input-base"
            placeholder="300"
          />
        </div>

        <div>
          <label className="label-base">Registration Type</label>
          <select name="registrationType" value={form.registrationType} onChange={handleChange} className="input-base">
            {registrationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {form.registrationType === 'Team' && (
          <>
            <div>
              <label className="label-base">Minimum Team Size</label>
              <input name="minTeamSize" type="number" min="1" value={form.minTeamSize} onChange={handleChange} className="input-base" placeholder="2" />
            </div>
            <div>
              <label className="label-base">Maximum Team Size</label>
              <input name="maxTeamSize" type="number" min="1" value={form.maxTeamSize} onChange={handleChange} className="input-base" placeholder="5" />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="label-base">Poster URL <span className="font-normal text-slate-400">(optional)</span></label>
          <input
            name="poster"
            value={form.poster}
            onChange={handleChange}
            className="input-base"
            placeholder="https://example.com/poster.jpg"
          />
        </div>
      </div>

      <div>
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
