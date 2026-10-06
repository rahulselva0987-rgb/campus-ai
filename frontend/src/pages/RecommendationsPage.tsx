import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import api from '../api/client';

interface Rec { id:string;title:string;description:string;reason:string;type:string; }

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/recommendations').then(r => { setRecs(r.data); setLoading(false); }); }, []);

  const typeColors: Record<string,string> = {
    'Hackathon':'bg-blue-100 text-blue-700','Workshop':'bg-purple-100 text-purple-700',
    'Certification':'bg-green-100 text-green-700','Competition':'bg-amber-100 text-amber-700',
    'Club Activity':'bg-pink-100 text-pink-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
        <p className="text-gray-500 text-sm">Personalized suggestions to close your skill gaps</p>
      </div>
      {loading ? <div className="text-center text-gray-400 py-12">Loading recommendations...</div> :
       recs.length === 0 ? <div className="text-center py-16"><div className="text-gray-300 text-6xl mb-4">💡</div><p className="text-gray-500">Add activities first to get personalized recommendations</p></div> : (
        <div className="grid gap-4">
          {recs.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{r.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[r.type]||'bg-gray-100 text-gray-600'}`}>{r.type}</span>
                  </div>
                  <p className="text-sm text-gray-500">{r.description}</p>
                  <p className="text-sm text-blue-600 mt-2 bg-blue-50 rounded-lg px-3 py-2">💡 {r.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}