'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  company_name: string; sector: string; company_size: string; city: string;
  website: string; description: string; contact_person: string; contact_phone: string;
  email: string; is_verified: boolean;
}
interface Job {
  id: string; title: string; location: string; employment_type: string;
  is_active: boolean; application_count: number; created_at: string;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'jobs' | 'newjob' | 'applicants'>('profile');
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({
    title: '', description: '', requirements: '', location: '', employment_type: 'tam zamanlı',
    salary_range: '', flexible_hours: false, remote_option: false, deadline: ''
  });
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'company') { router.push('/login'); return; }
    fetchProfile(); fetchJobs();
  }, []);

  const fetchProfile = async () => {
    const r = await fetch(`${api}/company/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setProfile(await r.json());
  };
  const fetchJobs = async () => {
    const r = await fetch(`${api}/company/jobs`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setJobs(await r.json());
  };
  const fetchApplicants = async (jobId: string) => {
    setSelectedJob(jobId);
    const r = await fetch(`${api}/company/jobs/${jobId}/applications`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) { setApplicants(await r.json()); setTab('applicants'); }
  };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${api}/company/profile`, { method: 'PUT', headers, body: JSON.stringify(profile) });
    setMsg(r.ok ? '✓ Profil kaydedildi' : '✗ Hata oluştu');
  };
  const postJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${api}/company/jobs`, { method: 'POST', headers, body: JSON.stringify(newJob) });
    if (r.ok) { setMsg('✓ İlan yayınlandı'); fetchJobs(); setTab('jobs'); }
    else setMsg('✗ İlan yayınlanamadı');
  };
  const updateStatus = async (appId: string, status: string) => {
    await fetch(`${api}/company/applications/${appId}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
    if (selectedJob) fetchApplicants(selectedJob);
  };

  const logout = () => { localStorage.clear(); router.push('/login'); };

  const tabs = [
    { key: 'profile', label: '🏢 Şirket Profili' },
    { key: 'jobs', label: '💼 İlanlarım' },
    { key: 'newjob', label: '➕ Yeni İlan' },
  ] as const;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', reviewed: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-purple-100 text-purple-700', rejected: 'bg-red-100 text-red-700',
    accepted: 'bg-green-100 text-green-700',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Beklemede', reviewed: 'İncelendi', shortlisted: 'Kısa Liste',
    rejected: 'Reddedildi', accepted: 'Kabul Edildi',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Kalıyor — Şirket Paneli</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{profile.company_name}</span>
          {profile.is_verified && <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">✓ Onaylı</span>}
          <button onClick={logout} className="text-sm bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-900">Çıkış</button>
        </div>
      </header>

      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
          {tab === 'applicants' && (
            <button className="px-5 py-4 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600">👥 Başvuranlar</button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{msg}</div>}

        {/* Şirket Profili */}
        {tab === 'profile' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Şirket Bilgileri</h2>
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['company_name', 'Şirket Adı'], ['sector', 'Sektör'], ['company_size', 'Şirket Büyüklüğü'],
                ['city', 'Şehir'], ['website', 'Web Sitesi'], ['contact_person', 'İletişim Kişisi'],
                ['contact_phone', 'Telefon']].map(([f, l]) => (
                <div key={f}>
                  <label className="block text-sm text-gray-600 mb-1">{l}</label>
                  <input value={(profile as any)[f] || ''} onChange={e => setProfile({ ...profile, [f]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Şirket Hakkında</label>
                <textarea rows={3} value={profile.description || ''} onChange={e => setProfile({ ...profile, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Kaydet</button>
              </div>
            </form>
          </div>
        )}

        {/* İlanlarım */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">İlanlarım</h2>
            {jobs.length === 0 && <p className="text-gray-500 text-sm">Henüz ilan yok. "Yeni İlan" ekleyin.</p>}
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.location} · {job.employment_type}</p>
                  <p className="text-xs text-gray-400 mt-1">{job.application_count} başvuru</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {job.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                  <button onClick={() => fetchApplicants(job.id)}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700">
                    Başvuranlar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Yeni İlan */}
        {tab === 'newjob' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Yeni İş İlanı</h2>
            <form onSubmit={postJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['title', 'İlan Başlığı'], ['location', 'Konum'], ['salary_range', 'Maaş Aralığı'], ['deadline', 'Son Başvuru Tarihi']].map(([f, l]) => (
                  <div key={f}>
                    <label className="block text-sm text-gray-600 mb-1">{l}</label>
                    <input type={f === 'deadline' ? 'date' : 'text'} value={(newJob as any)[f]}
                      onChange={e => setNewJob({ ...newJob, [f]: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Çalışma Şekli</label>
                  <select value={newJob.employment_type} onChange={e => setNewJob({ ...newJob, employment_type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none">
                    <option>tam zamanlı</option><option>yarı zamanlı</option><option>freelance</option><option>uzaktan</option>
                  </select>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newJob.flexible_hours} onChange={e => setNewJob({ ...newJob, flexible_hours: e.target.checked })} className="w-4 h-4" />
                    Esnek Çalışma
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newJob.remote_option} onChange={e => setNewJob({ ...newJob, remote_option: e.target.checked })} className="w-4 h-4" />
                    Uzaktan Çalışma
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">İş Tanımı</label>
                <textarea rows={4} value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Gereksinimler</label>
                <textarea rows={3} value={newJob.requirements} onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">İlanı Yayınla</button>
              </div>
            </form>
          </div>
        )}

        {/* Başvuranlar */}
        {tab === 'applicants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Başvuranlar</h2>
              <button onClick={() => setTab('jobs')} className="text-sm text-indigo-600 hover:underline">← İlanlara Dön</button>
            </div>
            {applicants.length === 0 && <p className="text-gray-500 text-sm">Henüz başvuru yok.</p>}
            {applicants.map(app => (
              <div key={app.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{app.first_name} {app.last_name}</p>
                    <p className="text-sm text-gray-500">{app.email} · {app.city}</p>
                    <p className="text-sm text-gray-600 mt-1">{app.desired_position}</p>
                    {app.cv_file_path && (
                      <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/cv/${app.cv_file_path}`}
                        target="_blank" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">📄 CV İndir</a>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full h-fit ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['reviewed', 'shortlisted', 'accepted', 'rejected'].map(s => (
                    <button key={s} onClick={() => updateStatus(app.id, s)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
                      → {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
