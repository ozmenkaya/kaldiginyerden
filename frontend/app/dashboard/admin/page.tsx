'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  total_users: string; total_participants: string; total_companies: string;
  active_jobs: string; total_applications: string; active_trainings: string;
}

interface FormField {
  id?: string;
  field_key: string;
  label: string;
  field_type: string;
  options?: string[] | null;
  is_required: boolean;
  is_matchable: boolean;
  match_weight: number;
  placeholder?: string;
  validation_rules?: Record<string, unknown> | null;
}

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  form_type: 'participant' | 'company';
  is_active: boolean;
  created_at: string;
  fields?: FormField[];
}

interface MatchResult {
  company_email: string;
  participant_email: string;
  total_score: number;
  field_scores: Record<string, { score: number; weight: number; cVal: unknown; pVal: unknown }>;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Metin' },
  { value: 'textarea', label: 'Uzun Metin' },
  { value: 'number', label: 'Sayı' },
  { value: 'select', label: 'Tekli Seçim' },
  { value: 'multiselect', label: 'Çoklu Seçim' },
  { value: 'checkbox', label: 'Onay Kutusu' },
  { value: 'radio', label: 'Radyo Butonu' },
  { value: 'date', label: 'Tarih' },
  { value: 'range', label: 'Aralık' },
];

