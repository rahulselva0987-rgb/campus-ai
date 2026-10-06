import { useEffect, useState } from 'react';
import { Award, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import api from '../api/client';

interface Cert { id:string;title:string;organization:string;issueDate:string;category:string;status:string;student:{fullName:string;department:string};extractedData:string; }

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cert|null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { api.get('/admin/certificates').then(r => { setCerts(r.data); setLoading(false); }); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/certificates/${id}/status`, { status, reviewNote });
      setCerts(certs.map(c => c.id === id ? {...c, status} : c));
      setSelected(null); setReviewNote('');
    } finally { setUpdating(false); }
  };

  const statusIcon = (s: string) => {
    if (s === 'verified') return <CheckCircle size={16} className="text-green-600" />;
    if (s === 'rejected') return <XCircle size={16} className="text-red-600" />;
    return <AlertCircle size={16} className="text-amber-600" />;
  };

  const statusBadge = (s: string) => {
    const map: Record<string,string> = { verified:'bg-green-100 text-green-700', pending:'bg-amber-100 text-amber-700', needs_review:'bg-orange-100 text-orange-700', rejected:'bg-red-100 text-red-700' };
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[s]||'bg-gray-100 text-gray-600'}`}>{s.replace('_',' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Certificate Verification</h2>
        <p className="text-gray-500 text-sm">Review and verify student certificates</p>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Verify Certificate</h3>
              <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
              <p className="font-medium text-gray-900">{selected.title}</p>
              <p className="text-sm text-gray-500">Student: {selected.student.fullName}</p>
              <p className="text-sm text-gray-500">Organization: {selected.organization}</p>
              <p className="text-xs text-amber-600 font-medium mt-2">⚠ Admin review required to verify. AI extraction does not prove authenticity.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Note (optional)</label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => updateStatus(selected.id, 'needs_review')} disabled={updating}
                className="flex-1 border border-amber-300 text-amber-600 rounded-lg py-2 text-sm hover:bg-amber-50 disabled:opacity-50">Needs Review</button>
              <button onClick={() => updateStatus(selected.id, 'rejected')} disabled={updating}
                className="flex-1 border border-red-300 text-red-600 rounded-lg py-2 text-sm hover:bg-red-50 disabled:opacity-50">Reject</button>
              <button onClick={() => updateStatus(selected.id, 'verified')} disabled={updating}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">Verify</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Certificate</th>
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certs.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">{statusIcon(c.status)}<div>
                      <p className="text-sm font-medium text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.organization}</p>
                    </div></div>
                  </td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-900">{c.student.fullName}</p><p className="text-xs text-gray-400">{c.student.department}</p></td>
                  <td className="px-6 py-4">{statusBadge(c.status)}</td>
                  <td className="px-6 py-4">
                    {c.status === 'pending' && (
                      <button onClick={() => setSelected(c)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}