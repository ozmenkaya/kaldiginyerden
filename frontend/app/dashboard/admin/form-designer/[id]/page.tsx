'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface FormField {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  options?: string[] | null;
  is_required: boolean;
  is_matchable: boolean;
  placeholder?: string;
}

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  form_type: 'participant' | 'company';
  fields: FormField[];
}

interface FieldLayout {
  field_key: string;
  col_span: 1 | 2 | 3;    // 1 = tek sütun, 2 = iki sütun, 3 = tam satır
  section?: string;        // bölüm başlığı
  hidden: boolean;
  custom_label?: string;
  help_text?: string;
}

interface FormDesign {
  columns: 1 | 2 | 3;
  title_align: 'left' | 'center';
  show_description: boolean;
  accent_color: string;
  bg_color: string;
  border_style: 'rounded' | 'sharp' | 'none';
  field_size: 'sm' | 'md' | 'lg';
  section_style: 'line' | 'card' | 'tab';
  submit_label: string;
  submit_color: string;
  font_size: 'text-sm' | 'text-base' | 'text-lg';
  spacing: 'compact' | 'normal' | 'relaxed';
  field_layouts: FieldLayout[];
}

const DEFAULT_DESIGN: FormDesign = {
  columns: 1,
  title_align: 'left',
  show_description: true,
  accent_color: '#4f46e5',
  bg_color: '#ffffff',
  border_style: 'rounded',
  field_size: 'md',
  section_style: 'line',
  submit_label: 'Gönder',
  submit_color: '#4f46e5',
  font_size: 'text-base',
  spacing: 'normal',
  field_layouts: [],
};

const ACCENT_PRESETS = [
  { name: 'İndigo', value: '#4f46e5' },
  { name: 'Mavi', value: '#2563eb' },
  { name: 'Yeşil', value: '#16a34a' },
  { name: 'Kırmızı', value: '#dc2626' },
  { name: 'Turuncu', value: '#ea580c' },
  { name: 'Mor', value: '#9333ea' },
  { name: 'Pembe', value: '#db2777' },
  { name: 'Koyu', value: '#1f2937' },
];

