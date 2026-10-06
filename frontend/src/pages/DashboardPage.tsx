import { useEffect, useState } from 'react';
import { Award, Activity, Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

interface ProfileData {
  profile: {
    fullName: string; department: string; year: number;
    activities: Array<{id:string;title:string;category:string;date:string}>;
    certificates: Array<{id:string;title:string;status:string;organization:string}>;
    studentSkills: Array<{skill:{name:string};level:number;evidence:number}>;
    _count?: {activities:number;certificates:number};
  } | null;
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Award; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Loading...</div></div>;

  const profile = data?.profile;
  const skills = profile?.studentSkills || [];
  const skillLevels = [0,1,2,3,4,5];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {profile?.fullName || user?.fullName || 'Student'}!</h2>
        <p className="text-blue-100 mt-1">{profile?.department} · Year {profile?.year}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Activities" value={profile?.activities?.length || 0} color="bg-blue-500" />
        <StatCard icon={Award} label="Certificates" value={profile?.certificates?.length || 0} color="bg-purple-500" />
        <StatCard icon={Brain} label="Skills Developed" value={skills.length} color="bg-green-500" />
        <StatCard icon={Lightbulb} label="Skills to Develop" value={Math.max(0, 7 - skills.length)} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Brain size={18} className="text-blue-500" /> Skill Profile</h3>
          {skills.length === 0 ? (
            <p className="text-gray-400 text-sm">Add activities to build your skill profile</p>
          ) : (
            <div className="space-y-3">
              {skills.map(ss => (
                <div key={ss.skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{ss.skill.name}</span>
                    <span className="text-gray-400">Level {ss.level}/5</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${(ss.level / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-purple-500" /> Recent Activities</h3>
          {(profile?.activities || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No activities yet. Add your first activity!</p>
          ) : (
            <div className="space-y-3">
              {(profile?.activities || []).slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(profile?.certificates || []).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Award size={18} className="text-amber-500" /> Recent Certificates</h3>
          <div className="space-y-2">
            {(profile?.certificates || []).slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.organization}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  c.status === 'verified' ? 'bg-green-100 text-green-700' :
                  c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  c.status === 'needs_review' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}