import { useEffect, useState } from 'react';
import api from '../api/client';

interface Student { id:string;fullName:string;department:string;year:number;user:{email:string;createdAt:string};_count:{activities:number;certificates:number}; }

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/students').then(r => { setStudents(r.data); setLoading(false); }); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <p className="text-gray-500 text-sm">{students.length} registered students</p>
      </div>
      {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-left">Year</th>
                <th className="px-6 py-3 text-left">Activities</th>
                <th className="px-6 py-3 text-left">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{s.fullName[0]}</div>
                      <div><p className="text-sm font-medium text-gray-900">{s.fullName}</p><p className="text-xs text-gray-400">{s.user.email}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Year {s.year}</td>
                  <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">{s._count.activities}</span></td>
                  <td className="px-6 py-4"><span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">{s._count.certificates}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}