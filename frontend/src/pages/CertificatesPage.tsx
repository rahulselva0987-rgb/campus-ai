import { useEffect, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import api from '../api/client';

interface Cert { id:string;title:string;organization:string;issueDate:string;category:string;achievement:string;status:string;extractedData:string; }

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({title:'',organization:'',issueDate:'',category:'Certification',achievement:''});
  const [file, setFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/certificates').then(r => { setCerts(r.data); setLoading(false); }); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (file) fd.append('file', file);
      const res = await api.post('/certificates', fd, {headers:{'Content-Type':'multipart/form-data'}});
      setCerts([res.data,...certs]);
      setShowForm(false);
      setForm({title:'',organization:'',issueDate:'',category:'Certification',achievement:''});
      setFile(null);
    } catch (err: unknown) {
      const e = err as {response?:{data?:{error?:string}}};
      setError(e.response?.data?.error || 'Failed to upload certificate');
    } finally { setSubmitting(false); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string,string> = {
      'verified':'bg-green-100 text-green-700','pending':'bg-amber-100 text-amber-700',
      'needs_review':'bg-orange-100 text-orange-700','rejected':'bg-red-100 text-red-700'
    };
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[s]||'bg-gray-100 text-gray-600'}`}>{s.replace('_',' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
          <p className="text-gray-500 text-sm">Upload and manage your certificates</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          <Upload size={16} /> Upload Certificate
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700"><strong>Note:</strong> Certificate information is AI-assisted and for reference only. Certificates require admin review to be verified. AI extraction does not prove authenticity.</p>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Certificate</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Title *</label>
                <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Python Programming Certification" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input value={form.organization} onChange={e => setForm({...form,organization:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={e => setForm({...form,issueDate:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievement</label>
                <input value={form.achievement} onChange={e => setForm({...form,achievement:e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Passed with Distinction" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF/Image)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0]||null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-sm file:font-medium" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-300 text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
          <p className="text-gray-500 text-sm mt-1">Upload your first certificate to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {certs.map(c => {
            const extracted = (() => { try { return JSON.parse(c.extractedData); } catch { return {}; } })();
            return (
              <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      {c.organization && <span>{c.organization}</span>}
                      {c.issueDate && <span>{c.issueDate}</span>}
                    </div>
                    {c.achievement && <p className="text-sm text-green-600 font-medium mt-1">🏆 {c.achievement}</p>}
                    {extracted.extractedSkills && (
                      <p className="text-xs text-gray-400 mt-2">
                        <span className="font-medium">AI-mapped skills:</span> {extracted.extractedSkills}
                        <span className="ml-2 text-amber-600">(AI-assisted, not verified)</span>
                      </p>
                    )}
                  </div>
                  {statusBadge(c.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}