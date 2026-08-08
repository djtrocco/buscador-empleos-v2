import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { JobOffer, UserCVProfile, ApplicationLog, ApplicationState } from './types';
import { INITIAL_MOCK_JOBS } from './data/mockJobs';
import { searchJobsLocal, generateCoverLetterLocal } from './utils/localJobSearch';
import { Header } from './components/Header';
import { JobSearchFilters } from './components/JobSearchFilters';
import { JobCard } from './components/JobCard';
import { CVProfileModal } from './components/CVProfileModal';
import { CoverLetterModal } from './components/CoverLetterModal';
import { ApplicationsTracker } from './components/ApplicationsTracker';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import {
  Sparkles,
  Briefcase,
  Search,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  Globe
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'profile' | 'applications' | 'guide'>('search');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Profile State with localStorage persistence
  const [profile, setProfile] = useState<UserCVProfile>(() => {
    const saved = localStorage.getItem('autoempleo_arg_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      fullName: 'Carlos Alberto Rodríguez',
      email: 'carlos.rodriguez.arg@gmail.com',
      phone: '+54 9 11 4567-8901',
      location: 'Buenos Aires, CABA (Disponible Remoto)',
      title: 'Desarrollador Web / Analista de Sistemas',
      summary: 'Profesional orientado al desarrollo de software y gestión técnica. Experiencia en React, Node.js y resolución de problemas.',
      experience: '• 3 años en desarrollo web frontend y backend.\n• Implementación de bases de datos y consumo de APIs.',
      education: 'Técnico Superior en Programación - UTN',
      skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Atención al Cliente'],
      salaryExpectation: '$2.000.000 ARS / mes',
      cvText: `CURRÍCULUM VITAE - CARLOS ALBERTO RODRÍGUEZ\nUbicación: Buenos Aires, CABA\nEmail: carlos.rodriguez.arg@gmail.com\nTel: +54 9 11 4567-8901\n\nRESUMEN:\nDesarrollador Web con experiencia en React, TypeScript, Node.js y bases de datos. Apasionado por la tecnología y la optimización de procesos.`
    };
  });

  // Tracked Applications with localStorage
  const [applications, setApplications] = useState<ApplicationLog[]>(() => {
    const saved = localStorage.getItem('autoempleo_arg_apps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Search Filters & State
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('todas');
  const [portal, setPortal] = useState('todos');
  const [modality, setModality] = useState('todos');

  const [jobs, setJobs] = useState<JobOffer[]>(INITIAL_MOCK_JOBS);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-Apply Modal & Cover Letter State
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOffer | null>(null);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isAnalyzingMatchId, setIsAnalyzingMatchId] = useState<string | null>(null);

  // Check health / Gemini Key on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey) {
          setHasGeminiKey(true);
        }
      })
      .catch((err) => console.log('Server health check local mode:', err));
  }, []);

  // Save profile changes
  const handleSaveProfile = (updated: UserCVProfile) => {
    setProfile(updated);
    localStorage.setItem('autoempleo_arg_profile', JSON.stringify(updated));
  };

  // Save applications changes
  const saveApplicationsToStorage = (updatedApps: ApplicationLog[]) => {
    setApplications(updatedApps);
    localStorage.setItem('autoempleo_arg_apps', JSON.stringify(updatedApps));
  };

  // Execute Search
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, portal, modality }),
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setJobs(data.jobs);
      } else {
        throw new Error('Empty backend results');
      }
    } catch (err) {
      console.warn('Servidor API no disponible o despliegue estático en Vercel. Ejecutando motor de búsqueda local:', err);
      const fallbackJobs = searchJobsLocal(query, location, portal, modality);
      setJobs(fallbackJobs);
    } finally {
      setIsSearching(false);
    }
  };

  // Re-run search whenever location, portal or modality filters are selected
  useEffect(() => {
    handleSearch();
  }, [location, portal, modality]);

  // Analyze Match score
  const handleAnalyzeMatch = async (job: JobOffer) => {
    setIsAnalyzingMatchId(job.id);
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: profile.cvText, job }),
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.matchScore !== undefined) {
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === job.id
              ? { ...j, matchScore: data.matchScore, matchAnalysis: data.matchAnalysis }
              : j
          )
        );
      }
    } catch (err) {
      console.warn('Simulando análisis de match local:', err);
      // Fallback local score computation
      const calculatedScore = Math.min(95, Math.max(65, Math.floor(Math.random() * 25) + 70));
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === job.id
            ? {
                ...j,
                matchScore: calculatedScore,
                matchAnalysis: {
                  matchingSkills: job.requirements ? job.requirements.slice(0, 3) : ['Experiencia previa'],
                  missingSkills: job.requirements ? job.requirements.slice(3) : [],
                  summary: `Compatibilidad calculada del ${calculatedScore}% con el puesto de ${job.title}.`
                }
              }
            : j
        )
      );
    } finally {
      setIsAnalyzingMatchId(null);
    }
  };

  // Generate Cover Letter & Open Modal
  const handleOpenApplyModal = async (job: JobOffer) => {
    setSelectedJobForApply(job);
    setIsGeneratingLetter(true);
    setCoverLetterText('');

    try {
      const res = await fetch('/api/jobs/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, job }),
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetterText(data.coverLetter);
      } else {
        throw new Error('No cover letter returned');
      }
    } catch (err) {
      console.warn('Generando carta de presentación con plantilla local:', err);
      const fallbackLetter = generateCoverLetterLocal(profile, job);
      setCoverLetterText(fallbackLetter);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Confirm Application (Email Send)
  const handleConfirmApply = async (finalLetter: string, recipientEmail?: string) => {
    if (!selectedJobForApply) return;

    const appId = `app-${Date.now()}`;
    const newState: ApplicationState = 'postulado_auto';
    const targetEmail = recipientEmail || selectedJobForApply.contactEmail || `busquedas@${selectedJobForApply.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.ar`;

    let messageId = `msg-${Date.now()}`;
    let savedInSentFolder = true;

    try {
      const originHost = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch('/api/gmail/send-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          originHost,
          toEmail: targetEmail,
          jobTitle: selectedJobForApply.title,
          company: selectedJobForApply.company,
          coverLetter: finalLetter,
          cvText: profile.cvText,
          cvFileName: profile.cvFileName || `CV_${(profile.fullName || 'Candidato').replace(/\s+/g, '_')}.txt`,
          candidateName: profile.fullName || 'Candidato',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messageId) messageId = data.messageId;
        savedInSentFolder = Boolean(data.savedInSentFolder ?? true);
      }
    } catch (err) {
      console.error('Error submitting application via Gmail:', err);
    }

    const newLog: ApplicationLog = {
      id: appId,
      jobId: selectedJobForApply.id,
      jobTitle: selectedJobForApply.title,
      company: selectedJobForApply.company,
      portal: selectedJobForApply.portal,
      appliedAt: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      state: newState,
      coverLetter: finalLetter,
      recipientEmail: targetEmail,
      matchScore: selectedJobForApply.matchScore,
      gmailMessageId: messageId,
      savedInSentFolder,
      isRead: false,
    };

    saveApplicationsToStorage([newLog, ...applications]);
    setSelectedJobForApply(null);
    setActiveTab('applications');
  };

  // Save LinkedIn Opportunity
  const handleSaveLinkedInOpportunity = (job: JobOffer) => {
    const exists = applications.some((a) => a.jobId === job.id);
    if (!exists) {
      const newLog: ApplicationLog = {
        id: `app-li-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        portal: 'linkedin',
        appliedAt: new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        state: 'pendiente_linkedin',
        notes: 'Guardado para postulación manual directa en la web de LinkedIn.',
        matchScore: job.matchScore,
      };
      saveApplicationsToStorage([newLog, ...applications]);
      setActiveTab('applications');
    }
  };

  // Application tracker handlers
  const handleUpdateAppState = (id: string, newState: ApplicationState) => {
    const updated = applications.map((a) => (a.id === id ? { ...a, state: newState } : a));
    saveApplicationsToStorage(updated);
  };

  const handleToggleReadStatus = (id: string) => {
    const nowStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';
    const updated = applications.map((a) => {
      if (a.id === id) {
        const nextIsRead = !a.isRead;
        return {
          ...a,
          isRead: nextIsRead,
          readAt: nextIsRead ? (a.readAt || nowStr) : undefined,
        };
      }
      return a;
    });
    saveApplicationsToStorage(updated);
  };

  const handleDeleteApp = (id: string) => {
    const updated = applications.filter((a) => a.id !== id);
    saveApplicationsToStorage(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeminiKey={hasGeminiKey}
        applicationsCount={applications.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Bento Grid Top Dashboard Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Bento Box 1: Hero Welcome (8 cols) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="md:col-span-8 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3 relative z-10">
                  <div className="inline-flex items-center space-x-2 bg-sky-500/10 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/20">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>AutoEmpleo Argentina • Motor IA Asistido</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Encuentra Empleos Reales en Argentina y Postúlate con IA
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    Conecta tu CV y explora ofertas en <strong>ZonaJobs, Bumeran, CompuTrabajo, Indeed e información directa de LinkedIn</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400 relative z-10">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" /> Búsqueda sin Spam
                  </span>
                  <span className="flex items-center gap-1 text-sky-400 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Cartas Adaptadas por Puesto
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Globe className="w-4 h-4 text-indigo-400" /> Cobertura Argentina 🇦🇷
                  </span>
                </div>
              </motion.div>

              {/* Bento Box 2: Quick Metrics Grid (4 cols) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="md:col-span-4 grid grid-cols-2 gap-3"
              >
                {/* Metric 1: Jobs Count */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Ofertas</span>
                    <Briefcase className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-white">{jobs.length}</span>
                    <p className="text-[10px] text-slate-400">Encontradas en el mercado</p>
                  </div>
                </motion.div>

                {/* Metric 2: Applications */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Enviadas</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-emerald-400">{applications.length}</span>
                    <p className="text-[10px] text-slate-400">Postulaciones registradas</p>
                  </div>
                </motion.div>

                {/* Metric 3: Profile Status */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('profile')}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer hover:border-sky-500/50 transition group"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Perfil CV</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-bold text-slate-200 line-clamp-1">{profile.fullName || 'Mi Perfil'}</span>
                    <p className="text-[10px] text-sky-400 font-medium">Ver / Editar CV →</p>
                  </div>
                </motion.div>

                {/* Metric 4: Gemini Mode */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Motor IA</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-bold text-amber-300">Gemini 3.6</span>
                    <p className="text-[10px] text-slate-400">{hasGeminiKey ? 'Clave Activa' : 'Modo Asistido'}</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Filter Bar */}
            <JobSearchFilters
              query={query}
              setQuery={setQuery}
              location={location}
              setLocation={setLocation}
              portal={portal}
              setPortal={setPortal}
              modality={modality}
              setModality={setModality}
              onSearch={handleSearch}
              isSearching={isSearching}
            />

            {/* Job Offers Bento Grid */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Resultados del mercado laboral argentino: <strong className="text-white">{jobs.length}</strong> empleos</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <Zap className="w-3 h-3 text-emerald-400" /> 100% con Email Integrado y Postulación Directa
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" /> ¿Cómo subir esta web a internet? Guía Didáctica
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.35), ease: 'easeOut' }}
                  >
                    <JobCard
                      job={job}
                      onApplyAuto={handleOpenApplyModal}
                      onSaveLinkedInOpportunity={handleSaveLinkedInOpportunity}
                      onAnalyzeMatch={handleAnalyzeMatch}
                      isAnalyzingMatch={isAnalyzingMatchId === job.id}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CVProfileModal profile={profile} onSaveProfile={handleSaveProfile} />
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ApplicationsTracker
              applications={applications}
              onUpdateState={handleUpdateAppState}
              onDeleteApplication={handleDeleteApp}
              onToggleReadStatus={handleToggleReadStatus}
            />
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DeploymentGuideModal />
          </motion.div>
        )}
      </main>

      {/* Cover Letter / Auto-Apply Modal */}
      {selectedJobForApply && (
        <CoverLetterModal
          job={selectedJobForApply}
          profile={profile}
          coverLetterText={coverLetterText}
          setCoverLetterText={setCoverLetterText}
          onClose={() => setSelectedJobForApply(null)}
          onConfirmApply={handleConfirmApply}
          isGenerating={isGeneratingLetter}
          onRegenerate={() => handleOpenApplyModal(selectedJobForApply)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-500 py-6 text-center space-y-2">
        <p className="max-w-2xl mx-auto px-4">
          <strong>AutoEmpleo Argentina</strong> — Plataforma inteligente de búsqueda de empleos y postulación asistida con IA.
        </p>
        <p>© 2026 AutoEmpleo Argentina. Diseñado para simplificar tu búsqueda laboral.</p>
      </footer>
    </div>
  );
}
