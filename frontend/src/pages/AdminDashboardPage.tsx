import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Clock, CheckCircle, Activity } from 'lucide-react';
import api from '../api/client';

interface Stats { totalStudents:number;totalCerts:number;pendingCerts:number;verifiedCerts:number;totalActivities:number; }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats|null>(null);
  useEffect(() => { api.get('/admin/statistics').then(r => setStats(r.data)); }, []);

  const cards = stats ? [
    { label:'Total Students', value:stats.totalStudents, icon:Users, color:'bg-blue-500', link:'/admin/students' },
    { label:'Total Certificates', value:stats.totalCerts, icon:Award, color:'bg-purple-500', link:'/admin/certificates' },
    { label:'Pending Review', value:stats.pendingCerts, icon:Clock, color:'bg-amber-500', link:'/admin/certificates' },
    { label:'Verified Certs', value:stats.verifiedCerts, icon:CheckCircle, color:'bg-green-500', link:'/admin/certificates' },
    { label:'Total Activities', value:stats.totalActivities, icon:Activity, color:'bg-teal-500', link:'/admin/students' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-blue-100 mt-1">Platform overview and management</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>
      {stats && stats.pendingCerts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-600" />
            <p className="text-amber-700 font-medium">{stats.pendingCerts} certificate{stats.pendingCerts > 1 ? 's' : ''} awaiting review</p>
          </div>
          <Link to="/admin/certificates" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700">Review Now</Link>
        </div>
      )}
    </div>
  );
}