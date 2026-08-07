import React, { useState, useRef } from 'react';
import { UserCVProfile } from '../types';
import { User, Mail, Phone, MapPin, Award, DollarSign, Sparkles, CheckCircle2, FileText, Upload, FileUp, Check, AlertCircle } from 'lucide-react';

interface CVProfileModalProps {
  profile: UserCVProfile;
  onSaveProfile: (updated: UserCVProfile) => void;
}

export const CVProfileModal: React.FC<CVProfileModalProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserCVProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  // Helper to extract email from text
  const extractEmail = (text: string): string => {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0] : '';
  };

  // Helper to extract phone from text
  const extractPhone = (text: string): string => {
    const match = text.match(/(\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/);
    return match ? match[0] : '';
  };

  // Helper to extract skills present in CV text
  const extractSkills = (text: string, currentSkills: string[]): string[] => {
    const commonSkills = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'SQL', 'PostgreSQL', 'MongoDB',
      'HTML', 'CSS', 'Tailwind CSS', 'Git', 'GitHub', 'Python', 'Java', 'C#', '.NET', 'PHP',
      'Excel', 'PowerBI', 'Tableau', 'Análisis de Datos', 'Atención al Cliente', 'Ventas',
      'Marketing Digital', 'Meta Ads', 'Google Ads', 'SEO', 'Figma', 'UX/UI', 'Soporte Técnico',
      'Redes', 'Windows Server', 'Linux', 'Scrum', 'Gestión de Proyectos', 'Contabilidad', 'Facturación'
    ];
    
    const textLower = text.toLowerCase();
    const found = commonSkills.filter(s => textLower.includes(s.toLowerCase()));
    const combined = Array.from(new Set([...currentSkills, ...found]));
    return combined;
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadNotice(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let textContent = '';
        const result = event.target?.result;

        if (typeof result === 'string') {
          // Plain text / Markdown / HTML / RTF
          textContent = result;
        } else if (result instanceof ArrayBuffer) {
          // Binary (PDF/Word/etc.) -> Extract readable text strings
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const rawStr = decoder.decode(result);
          // Clean non-printable bytes
          textContent = rawStr.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (!textContent || textContent.length < 10) {
          throw new Error('No se pudo extraer texto legible del archivo.');
        }

        // Try extracting information
        const foundEmail = extractEmail(textContent) || formData.email;
        const foundPhone = extractPhone(textContent) || formData.phone;
        const updatedSkills = extractSkills(textContent, formData.skills);

        // Try guessing title or name from first lines
        const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);
        let guessedName = formData.fullName;
        let guessedTitle = formData.title;

        if (lines.length > 0) {
          const firstLine = lines[0].replace(/currículum|curriculum|vitae|cv/gi, '').trim();
          if (firstLine.length > 3 && firstLine.length < 50 && !guessedName) {
            guessedName = firstLine;
          }
        }

        const updatedProfile: UserCVProfile = {
          ...formData,
          fullName: guessedName || formData.fullName,
          email: foundEmail,
          phone: foundPhone,
          skills: updatedSkills,
          cvText: textContent.length > 3000 ? textContent.slice(0, 3000) + '\n\n[CV Importado completo]' : textContent,
          title: guessedTitle || formData.title || 'Profesional / Técnico',
          summary: formData.summary || `CV cargado desde archivo "${file.name}". Se detectaron ${updatedSkills.length} habilidades.`
        };

        setFormData(updatedProfile);
        setUploadNotice(`¡CV "${file.name}" subido e importado con éxito! Se actualizaron tus campos y habilidades.`);
      } catch (err: any) {
        setUploadNotice(`Error al leer archivo: ${err?.message || 'Asegúrate de subir un archivo con texto legible'}`);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadNotice('Ocurrió un error al cargar el archivo.');
      setIsUploading(false);
    };

    // Read as Text for txt/md/rtf or as ArrayBuffer for binary
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file); // Default string read with UTF-8 fallback
    }
  };

  const handleQuickFillExample = () => {
    setFormData({
      fullName: 'Carlos Alberto Rodríguez',
      email: 'carlos.rodriguez.arg@gmail.com',
      phone: '+54 9 11 4567-8901',
      location: 'Buenos Aires, CABA (Disponible para Remoto o Presencial)',
      title: 'Desarrollador Web Full Stack / Analista de Sistemas',
      summary: 'Profesional enfocado en desarrollo de aplicaciones web responsivas con React, Node.js y bases de datos. Gran capacidad de resolución de problemas e integración de nuevas tecnologías.',
      experience: '• 3 años trabajando en proyectos de desarrollo web frontend y backend.\n• Optimización de consultas de bases de datos y creación de REST APIs.\n• Trabajo colaborativo bajo metodologías ágiles (Scrum).',
      education: 'Técnico Superior en Programación - Universidad Tecnológica Nacional (UTN)',
      skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Atención al Cliente', 'Resolución de Problemas'],
      salaryExpectation: '$2.000.000 ARS / mes',
      cvText: `CURRÍCULUM VITAE - CARLOS ALBERTO RODRÍGUEZ
Ubicación: Buenos Aires, CABA | Email: carlos.rodriguez.arg@gmail.com | Tel: +54 9 11 4567-8901

RESUMEN PROFESIONAL:
Desarrollador Web Full Stack con más de 3 años de experiencia en la construcción de sistemas web dinámicos. Dominio de tecnologías modernas como React, TypeScript, Node.js y bases de datos relacionales. Apasionado por la optimización de procesos y el desarrollo de software accesible.

EXPERIENCIA LABORAL:
1. Desarrollador Web - Empresa de Tecnología (2023 - Presente)
   - Creación y mantenimiento de interfaces de usuario interactivas en React.
   - Integración de servicios REST API y optimización de experiencia de usuario.
2. Analista Técnico de Soporte - Servicios Informáticos (2021 - 2023)
   - Atención personalizada a clientes corporativos y resolución de incidentes.

EDUCACIÓN Y CERTIFICACIONES:
- Técnico Superior en Programación (UTN - Buenos Aires)
- Certificación en Desarrollo Frontend y Gestión de Proyectos.

HABILIDADES TÉCNICAS:
JavaScript, TypeScript, React, HTML5, CSS3, Tailwind CSS, Node.js, Express, PostgreSQL, Git, Metodologías Ágiles.`
    });
    setUploadNotice('Se han cargado los datos de ejemplo.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Card Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Base para el Postulador Automático por IA
            </div>
            <h2 className="text-2xl font-bold text-white">Mi Perfil y Currículum Vitae (Argentina)</h2>
            <p className="text-sm text-slate-300">
              Sube tu CV en archivo o completa tus datos. La IA Gemini utilizará esta información para redactar cartas de presentación personalizadas y analizar la compatibilidad con empleos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickFillExample}
            className="self-start md:self-auto flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-medium px-4 py-2.5 rounded-xl transition shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cargar Datos de Ejemplo</span>
          </button>
        </div>
      </div>

      {/* UPLOAD CV BUTTON BOX */}
      <div className="bg-slate-900/90 border border-sky-800/50 rounded-2xl p-5 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
              <FileUp className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Subir o Importar tu CV
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">Auto-Lectura</span>
              </h3>
              <p className="text-xs text-slate-300">
                Sube tu CV en formato <strong>PDF, Word (.docx), TXT o Markdown</strong>. Extraeremos automáticamente tu texto, email, teléfono y habilidades.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.txt,.md,.rtf"
              onChange={handleFileUpload}
              className="hidden"
              id="cv-file-upload-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Procesando Archivo...' : 'Subir Archivo de CV'}</span>
            </button>
          </div>
        </div>

        {uploadNotice && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center space-x-2 border ${
            uploadNotice.includes('Error') 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {uploadNotice.includes('Error') ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{uploadNotice}</span>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center space-x-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span><strong>¡Perfil Guardado Con Éxito!</strong> La IA utilizará estos datos para tus postulaciones en Argentina.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" /> Nombre Completo
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ej: Carlos Alberto Rodríguez"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" /> Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: tu.email@gmail.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-400" /> Teléfono de Contacto
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: +54 9 11 4567-8901"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" /> Ubicación en Argentina
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Buenos Aires, CABA / Córdoba / Rosario / Remoto"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" /> Título o Cargo Principal
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Desarrollador Frontend / Administrativo Contable / Analista de Datos Jr"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Pretensión Salarial Bruta (Opcional)
            </label>
            <input
              type="text"
              name="salaryExpectation"
              value={formData.salaryExpectation}
              onChange={handleChange}
              placeholder="Ej: $2.000.000 ARS / mes o USD 1.500"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Habilidades */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">Habilidades Clave (Tag / Etiquetas)</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
              placeholder="Escribe una habilidad (Ej: Excel, React, Atención al Cliente) y presiona Enter"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition"
            >
              Agregar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="bg-slate-800 text-sky-300 text-xs font-medium px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-400 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Texto Completo del CV */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> Texto Completo de tu Currículum Vitae (CV)
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Pega aquí o revisa el texto de tu CV (Experiencia laboral, estudios, cursos, logros). La IA utilizará esto para analizar el Match % con cada empleo en Argentina.
          </p>
          <textarea
            name="cvText"
            rows={8}
            value={formData.cvText}
            onChange={handleChange}
            placeholder="Pega aquí todo el contenido de tu CV en formato texto o sube un archivo con el botón de arriba..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/25 transition"
          >
            Guardar Perfil y CV
          </button>
        </div>
      </form>
    </div>
  );
};
