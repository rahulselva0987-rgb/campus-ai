import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/client';

interface Activity { id:string;title:string;category:string;organization:string;description:string;date:string;achievement:string; }

const CATEGORIES = ['Hackathon','Workshop','Certification','Competition','Internship','Club Activity','Leadership','Community Service'];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'',category:'Hackathon',organization:'',description:'',achievement:'' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/activities').then(r => { setActivities(r.data); setLoading(false); }); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const res = await api.post('/activities', form);
      setActivities([res.data, ...activities]);
      setShowForm(false);
      setForm({ title:'',category:'Hackathon',organization:'',description:'',achievement:'' });
    } catch (err: unknown) {
      const e = err as {response?:{data?:{error?:string}}};
      setError(e.response?.data?.error || 'Failed to add activity');
    } finally { setSubmitting(false); }
  };

  const categoryColors: Record<string,string> = {
    'Hackathon':'bg-blue-100 text-blue-700','Workshop':'bg-purple-100 text-purple-700',
    'Certification':'bg-green-100 text-green-700','Competition':'bg-amber-100 text-amber-700',
    'Internship':'bg-teal-100 text-teal-700','Club Activity':'bg-pink-100 text-pink-700',
    'Leadership':'bg-orange-100 text-orange-700','Community Service':'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
          <p className="text-gray-500 text-sm">Track your extracurricular activities</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Activity
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Activity</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input value={form.organization} onChange={e => setForm({...form,organization:e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievement</label>
                <input value={form.achievement} onChange={e => setForm({...form,achievement:e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Runner-up, Completed, 1st Place" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-300 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900">No activities yet</h3>
          <p className="text-gray-500 text-sm mt-1">Add your first activity to start building your profile</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activities.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[a.category] || 'bg-gray-100 text-gray-600'}`}>{a.category}</span>
                </div>
                {a.organization && <p className="text-sm text-gray-500">{a.organization}</p>}
                {a.achievement && <p className="text-sm text-green-600 font-medium mt-1">🏆 {a.achievement}</p>}
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0">{new Date(a.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}