const emptyField: FormField = {
  field_key: '', label: '', field_type: 'text', options: null,
  is_required: false, is_matchable: false, match_weight: 1.0, placeholder: '',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'stats' | 'users' | 'companies' | 'trainings' | 'forms' | 'matching'>('stats');
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [newTraining, setNewTraining] = useState({
    title: '', description: '', category: '', duration_hours: 0, level: 'başlangıç', format: 'online', url: '', thumbnail: ''
  });
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [msg, setMsg] = useState('');

  // Form wizard state
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'participant' | 'company'>('participant');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [optionInput, setOptionInput] = useState<Record<number, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [formResponses, setFormResponses] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Matching state
  const [companyTemplates, setCompanyTemplates] = useState<FormTemplate[]>([]);
  const [participantTemplates, setParticipantTemplates] = useState<FormTemplate[]>([]);
  const [selectedCompanyTemplate, setSelectedCompanyTemplate] = useState('');
  const [selectedParticipantTemplate, setSelectedParticipantTemplate] = useState('');
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [matchRunning, setMatchRunning] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers: Record<string,string> = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'admin') { router.push('/login'); return; }
    fetchStats(); fetchUsers(); fetchCompanies(); fetchTrainings(); fetchTemplates();
  }, []);

  const fetchStats = async () => {
    const r = await fetch(`${api}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setStats(await r.json());
  };
  const fetchUsers = async () => {
    const r = await fetch(`${api}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setUsers(await r.json());
  };
  const fetchCompanies = async () => {
    const r = await fetch(`${api}/admin/companies`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setCompanies(await r.json());
  };
  const fetchTrainings = async () => {
    const r = await fetch(`${api}/trainings`);
    if (r.ok) setTrainings(await r.json());
  };
  const fetchTemplates = async () => {
    const r = await fetch(`${api}/forms/templates`, { headers });
    if (r.ok) {
      const data = await r.json();
      setTemplates(data);
      setCompanyTemplates(data.filter((t: FormTemplate) => t.form_type === 'company'));
      setParticipantTemplates(data.filter((t: FormTemplate) => t.form_type === 'participant'));
    }
  };
  const fetchResponses = async (templateId: string) => {
    const r = await fetch(`${api}/forms/responses?template_id=${templateId}`, { headers });
    if (r.ok) setFormResponses(await r.json());
  };

  const toggleUserStatus = async (id: string, is_active: boolean) => {
    await fetch(`${api}/admin/users/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ is_active: !is_active }) });
    fetchUsers();
  };
  const verifyCompany = async (id: string) => {
    await fetch(`${api}/admin/companies/${id}/verify`, { method: 'PATCH', headers });
    setMsg('✓ Şirket onaylandı'); fetchCompanies();
  };
  const createTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${api}/admin/trainings`, { method: 'POST', headers, body: JSON.stringify(newTraining) });
    if (r.ok) { setMsg('✓ Eğitim oluşturuldu'); fetchTrainings(); setShowTrainingForm(false); }
    else setMsg('✗ Hata');
  };
  const toggleTraining = async (id: string, is_active: boolean, tr: any) => {
    await fetch(`${api}/admin/trainings/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...tr, is_active: !is_active }) });
    fetchTrainings();
  };

  // ============ Form Builder Functions ============
  const resetFormBuilder = () => {
    setFormTitle(''); setFormDescription(''); setFormType('participant');
    setFormFields([]); setEditingTemplate(null); setOptionInput({});
    setPreviewMode(false);
  };

  const openFormBuilder = (template?: FormTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormTitle(template.title);
      setFormDescription(template.description);
      setFormType(template.form_type);
      setFormFields(template.fields || []);
    } else {
      resetFormBuilder();
    }
    setShowFormBuilder(true);
  };

  const addField = () => {
    setFormFields([...formFields, { ...emptyField, field_key: `field_${Date.now()}` }]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormFields(newFields);
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formFields];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    setFormFields(newFields);
  };

  const addOption = (fieldIndex: number) => {
    const val = (optionInput[fieldIndex] || '').trim();
    if (!val) return;
    const f = formFields[fieldIndex];
    const opts = Array.isArray(f.options) ? [...f.options, val] : [val];
    updateField(fieldIndex, { options: opts });
    setOptionInput({ ...optionInput, [fieldIndex]: '' });
  };

  const removeOption = (fieldIndex: number, optIdx: number) => {
    const f = formFields[fieldIndex];
    const opts = Array.isArray(f.options) ? f.options.filter((_, i) => i !== optIdx) : [];
    updateField(fieldIndex, { options: opts });
  };

  const saveForm = async () => {
    if (!formTitle.trim()) { setMsg('Form başlığı zorunludur'); return; }
    if (formFields.length === 0) { setMsg('En az bir alan ekleyin'); return; }
    for (const f of formFields) {
      if (!f.field_key.trim() || !f.label.trim()) { setMsg('Tüm alan key ve etiketleri doldurulmalı'); return; }
    }

    const body = {
      title: formTitle, description: formDescription, form_type: formType,
      is_active: editingTemplate ? editingTemplate.is_active : true,
      fields: formFields,
    };

    const url = editingTemplate
      ? `${api}/forms/templates/${editingTemplate.id}`
      : `${api}/forms/templates`;
    const method = editingTemplate ? 'PUT' : 'POST';

    const r = await fetch(url, { method, headers, body: JSON.stringify(body) });
    if (r.ok) {
      setMsg(editingTemplate ? '✓ Form güncellendi' : '✓ Form oluşturuldu');
      setShowFormBuilder(false);
      resetFormBuilder();
      fetchTemplates();
    } else {
      setMsg('✗ Hata oluştu');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Bu formu silmek istediğinize emin misiniz?')) return;
    const r = await fetch(`${api}/forms/templates/${id}`, { method: 'DELETE', headers });
    if (r.ok) { setMsg('✓ Form silindi'); fetchTemplates(); }
  };

  const toggleTemplate = async (id: string) => {
    const r = await fetch(`${api}/forms/templates/${id}/toggle`, { method: 'PATCH', headers });
    if (r.ok) fetchTemplates();
  };

  const loadTemplateForEdit = async (id: string) => {
    const r = await fetch(`${api}/forms/templates/${id}`, { headers });
    if (r.ok) {
      const data = await r.json();
      openFormBuilder(data);
    }
  };

  // ============ Matching Functions ============
  const runMatching = async () => {
    if (!selectedCompanyTemplate || !selectedParticipantTemplate) {
      setMsg('Şirket ve katılımcı formu seçiniz'); return;
    }
    setMatchRunning(true);
    try {
      const r = await fetch(`${api}/forms/match`, {
        method: 'POST', headers,
        body: JSON.stringify({
          company_template_id: selectedCompanyTemplate,
          participant_template_id: selectedParticipantTemplate,
        })
      });
      if (r.ok) {
        const data = await r.json();
        setMatchResults(data.results);
        setMsg(`✓ Eşleştirme tamamlandı: ${data.total_matches} sonuç`);
      } else setMsg('✗ Eşleştirme hatası');
    } finally {
      setMatchRunning(false);
    }
  };

  const logout = () => { localStorage.clear(); router.push('/login'); };

  const statCards = [
    { label: 'Toplam Kullanıcı', value: stats.total_users, icon: '👥', color: 'bg-purple-500' },
    { label: 'Katılımcı', value: stats.total_participants, icon: '👩', color: 'bg-pink-500' },
    { label: 'Şirket', value: stats.total_companies, icon: '🏢', color: 'bg-indigo-500' },
    { label: 'Aktif İlan', value: stats.active_jobs, icon: '💼', color: 'bg-blue-500' },
    { label: 'Toplam Başvuru', value: stats.total_applications, icon: '📋', color: 'bg-teal-500' },
    { label: 'Aktif Eğitim', value: stats.active_trainings, icon: '📚', color: 'bg-green-500' },
  ];

  const tabs = [
    { key: 'stats', label: '📊 Dashboard' },
    { key: 'forms', label: '📝 Form Sihirbazı' },
    { key: 'matching', label: '🔗 Eşleştirme' },
    { key: 'users', label: '👥 Kullanıcılar' },
    { key: 'companies', label: '🏢 Şirketler' },
    { key: 'trainings', label: '📚 Eğitimler' },
  ] as const;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Kalıyor — Admin Paneli</h1>
        <button onClick={logout} className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Çıkış</button>
      </header>

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                tab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {msg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-green-500 hover:text-green-700 ml-2">✕</button>
          </div>
        )}

        {/* ============ Dashboard ============ */}
        {tab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map(c => (
              <div key={c.label} className={`${c.color} text-white rounded-xl p-5`}>
                <p className="text-3xl mb-1">{c.icon}</p>
                <p className="text-2xl font-bold">{c.value || '0'}</p>
                <p className="text-sm opacity-80">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ============ Form Sihirbazı ============ */}
        {tab === 'forms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Form Sihirbazı</h2>
              <button onClick={() => openFormBuilder()} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
                + Yeni Form Oluştur
              </button>
            </div>

            {/* Form Builder */}
            {showFormBuilder && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-indigo-700">
                    {editingTemplate ? 'Formu Düzenle' : 'Yeni Form Oluştur'}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewMode(!previewMode)}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${previewMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                      {previewMode ? 'Tasarım Modu' : 'Önizleme'}
                    </button>
                    <button onClick={() => { setShowFormBuilder(false); resetFormBuilder(); }}
                      className="text-gray-500 hover:text-gray-700 text-sm">Kapat</button>
                  </div>
                </div>

                {/* Preview Mode */}
                {previewMode ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                      <h4 className="text-xl font-bold text-gray-800">{formTitle || 'Form Başlığı'}</h4>
                      {formDescription && <p className="text-gray-600 mt-1">{formDescription}</p>}
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                        formType === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {formType === 'company' ? 'Şirket Formu' : 'Katılımcı Formu'}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {formFields.map((f, i) => (
                        <div key={i} className="bg-white border rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {f.label} {f.is_required && <span className="text-red-500">*</span>}
                            {f.is_matchable && <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 px-1 rounded">Eşleşme</span>}
                          </label>
                          {f.field_type === 'text' && (
                            <input type="text" placeholder={f.placeholder || ''} disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
                          )}
                          {f.field_type === 'textarea' && (
                            <textarea rows={3} placeholder={f.placeholder || ''} disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
                          )}
                          {f.field_type === 'number' && (
                            <input type="number" placeholder={f.placeholder || ''} disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
                          )}
                          {f.field_type === 'date' && (
                            <input type="date" disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" />
                          )}
                          {f.field_type === 'range' && (
                            <input type="range" disabled className="w-full" />
                          )}
                          {f.field_type === 'checkbox' && (
                            <div className="flex items-center gap-2">
                              <input type="checkbox" disabled className="rounded" />
                              <span className="text-sm text-gray-500">Evet</span>
                            </div>
                          )}
                          {(f.field_type === 'select') && (
                            <select disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50">
                              <option>Seçiniz...</option>
                              {Array.isArray(f.options) && f.options.map((o, oi) => <option key={oi}>{o}</option>)}
                            </select>
                          )}
                          {f.field_type === 'multiselect' && (
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(f.options) && f.options.map((o, oi) => (
                                <label key={oi} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-sm">
                                  <input type="checkbox" disabled /> {o}
                                </label>
                              ))}
                            </div>
                          )}
                          {f.field_type === 'radio' && (
                            <div className="space-y-1">
                              {Array.isArray(f.options) && f.options.map((o, oi) => (
                                <label key={oi} className="flex items-center gap-2 text-sm">
                                  <input type="radio" name={`preview_${i}`} disabled /> {o}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Design Mode */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form Başlığı</label>
                        <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                          placeholder="Örneğin: Katılımcı CV Formu" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form Tipi</label>
                        <select value={formType} onChange={e => setFormType(e.target.value as any)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none">
                          <option value="participant">Katılımcı Formu</option>
                          <option value="company">Şirket Formu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                        <input value={formDescription} onChange={e => setFormDescription(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                          placeholder="Form hakkında kısa açıklama" />
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-gray-700">Form Alanları ({formFields.length})</h4>
                        <button onClick={addField} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 font-medium">
                          + Alan Ekle
                        </button>
                      </div>

                      {formFields.map((field, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-gray-400">ALAN #{idx + 1}</span>
                            <div className="flex gap-1">
                              <button onClick={() => moveField(idx, 'up')} disabled={idx === 0}
                                className="text-xs px-1.5 py-0.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30">↑</button>
                              <button onClick={() => moveField(idx, 'down')} disabled={idx === formFields.length - 1}
                                className="text-xs px-1.5 py-0.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30">↓</button>
                              <button onClick={() => removeField(idx)}
                                className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200">✕</button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-0.5">Alan Key</label>
                              <input value={field.field_key} onChange={e => updateField(idx, { field_key: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                                placeholder="alan_adi" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-0.5">Etiket</label>
                              <input value={field.label} onChange={e => updateField(idx, { label: e.target.value })}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                                placeholder="Görüntülenen isim" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-0.5">Alan Tipi</label>
                              <select value={field.field_type} onChange={e => updateField(idx, { field_type: e.target.value })}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none">
                                {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-0.5">Placeholder</label>
                              <input value={field.placeholder || ''} onChange={e => updateField(idx, { placeholder: e.target.value })}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                                placeholder="İpucu metni" />
                            </div>
                          </div>

                          {/* Options for select/multiselect/radio */}
                          {['select', 'multiselect', 'radio'].includes(field.field_type) && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Seçenekler</label>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {Array.isArray(field.options) && field.options.map((opt, oi) => (
                                  <span key={oi} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                    {opt}
                                    <button onClick={() => removeOption(idx, oi)} className="text-indigo-400 hover:text-red-500">✕</button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input value={optionInput[idx] || ''} onChange={e => setOptionInput({ ...optionInput, [idx]: e.target.value })}
                                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption(idx))}
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none" placeholder="Seçenek ekle..." />
                                <button onClick={() => addOption(idx)} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">Ekle</button>
                              </div>
                            </div>
                          )}

                          {/* Checkboxes */}
                          <div className="mt-3 flex flex-wrap gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-gray-600">
                              <input type="checkbox" checked={field.is_required} onChange={e => updateField(idx, { is_required: e.target.checked })}
                                className="rounded" />
                              Zorunlu
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-gray-600">
                              <input type="checkbox" checked={field.is_matchable} onChange={e => updateField(idx, { is_matchable: e.target.checked })}
                                className="rounded" />
                              Eşleştirme Alanı
                            </label>
                            {field.is_matchable && (
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs text-gray-600">Ağırlık:</label>
                                <input type="number" min="0.1" max="5" step="0.1" value={field.match_weight}
                                  onChange={e => updateField(idx, { match_weight: parseFloat(e.target.value) || 1 })}
                                  className="w-16 border rounded px-1 py-0.5 text-xs" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Save buttons */}
                    <div className="flex gap-3 justify-end border-t pt-4">
                      <button onClick={() => { setShowFormBuilder(false); resetFormBuilder(); }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">İptal</button>
                      <button onClick={saveForm}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500">
                        {editingTemplate ? 'Güncelle' : 'Kaydet'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Templates List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Participant Forms */}
              <div>
                <h3 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Katılımcı Formları</h3>
                <div className="space-y-2">
                  {templates.filter(t => t.form_type === 'participant').map(t => (
                    <div key={t.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{t.title}</p>
                          {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(t.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {t.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 border-t pt-2">
                        <button onClick={() => loadTemplateForEdit(t.id)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">Düzenle</button>
                        <button onClick={() => router.push(`/dashboard/admin/form-designer/${t.id}`)} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded hover:bg-amber-100">Tasarla</button>
                        <button onClick={() => toggleTemplate(t.id)} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
                          {t.is_active ? 'Durdur' : 'Aktifleştir'}
                        </button>
                        <button onClick={() => { setSelectedTemplateId(t.id); fetchResponses(t.id); }} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Yanıtlar</button>
                        <button onClick={() => deleteTemplate(t.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Sil</button>
                      </div>
                    </div>
                  ))}
                  {templates.filter(t => t.form_type === 'participant').length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Henüz katılımcı formu yok</p>
                  )}
                </div>
              </div>

              {/* Company Forms */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Şirket Formları</h3>
                <div className="space-y-2">
                  {templates.filter(t => t.form_type === 'company').map(t => (
                    <div key={t.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{t.title}</p>
                          {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(t.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {t.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 border-t pt-2">
                        <button onClick={() => loadTemplateForEdit(t.id)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">Düzenle</button>
                        <button onClick={() => router.push(`/dashboard/admin/form-designer/${t.id}`)} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded hover:bg-amber-100">Tasarla</button>
                        <button onClick={() => toggleTemplate(t.id)} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
                          {t.is_active ? 'Durdur' : 'Aktifleştir'}
                        </button>
                        <button onClick={() => { setSelectedTemplateId(t.id); fetchResponses(t.id); }} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Yanıtlar</button>
                        <button onClick={() => deleteTemplate(t.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Sil</button>
                      </div>
                    </div>
                  ))}
                  {templates.filter(t => t.form_type === 'company').length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Henüz şirket formu yok</p>
                  )}
                </div>
              </div>
            </div>

            {/* Responses viewer */}
            {selectedTemplateId && formResponses.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Form Yanıtları ({formResponses.length})</h3>
                  <button onClick={() => { setSelectedTemplateId(''); setFormResponses([]); }}
                    className="text-xs text-gray-500 hover:text-gray-700">✕ Kapat</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-600 font-medium">E-posta</th>
                        <th className="text-left px-3 py-2 text-gray-600 font-medium">Tarih</th>
                        <th className="text-left px-3 py-2 text-gray-600 font-medium">Veriler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formResponses.map((resp: any) => (
                        <tr key={resp.id} className="border-t">
                          <td className="px-3 py-2">{resp.email}</td>
                          <td className="px-3 py-2 text-gray-500">{new Date(resp.submitted_at).toLocaleDateString('tr-TR')}</td>
                          <td className="px-3 py-2">
                            <pre className="text-xs bg-gray-50 p-2 rounded max-w-md overflow-auto">{JSON.stringify(resp.response_data, null, 2)}</pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ Eşleştirme ============ */}
        {tab === 'matching' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Eşleştirme Motoru</h2>
              <p className="text-sm text-gray-500 mb-6">
                Şirket iş ihtiyaçları formu ile katılımcı CV formlarını eşleştirmek için
                her iki form türünü seçip algoritmayı çalıştırın.
                Ortak alan key&apos;lerine sahip ve &quot;Eşleştirme Alanı&quot; olarak işaretlenmiş alanlar karşılaştırılır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Şirket Formu</label>
                  <select value={selectedCompanyTemplate} onChange={e => setSelectedCompanyTemplate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none">
                    <option value="">Şirket formu seçiniz...</option>
                    {companyTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-purple-700 mb-2">Katılımcı Formu</label>
                  <select value={selectedParticipantTemplate} onChange={e => setSelectedParticipantTemplate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none">
                    <option value="">Katılımcı formu seçiniz...</option>
                    {participantTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={runMatching} disabled={matchRunning || !selectedCompanyTemplate || !selectedParticipantTemplate}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {matchRunning ? 'Eşleştiriliyor...' : 'Eşleştirmeyi Çalıştır'}
                </button>
              </div>
            </div>

            {/* Match Results */}
            {matchResults.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Eşleştirme Sonuçları ({matchResults.length})</h3>
                <div className="space-y-3">
                  {matchResults.map((mr, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{mr.company_email}</span>
                            <span className="text-gray-400">↔</span>
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{mr.participant_email}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${getScoreColor(mr.total_score)}`}>
                          %{mr.total_score.toFixed(1)}
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(mr.total_score, 100)}%` }} />
                      </div>

                      {/* Field details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Object.entries(mr.field_scores).map(([key, fs]) => (
                          <div key={key} className="bg-gray-50 rounded p-2 text-xs">
                            <div className="font-medium text-gray-700 mb-0.5">{key}</div>
                            <div className={`font-bold ${fs.score >= 70 ? 'text-green-600' : fs.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                              %{fs.score}
                            </div>
                            <div className="text-gray-400 mt-0.5 truncate" title={`Ş: ${fs.cVal} ⇔ K: ${fs.pVal}`}>
                              {String(fs.cVal).substring(0, 15)} / {String(fs.pVal).substring(0, 15)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ Kullanıcılar ============ */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['E-posta', 'Rol', 'Durum', 'Kayıt Tarihi', 'İşlem'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleUserStatus(u.id, u.is_active)}
                        className={`text-xs px-2 py-1 rounded ${u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                        {u.is_active ? 'Devre Dışı' : 'Aktifleştir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============ Şirketler ============ */}
        {tab === 'companies' && (
          <div className="space-y-3">
            {companies.map(c => (
              <div key={c.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{c.company_name}</p>
                  <p className="text-sm text-gray-500">{c.email} · {c.sector} · {c.city}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {c.is_verified
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Onaylı</span>
                    : <button onClick={() => verifyCompany(c.id)} className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded font-medium">Onayla</button>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============ Eğitimler ============ */}
        {tab === 'trainings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Eğitimler</h2>
              <button onClick={() => setShowTrainingForm(!showTrainingForm)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
                {showTrainingForm ? 'İptal' : '+ Eğitim Ekle'}
              </button>
            </div>
            {showTrainingForm && (
              <div className="bg-white rounded-xl shadow p-6">
                <form onSubmit={createTraining} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[['title', 'Başlık'], ['category', 'Kategori'], ['url', 'URL'], ['thumbnail', 'Thumbnail URL']].map(([f, l]) => (
                    <div key={f}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                      <input value={(newTraining as any)[f]} onChange={e => setNewTraining({ ...newTraining, [f]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Süre (saat)</label>
                    <input type="number" value={newTraining.duration_hours}
                      onChange={e => setNewTraining({ ...newTraining, duration_hours: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seviye</label>
                    <select value={newTraining.level} onChange={e => setNewTraining({ ...newTraining, level: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none">
                      <option>başlangıç</option><option>orta</option><option>ileri</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea rows={2} value={newTraining.description} onChange={e => setNewTraining({ ...newTraining, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">Oluştur</button>
                  </div>
                </form>
              </div>
            )}
            <div className="space-y-3">
              {trainings.map(tr => (
                <div key={tr.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{tr.title}</p>
                    <p className="text-sm text-gray-500">{tr.category} · {tr.level} · {tr.duration_hours} saat</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${tr.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {tr.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                    <button onClick={() => toggleTraining(tr.id, tr.is_active, tr)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                      {tr.is_active ? 'Durdur' : 'Aktifleştir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
