import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import registrationService from '../services/registrationService';
import criteriaService from '../services/criteriaService';
import evaluationService from '../services/evaluationService';
import ScoreInput from '../components/ScoreInput';
import CommentBox from '../components/CommentBox';

const EvaluateParticipant = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantId, setParticipantId] = useState('');
  const [scores, setScores] = useState([]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventResponse, criteriaResponse, participantsResponse] = await Promise.all([
          eventService.getEventById(eventId),
          criteriaService.getEventCriteria(eventId),
          registrationService.getEventParticipants(eventId),
        ]);

        setEvent(eventResponse.data.event);
        setCriteria(criteriaResponse.data.criteria || []);
        setParticipants(participantsResponse.data.registrations || []);
        setScores((criteriaResponse.data.criteria || []).map((item) => ({ criteria: item._id, marks: '' })));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  const updateScore = (index, value) => {
    setScores((current) => current.map((item, scoreIndex) => (scoreIndex === index ? { ...item, marks: value } : item)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await evaluationService.submitEvaluation({ eventId, participantId, scores, comments });
      navigate('/judge/my-evaluations');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-shell grid place-items-center">Loading participant evaluation...</div>;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="page-card bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Participant Evaluation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{event?.title}</h1>
        </section>

        <form onSubmit={handleSubmit} className="page-card space-y-6 p-6 sm:p-8">
          <div>
            <label className="label-base">Select Participant</label>
            <select className="input-base" value={participantId} onChange={(e) => setParticipantId(e.target.value)} required>
              <option value="">Choose a participant</option>
              {participants.map((registration) => (
                <option key={registration._id} value={registration.student?._id}>
                  {registration.student?.name} - {registration.student?.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {criteria.map((criterion, index) => (
              <ScoreInput
                key={criterion._id}
                label={criterion.title}
                maxMarks={criterion.maxMarks}
                value={scores[index]?.marks ?? ''}
                onChange={(e) => updateScore(index, e.target.value)}
              />
            ))}
          </div>

          <CommentBox value={comments} onChange={(e) => setComments(e.target.value)} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-3 disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
            <Link to="/judge/my-events" className="btn-secondary border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              Back to Assigned Events
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluateParticipant;