export default function FormDesigner() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [design, setDesign] = useState<FormDesign>({ ...DEFAULT_DESIGN });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [activePanel, setActivePanel] = useState<'layout' | 'style' | 'fields'>('layout');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'admin') { router.push('/login'); return; }
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${api}/forms/templates/${templateId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) { setMsg('Form bulunamadı'); setLoading(false); return; }
      const data: FormTemplate = await r.json();
      setTemplate(data);

      // Kayıtlı tasarım var mı kontrol et (localStorage)
      const savedKey = `form_design_${templateId}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDesign(parsed);
        } catch {
          initFieldLayouts(data.fields);
        }
      } else {
        initFieldLayouts(data.fields);
      }
    } catch {
      setMsg('Bağlantı hatası');
    }
    setLoading(false);
  };

  const initFieldLayouts = (fields: FormField[]) => {
    const layouts: FieldLayout[] = fields.map(f => ({
      field_key: f.field_key,
      col_span: (f.field_type === 'textarea') ? 2 : 1,
      hidden: false,
      help_text: '',
    }));
    setDesign(prev => ({ ...prev, field_layouts: layouts }));
  };

  const updateDesign = (updates: Partial<FormDesign>) => {
    setDesign(prev => ({ ...prev, ...updates }));
  };

  const updateFieldLayout = (index: number, updates: Partial<FieldLayout>) => {
    const newLayouts = [...design.field_layouts];
    newLayouts[index] = { ...newLayouts[index], ...updates };
    setDesign(prev => ({ ...prev, field_layouts: newLayouts }));
  };

  const saveDesign = () => {
    setSaving(true);
    try {
      const savedKey = `form_design_${templateId}`;
      localStorage.setItem(savedKey, JSON.stringify(design));
      setMsg('✓ Tasarım kaydedildi');
    } catch {
      setMsg('✗ Kaydetme hatası');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  // Drag & drop
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newLayouts = [...design.field_layouts];
      const [removed] = newLayouts.splice(dragIndex, 1);
      newLayouts.splice(dragOverIndex, 0, removed);

      // Aynı sırada fields dizisini de güncelle
      if (template) {
        const newFields = [...template.fields];
        const [removedField] = newFields.splice(dragIndex, 1);
        newFields.splice(dragOverIndex, 0, removedField);
        setTemplate({ ...template, fields: newFields });
      }

      setDesign(prev => ({ ...prev, field_layouts: newLayouts }));
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getFieldByKey = (key: string): FormField | undefined => {
    return template?.fields.find(f => f.field_key === key);
  };

  const addSection = (afterIndex: number) => {
    const newLayouts = [...design.field_layouts];
    if (newLayouts[afterIndex]) {
      newLayouts[afterIndex] = { ...newLayouts[afterIndex], section: 'Yeni Bölüm' };
    }
    setDesign(prev => ({ ...prev, field_layouts: newLayouts }));
  };

  const removeSection = (index: number) => {
    const newLayouts = [...design.field_layouts];
    if (newLayouts[index]) {
      const { section, ...rest } = newLayouts[index];
      newLayouts[index] = rest as FieldLayout;
    }
    setDesign(prev => ({ ...prev, field_layouts: newLayouts }));
  };

  // Stil yardımcıları
  const borderClass = design.border_style === 'rounded' ? 'rounded-lg' : design.border_style === 'sharp' ? 'rounded-none' : '';
  const borderInputClass = design.border_style === 'rounded' ? 'rounded-lg' : design.border_style === 'sharp' ? 'rounded-none' : 'border-0 border-b';
  const sizeClass = design.field_size === 'sm' ? 'px-2 py-1.5 text-sm' : design.field_size === 'lg' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm';
  const spacingClass = design.spacing === 'compact' ? 'gap-2' : design.spacing === 'relaxed' ? 'gap-6' : 'gap-4';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Form bulunamadı</p>
        <button onClick={() => router.push('/dashboard/admin')} className="text-indigo-600 hover:underline text-sm">
          ← Admin Paneline Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/admin')} className="text-gray-400 hover:text-white text-sm">
            ← Geri
          </button>
          <div>
            <h1 className="text-base font-semibold">Form Tasarımı</h1>
            <p className="text-xs text-gray-400">{template.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-xs px-2 py-1 rounded ${msg.startsWith('✓') ? 'bg-green-600' : 'bg-red-600'}`}>
              {msg}
            </span>
          )}
          <button onClick={saveDesign} disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition">
            {saving ? 'Kaydediliyor...' : 'Tasarımı Kaydet'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel — Ayarlar */}
        <aside className="w-80 bg-white border-r overflow-y-auto shrink-0">
          {/* Panel Tabs */}
          <div className="flex border-b sticky top-0 bg-white z-10">
            {([
              { key: 'layout', label: '📐 Düzen' },
              { key: 'style', label: '🎨 Stil' },
              { key: 'fields', label: '📋 Alanlar' },
            ] as const).map(p => (
              <button key={p.key} onClick={() => setActivePanel(p.key)}
                className={`flex-1 px-3 py-3 text-xs font-medium border-b-2 transition ${
                  activePanel === p.key ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-5">
            {/* Düzen Paneli */}
            {activePanel === 'layout' && (
              <>
                {/* Sütun Sayısı */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Sütun Düzeni</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => updateDesign({ columns: 1 })}
                      className={`border-2 rounded-lg p-3 text-center transition ${
                        design.columns === 1 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded"></div>
                      <p className="text-xs text-gray-600 mt-2">Tek</p>
                    </button>
                    <button onClick={() => updateDesign({ columns: 2 })}
                      className={`border-2 rounded-lg p-3 text-center transition ${
                        design.columns === 2 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex gap-1 mb-1"><div className="flex-1 h-3 bg-gray-300 rounded"></div><div className="flex-1 h-3 bg-gray-300 rounded"></div></div>
                      <div className="flex gap-1 mb-1"><div className="flex-1 h-3 bg-gray-300 rounded"></div><div className="flex-1 h-3 bg-gray-300 rounded"></div></div>
                      <div className="w-full h-3 bg-gray-300 rounded"></div>
                      <p className="text-xs text-gray-600 mt-2">İki</p>
                    </button>
                    <button onClick={() => updateDesign({ columns: 3 })}
                      className={`border-2 rounded-lg p-3 text-center transition ${
                        design.columns === 3 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex gap-0.5 mb-1"><div className="flex-1 h-3 bg-gray-300 rounded"></div><div className="flex-1 h-3 bg-gray-300 rounded"></div><div className="flex-1 h-3 bg-gray-300 rounded"></div></div>
                      <div className="flex gap-0.5 mb-1"><div className="flex-1 h-3 bg-gray-300 rounded"></div><div className="flex-1 h-3 bg-gray-300 rounded"></div><div className="flex-1 h-3 bg-gray-300 rounded"></div></div>
                      <div className="w-full h-3 bg-gray-300 rounded"></div>
                      <p className="text-xs text-gray-600 mt-2">Üç</p>
                    </button>
                  </div>
                </div>

                {/* Başlık Hizalama */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Başlık Hizalama</label>
                  <div className="flex gap-2">
                    {([['left', 'Sola'], ['center', 'Ortaya']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => updateDesign({ title_align: v })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition ${
                          design.title_align === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <input type="checkbox" checked={design.show_description}
                      onChange={e => updateDesign({ show_description: e.target.checked })}
                      className="rounded" />
                    Açıklamayı Göster
                  </label>
                </div>

                {/* Boşluk */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Alan Arası Boşluk</label>
                  <div className="flex gap-2">
                    {([['compact', 'Sıkı'], ['normal', 'Normal'], ['relaxed', 'Geniş']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => updateDesign({ spacing: v })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition ${
                          design.spacing === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Gönder Butonu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Gönder Butonu Metni</label>
                  <input value={design.submit_label} onChange={e => updateDesign({ submit_label: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
                </div>
              </>
            )}

            {/* Stil Paneli */}
            {activePanel === 'style' && (
              <>
                {/* Accent Renk */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Ana Renk</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ACCENT_PRESETS.map(c => (
                      <button key={c.value} onClick={() => updateDesign({ accent_color: c.value, submit_color: c.value })}
                        className={`h-8 rounded-lg border-2 transition ${
                          design.accent_color === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                        }`} style={{ backgroundColor: c.value }}
                        title={c.name} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={design.accent_color}
                      onChange={e => updateDesign({ accent_color: e.target.value, submit_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer" />
                    <span className="text-xs text-gray-500">{design.accent_color}</span>
                  </div>
                </div>

                {/* Arkaplan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Form Arkaplanı</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Beyaz', value: '#ffffff' },
                      { name: 'Krem', value: '#faf5ff' },
                      { name: 'Açık Gri', value: '#f9fafb' },
                      { name: 'Açık Mavi', value: '#eff6ff' },
                    ].map(c => (
                      <button key={c.value} onClick={() => updateDesign({ bg_color: c.value })}
                        className={`h-8 rounded-lg border-2 transition ${
                          design.bg_color === c.value ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'
                        }`} style={{ backgroundColor: c.value }}
                        title={c.name} />
                    ))}
                  </div>
                </div>

                {/* Kenarlık Stili */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Kenarlık Stili</label>
                  <div className="flex gap-2">
                    {([['rounded', 'Yuvarlak'], ['sharp', 'Keskin'], ['none', 'Kenarlıksız']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => updateDesign({ border_style: v })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition ${
                          design.border_style === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Alan Boyutu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Alan Boyutu</label>
                  <div className="flex gap-2">
                    {([['sm', 'Küçük'], ['md', 'Orta'], ['lg', 'Büyük']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => updateDesign({ field_size: v })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition ${
                          design.field_size === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Font Boyutu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Yazı Boyutu</label>
                  <div className="flex gap-2">
                    {([['text-sm', 'Küçük'], ['text-base', 'Normal'], ['text-lg', 'Büyük']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => updateDesign({ font_size: v })}
                        className={`flex-1 py-1.5 text-xs font-medium rounded border transition ${
                          design.font_size === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Alanlar Paneli */}
            {activePanel === 'fields' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">Alanları sürükleyerek sıralayın. Her alan için genişlik, görünürlük ve yardımcı metin ayarlayabilirsiniz.</p>
                {design.field_layouts.map((layout, idx) => {
                  const field = getFieldByKey(layout.field_key);
                  if (!field) return null;
                  return (
                    <div key={layout.field_key}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`bg-gray-50 border rounded-lg p-3 cursor-grab active:cursor-grabbing transition ${
                        dragOverIndex === idx ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
                      } ${layout.hidden ? 'opacity-50' : ''}`}>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">⠿</span>
                          <span className="text-sm font-medium text-gray-800">{field.label}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => updateFieldLayout(idx, { hidden: !layout.hidden })}
                            className={`text-xs px-1.5 py-0.5 rounded ${layout.hidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {layout.hidden ? 'Gizli' : 'Görünür'}
                          </button>
                        </div>
                      </div>

                      {!layout.hidden && (
                        <div className="space-y-2">
                          {/* Genişlik */}
                          <div className="flex gap-2">
                            <button onClick={() => updateFieldLayout(idx, { col_span: 1 })}
                              className={`flex-1 py-1 text-xs rounded border ${
                                layout.col_span === 1 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'
                              }`}>1/{design.columns}</button>
                            {design.columns === 3 && (
                              <button onClick={() => updateFieldLayout(idx, { col_span: 2 })}
                                className={`flex-1 py-1 text-xs rounded border ${
                                  layout.col_span === 2 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'
                                }`}>2/3</button>
                            )}
                            <button onClick={() => updateFieldLayout(idx, { col_span: design.columns as 1 | 2 | 3 })}
                              className={`flex-1 py-1 text-xs rounded border ${
                                layout.col_span >= design.columns ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'
                              }`}>Tam</button>
                          </div>

                          {/* Özel Etiket */}
                          <input value={layout.custom_label || ''} onChange={e => updateFieldLayout(idx, { custom_label: e.target.value })}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 placeholder:text-gray-400"
                            placeholder="Özel etiket (boş bırakılırsa orijinal kullanılır)" />

                          {/* Yardımcı Metin */}
                          <input value={layout.help_text || ''} onChange={e => updateFieldLayout(idx, { help_text: e.target.value })}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 placeholder:text-gray-400"
                            placeholder="Yardımcı metin (alanın altında görünür)" />

                          {/* Bölüm Başlığı */}
                          {layout.section ? (
                            <div className="flex gap-1">
                              <input value={layout.section} onChange={e => updateFieldLayout(idx, { section: e.target.value })}
                                className="flex-1 border border-indigo-200 rounded px-2 py-1 text-xs text-indigo-700 bg-indigo-50"
                                placeholder="Bölüm adı" />
                              <button onClick={() => removeSection(idx)}
                                className="text-xs bg-red-50 text-red-500 px-2 rounded hover:bg-red-100">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => addSection(idx)}
                              className="text-xs text-indigo-600 hover:text-indigo-800">+ Üstüne bölüm başlığı ekle</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Sağ Panel — Canlı Önizleme */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wider">Canlı Önizleme</p>

            {/* Form Önizleme */}
            <div className={`shadow-xl ${borderClass} overflow-hidden`} style={{ backgroundColor: design.bg_color }}>
              {/* Form Başlık */}
              <div className="px-8 pt-8 pb-4" style={{ textAlign: design.title_align }}>
                <div className="w-12 h-1 rounded mb-4" style={{ backgroundColor: design.accent_color, marginLeft: design.title_align === 'center' ? 'auto' : undefined, marginRight: design.title_align === 'center' ? 'auto' : undefined }}></div>
                <h2 className={`font-bold text-gray-900 ${design.font_size === 'text-lg' ? 'text-2xl' : design.font_size === 'text-base' ? 'text-xl' : 'text-lg'}`}>
                  {template.title}
                </h2>
                {design.show_description && template.description && (
                  <p className={`text-gray-500 mt-1 ${design.font_size === 'text-lg' ? 'text-base' : 'text-sm'}`}>
                    {template.description}
                  </p>
                )}
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: design.accent_color + '20', color: design.accent_color }}>
                  {template.form_type === 'company' ? 'Şirket Formu' : 'Katılımcı Formu'}
                </span>
              </div>

              {/* Form Alanları */}
              <div className={`px-8 pb-8 grid ${design.columns === 3 ? 'grid-cols-3' : design.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'} ${spacingClass}`}>
                {design.field_layouts.map((layout, idx) => {
                  if (layout.hidden) return null;
                  const field = getFieldByKey(layout.field_key);
                  if (!field) return null;
                  const displayLabel = layout.custom_label || field.label;
                  const colSpanClass = design.columns === 1 ? '' : layout.col_span >= design.columns ? 'col-span-full' : layout.col_span === 2 && design.columns === 3 ? 'col-span-2' : '';

                  return (
                    <div key={field.field_key}>
                      {/* Bölüm Başlığı */}
                      {layout.section && (
                        <div className="col-span-full mb-2 mt-2">
                          {design.section_style === 'line' && (
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1" style={{ backgroundColor: design.accent_color + '40' }}></div>
                              <span className="text-sm font-semibold" style={{ color: design.accent_color }}>{layout.section}</span>
                              <div className="h-px flex-1" style={{ backgroundColor: design.accent_color + '40' }}></div>
                            </div>
                          )}
                          {design.section_style === 'card' && (
                            <div className="p-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: design.accent_color + '15', color: design.accent_color }}>
                              {layout.section}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={colSpanClass}>
                        <label className={`block font-medium text-gray-700 mb-1 ${design.font_size === 'text-lg' ? 'text-base' : 'text-sm'}`}>
                          {displayLabel}
                          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>

                        {/* Input Elementleri */}
                        {field.field_type === 'text' && (
                          <input type="text" placeholder={field.placeholder || ''}
                            className={`w-full border border-gray-300 ${borderInputClass} ${sizeClass} text-gray-900 placeholder:text-gray-400 focus:outline-none`}
                            style={{ borderColor: undefined }}
                            onFocus={e => { e.currentTarget.style.borderColor = design.accent_color; e.currentTarget.style.boxShadow = `0 0 0 1px ${design.accent_color}`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                          />
                        )}
                        {field.field_type === 'textarea' && (
                          <textarea rows={3} placeholder={field.placeholder || ''}
                            className={`w-full border border-gray-300 ${borderInputClass} ${sizeClass} text-gray-900 placeholder:text-gray-400 focus:outline-none`}
                            onFocus={e => { e.currentTarget.style.borderColor = design.accent_color; e.currentTarget.style.boxShadow = `0 0 0 1px ${design.accent_color}`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                          />
                        )}
                        {field.field_type === 'number' && (
                          <input type="number" placeholder={field.placeholder || ''}
                            className={`w-full border border-gray-300 ${borderInputClass} ${sizeClass} text-gray-900 placeholder:text-gray-400 focus:outline-none`}
                            onFocus={e => { e.currentTarget.style.borderColor = design.accent_color; e.currentTarget.style.boxShadow = `0 0 0 1px ${design.accent_color}`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                          />
                        )}
                        {field.field_type === 'date' && (
                          <input type="date"
                            className={`w-full border border-gray-300 ${borderInputClass} ${sizeClass} text-gray-900 focus:outline-none`}
                            onFocus={e => { e.currentTarget.style.borderColor = design.accent_color; e.currentTarget.style.boxShadow = `0 0 0 1px ${design.accent_color}`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                          />
                        )}
                        {field.field_type === 'range' && (
                          <input type="range" className="w-full accent-current" style={{ accentColor: design.accent_color }} />
                        )}
                        {field.field_type === 'checkbox' && (
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded w-4 h-4" style={{ accentColor: design.accent_color }} />
                            <span className={`text-gray-700 ${design.font_size}`}>Evet</span>
                          </label>
                        )}
                        {field.field_type === 'select' && (
                          <select className={`w-full border border-gray-300 ${borderInputClass} ${sizeClass} text-gray-900 focus:outline-none`}
                            onFocus={e => { e.currentTarget.style.borderColor = design.accent_color; e.currentTarget.style.boxShadow = `0 0 0 1px ${design.accent_color}`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}>
                            <option value="">Seçiniz...</option>
                            {Array.isArray(field.options) && field.options.map((o, oi) => <option key={oi}>{o}</option>)}
                          </select>
                        )}
                        {field.field_type === 'multiselect' && (
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(field.options) && field.options.map((o, oi) => (
                              <label key={oi} className={`flex items-center gap-1.5 border border-gray-200 px-2.5 py-1 ${borderClass} text-gray-700 hover:bg-gray-50 cursor-pointer ${design.font_size === 'text-lg' ? 'text-base' : 'text-sm'}`}>
                                <input type="checkbox" className="rounded" style={{ accentColor: design.accent_color }} /> {o}
                              </label>
                            ))}
                          </div>
                        )}
                        {field.field_type === 'radio' && (
                          <div className="space-y-1.5">
                            {Array.isArray(field.options) && field.options.map((o, oi) => (
                              <label key={oi} className={`flex items-center gap-2 text-gray-700 cursor-pointer ${design.font_size === 'text-lg' ? 'text-base' : 'text-sm'}`}>
                                <input type="radio" name={`preview_${field.field_key}`} style={{ accentColor: design.accent_color }} /> {o}
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Yardımcı Metin */}
                        {layout.help_text && (
                          <p className="text-xs text-gray-400 mt-1">{layout.help_text}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Gönder Butonu */}
                <div className={`${design.columns >= 2 ? 'col-span-full' : ''} pt-4`}>
                  <button className={`w-full ${borderClass} text-white font-medium transition hover:opacity-90 ${
                    design.field_size === 'lg' ? 'py-3.5 text-base' : design.field_size === 'sm' ? 'py-2 text-sm' : 'py-2.5 text-sm'
                  }`} style={{ backgroundColor: design.submit_color }}>
                    {design.submit_label}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
