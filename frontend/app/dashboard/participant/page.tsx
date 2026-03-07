'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  first_name: string; last_name: string; city: string; education_level: string;
  bio: string; desired_position: string; cv_file_path: string; skills: string[];
  email: string;
}
interface Job {
  id: string; title: string; company_name: string; location: string;
  employment_type: string; remote_option: boolean; flexible_hours: boolean;
}
interface Training {
  id: string; title: string; category: string; duration_hours: number; level: string; status: string;
}

export default function ParticipantDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'jobs' | 'applications' | 'trainings'>('profile');
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [allTrainings, setAllTrainings] = useState<Training[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'participant') { router.push('/login'); return; }
    fetchProfile(); fetchJobs(); fetchApplications(); fetchMyTrainings(); fetchAllTrainings();
  }, []);

  const fetchProfile = async () => {
    const r = await fetch(`${api}/participant/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setProfile(await r.json());
  };
  const fetchJobs = async () => {
    const r = await fetch(`${api}/jobs`);
    if (r.ok) setJobs(await r.json());
  };
  const fetchApplications = async () => {
    const r = await fetch(`${api}/participant/applications`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setApplications(await r.json());
  };
  const fetchMyTrainings = async () => {
    const r = await fetch(`${api}/participant/trainings`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setTrainings(await r.json());
  };
  const fetchAllTrainings = async () => {
    const r = await fetch(`${api}/trainings`);
    if (r.ok) setAllTrainings(await r.json());
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${api}/participant/profile`, { method: 'PUT', headers, body: JSON.stringify(profile) });
    setMsg(r.ok ? '✓ Profil kaydedildi' : '✗ Hata oluştu');
  };

  const uploadCV = async () => {
    if (!cvFile) return;
    const fd = new FormData(); fd.append('cv', cvFile);
    const r = await fetch(`${api}/participant/cv`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    setMsg(r.ok ? '✓ CV yüklendi' : '✗ CV yüklenemedi');
  };

  const applyJob = async (jobId: string) => {
    const r = await fetch(`${api}/jobs/${jobId}/apply`, { method: 'POST', headers, body: JSON.stringify({ cover_letter: '' }) });
    setMsg(r.ok ? '✓ Başvuru gönderildi' : '✗ Başvuru gönderilemedi');
    fetchApplications();
  };

  const enrollTraining = async (trainingId: string) => {
    const r = await fetch(`${api}/participant/trainings/${trainingId}/enroll`, { method: 'POST', headers });
    setMsg(r.ok ? '✓ Eğitime kaydolundu' : '✗ Kayıt başarısız');
    fetchMyTrainings();
  };

  const logout = () => { localStorage.clear(); router.push('/login'); };

  const tabs = [
    { key: 'profile', label: '👤 Profilim' },
    { key: 'jobs', label: '💼 İş İlanları' },
    { key: 'applications', label: '📋 Başvurularım' },
    { key: 'trainings', label: '📚 Eğitimler' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Kalıyor — Katılımcı Paneli</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{profile.email}</span>
          <button onClick={logout} className="text-sm bg-purple-800 px-3 py-1 rounded hover:bg-purple-900">Çıkış</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{msg}</div>}

        {/* Profil */}
        {tab === 'profile' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Kişisel Bilgilerim</h2>
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['first_name', 'Ad'], ['last_name', 'Soyad'], ['city', 'Şehir'], ['education_level', 'Eğitim Seviyesi'],
                ['desired_position', 'Hedef Pozisyon'], ['availability', 'Müsaitlik']].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input value={(profile as any)[field] || ''} onChange={e => setProfile({ ...profile, [field]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none" />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Hakkımda</label>
                <textarea rows={3} value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">Kaydet</button>
              </div>
            </form>
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">CV Yükle</h3>
              <div className="flex gap-3 items-center">
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-600" />
                <button onClick={uploadCV} className="bg-gray-700 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800">Yükle</button>
              </div>
              {profile.cv_file_path && <p className="text-xs text-green-600 mt-1">✓ CV mevcut: {profile.cv_file_path}</p>}
            </div>
          </div>
        )}

        {/* İş İlanları */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Açık İş İlanları</h2>
            {jobs.length === 0 && <p className="text-gray-500 text-sm">Henüz ilan yok.</p>}
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow p-5 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company_name} · {job.location}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {job.remote_option && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">🏠 Uzaktan</span>}
                    {job.flexible_hours && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">⏰ Esnek</span>}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{job.employment_type}</span>
                  </div>
                </div>
                <button onClick={() => applyJob(job.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 shrink-0">
                  Başvur
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Başvurularım */}
        {tab === 'applications' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Başvurularım</h2>
            {applications.length === 0 && <p className="text-gray-500 text-sm">Henüz başvurunuz yok.</p>}
            {applications.map((app: any) => (
              <div key={app.id} className="bg-white rounded-xl shadow p-4 flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{app.title}</p>
                  <p className="text-sm text-gray-500">{app.company_name}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full h-fit ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'}`}>
                  {app.status === 'pending' ? 'Beklemede' : app.status === 'reviewed' ? 'İncelendi' :
                   app.status === 'shortlisted' ? 'Kısa Liste' : app.status === 'accepted' ? 'Kabul' : 'Reddedildi'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Eğitimler */}
        {tab === 'trainings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Mevcut Eğitimler</h2>
            {allTrainings.map(tr => {
              const enrolled = trainings.find(t => t.id === tr.id);
              return (
                <div key={tr.id} className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{tr.title}</h3>
                    <p className="text-sm text-gray-500">{tr.category} · {tr.level} · {tr.duration_hours} saat</p>
                  </div>
                  {enrolled ? (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ Kayıtlı</span>
                  ) : (
                    <button onClick={() => enrollTraining(tr.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                      Katıl
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
