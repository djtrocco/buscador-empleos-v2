import React, { useState } from 'react';
import { JobOffer, JobPortal } from '../types';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Bookmark
} from 'lucide-react';

interface JobCardProps {
  job: JobOffer;
  onApplyAuto: (job: JobOffer) => void;
  onSaveLinkedInOpportunity: (job: JobOffer) => void;
  onAnalyzeMatch: (job: JobOffer) => void;
  isAnalyzingMatch: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onApplyAuto,
  onSaveLinkedInOpportunity,
  onAnalyzeMatch,
  isAnalyzingMatch,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPortalBadge = (portal: JobPortal) => {
    switch (portal) {
      case 'linkedin':
        return {
          label: 'LinkedIn Argentina',
          style: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400'
        };
      case 'zonajobs':
        return {
          label: 'ZonaJobs',
          style: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          dot: 'bg-sky-400'
        };
      case 'bumeran':
        return {
          label: 'Bumeran',
          style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          dot: 'bg-indigo-400'
        };
      case 'computrabajo':
        return {
          label: 'CompuTrabajo',
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400'
        };
      case 'indeed':
        return {
          label: 'Indeed',
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          label: 'Empresa Directa',
          style: 'bg-slate-700/50 text-slate-300 border-slate-600',
          dot: 'bg-slate-400'
        };
    }
  };

  const portalInfo = getPortalBadge(job.portal);
  const isLinkedIn = job.portal === 'linkedin';
  const isAutomated = Boolean(job.contactEmail || job.portal === 'direct');

  return (
    <div className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl transition-all duration-200 hover:border-slate-700 hover:shadow-2xl flex flex-col justify-between ${
      isLinkedIn ? 'border-blue-900/50 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/20' : 'border-slate-800/90'
    }`}>
      <div>
        {/* Top row: Portal & Application Mode Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${portalInfo.style}`}>
              <span className={`w-2 h-2 rounded-full ${portalInfo.dot}`} />
              {portalInfo.label}
            </span>

            {/* Application Mode Badge: Auto vs Manual */}
            {isAutomated ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1" title="Postulación directa 1-clic con envío automático de CV">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Auto 1-Clic</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1" title="Requiere ingreso a la web del portal. La IA redactará tu carta personalizada.">
                <ExternalLink className="w-3 h-3 text-amber-400" />
                <span>Manual en Portal</span>
              </span>
            )}

            <span className="text-xs bg-slate-950/80 text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 font-medium capitalize">
              {job.modality}
            </span>
          </div>

          {job.matchScore !== undefined && (
            <div className="flex items-center space-x-1.5 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-400 font-medium">Match:</span>
              <span className={`text-xs font-bold ${
                job.matchScore >= 80 ? 'text-emerald-400' : job.matchScore >= 60 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {job.matchScore}%
              </span>
            </div>
          )}
        </div>

        {/* Main Job Title & Company */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white leading-snug hover:text-sky-400 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            {job.title}
          </h3>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-sky-400 font-medium mt-1">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>{job.company}</span>
          </div>
        </div>

        {/* Details Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>

          {job.salaryRange && (
            <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{job.salaryRange}</span>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.postedDate}</span>
          </div>
        </div>

        {/* Key Requirements tags */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.requirements.map((req, idx) => (
              <span key={idx} className="bg-slate-950/70 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-lg border border-slate-800">
                {req}
              </span>
            ))}
          </div>
        )}

        {/* LINKEDIN SPECIAL NOTICE BOX */}
        {isLinkedIn ? (
          <div className="mb-4 bg-blue-950/30 border border-blue-800/50 rounded-2xl p-3.5 text-xs text-blue-200 space-y-1.5">
            <div className="flex items-center space-x-2 font-semibold text-blue-300">
              <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
              <span>LinkedIn Argentina: Búsqueda Directa</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Accede directamente al enlace oficial para postularte de forma segura protegiendo tu cuenta.
            </p>
          </div>
        ) : null}
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition"
        >
          <span>{isExpanded ? 'Ocultar Detalle' : 'Ver Detalle Completo'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center space-x-2 ml-auto">
          {/* Analyze match button */}
          <button
            onClick={() => onAnalyzeMatch(job)}
            disabled={isAnalyzingMatch}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
            title="Analizar nivel de coincidencia con tu CV con IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Match IA</span>
          </button>

          {isAutomated ? (
            <button
              onClick={() => onApplyAuto(job)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 transition"
              title="Postulación automática de 1-clic con envío directo de CV y carta"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Postulación Auto</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {isLinkedIn && (
                <button
                  onClick={() => onSaveLinkedInOpportunity(job)}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-medium px-2.5 py-2 rounded-xl border border-blue-800/50 flex items-center gap-1 transition"
                  title="Guardar en mi tablero sin postularme aún"
                >
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Guardar</span>
                </button>
              )}

              <button
                onClick={() => onApplyAuto(job)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-sky-500/25 flex items-center space-x-1.5 transition"
                title="Genera tu carta con IA y abre el portal oficial para postularte manualmente"
              >
                <span>Postulación Manual</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 text-xs text-slate-300">
          <div>
            <h4 className="font-semibold text-white mb-1">Descripción de la Oferta:</h4>
            <p className="leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {job.description}
            </p>
          </div>

          {job.matchAnalysis && (
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Análisis de Compatibilidad (IA Gemini):</span>
              </div>
              <p className="text-slate-300">{job.matchAnalysis.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-emerald-400 font-medium flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coincidencias en tu CV:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.matchAnalysis.matchingSkills.map((s, idx) => (
                      <span key={idx} className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {job.matchAnalysis.missingSkills.length > 0 && (
                  <div>
                    <span className="text-amber-400 font-medium flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Requisitos a reforzar:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.matchAnalysis.missingSkills.map((s, idx) => (
                        <span key={idx} className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {job.contactEmail && (
            <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400">Contacto de Selección:</span>
              <span className="font-mono text-sky-300">{job.contactEmail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
