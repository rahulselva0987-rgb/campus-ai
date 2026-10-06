import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../api/client';

interface SkillData {
  skills: Array<{skill:{name:string};level:number;evidence:number}>;
  allSkills: string[];
  missingSkills: string[];
}

export default function SkillsPage() {
  const [data, setData] = useState<SkillData|null>(null);
  useEffect(() => { api.get('/skills').then(r => setData(r.data)); }, []);

  const levelLabels = ['Not demonstrated','Beginner','Developing','Intermediate','Advanced','Strong'];
  const levelColors = ['bg-gray-200','bg-blue-300','bg-blue-400','bg-blue-500','bg-purple-500','bg-gradient-to-r from-blue-500 to-purple-500'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Skill Profile</h2>
        <p className="text-gray-500 text-sm">Skills mapped from your activities and certificates</p>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{data.skills.length}</p>
              <p className="text-sm text-green-700">Skills Developed</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{data.missingSkills.length}</p>
              <p className="text-sm text-red-600">Skill Gaps</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{data.allSkills.length}</p>
              <p className="text-sm text-blue-700">Total Skills Tracked</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" /> Your Skills</h3>
            {data.skills.length === 0 ? (
              <p className="text-gray-400 text-sm">Add activities to start building your skill profile. Skills are automatically mapped when you add activities.</p>
            ) : (
              <div className="space-y-4">
                {data.skills.map(ss => (
                  <div key={ss.skill.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-gray-900">{ss.skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{ss.evidence} activities</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ss.level >= 4 ? 'bg-purple-100 text-purple-700' : ss.level >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {levelLabels[ss.level]}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${levelColors[ss.level]} transition-all`} style={{width:`${(ss.level/5)*100}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.missingSkills.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Skill Gaps</h3>
              <p className="text-sm text-gray-500 mb-4">These skills have not been demonstrated yet. Visit Recommendations for suggestions on how to develop them.</p>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map(s => (
                  <span key={s} className="bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1 text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}