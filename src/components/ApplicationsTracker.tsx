import React, { useState } from 'react';
import { ApplicationLog, ApplicationState } from '../types';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  FileText,
  Building2,
  Sparkles,
  AlertCircle,
  Tag,
  Search
} from 'lucide-react';

interface ApplicationsTrackerProps {
  applications: ApplicationLog[];
  onUpdateState: (id: string, newState: ApplicationState) => void;
  onDeleteApplication: (id: string) => void;
}

export const ApplicationsTracker: React.FC<ApplicationsTrackerProps> = ({
  applications,
  onUpdateState,
  onDeleteApplication,
}) => {
  const [filterState, setFilterState] = useState<string>('todas');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const getStatusBadge = (state: ApplicationState) => {
    switch (state) {
      case 'postulado_auto':
      case 'postulado_manual':
        return {
          label: '✉ Enviado por Email',
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'en_revision':
        return {
          label: 'En Revisión de CV',
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'entrevista':
        return {
          label: '¡Entrevista Agendada!',
          style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        };
      case 'descartado':
        return {
          label: 'Descartado',
          style: 'bg-slate-700/50 text-slate-400 border-slate-600'
        };
      default:
        return {
          label: '✉ Enviado por Email',
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
    }
  };

  const filtered = applications.filter((app) => {
    const matchesState = filterState === 'todas' || app.state === filterState;
    const matchesQuery = searchFilter === '' ||
      app.jobTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.company.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesState && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-sky-400" />
            Tablero de Postulaciones y Oportunidades
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Registro automático de todas las búsquedas enviadas, cartas de presentación y postulaciones de LinkedIn en Argentina.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Total enviadas / guardadas:</span>
          <span className="text-lg font-bold text-sky-400">{applications.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar por puesto o empresa..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="todas">Todos los estados</option>
          <option value="postulado_auto">✉ Enviados por Email</option>
          <option value="en_revision">En Revisión de CV</option>
          <option value="entrevista">Entrevistas Agendadas</option>
          <option value="descartado">Descartados</option>
        </select>
      </div>

      {/* List or Cards */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No hay postulaciones registradas en esta vista</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ve a la pestaña "Buscar Empleos", selecciona ofertas en Argentina y haz clic en "Enviar Postulación".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((app) => {
            const badge = getStatusBadge(app.state);
            return (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {app.appliedAt}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{app.jobTitle}</h4>
                    <div className="flex items-center space-x-2 text-xs text-sky-400 font-medium mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{app.company}</span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <button
                      onClick={() => setSelectedLetter(app.coverLetter || '')}
                      className="inline-flex items-center space-x-1 text-xs text-sky-300 hover:text-sky-200 underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Carta de Presentación Enviada</span>
                    </button>
                  )}
                </div>

                {/* State selector & Delete */}
                <div className="flex items-center space-x-3 shrink-0">
                  <select
                    value={app.state}
                    onChange={(e) => onUpdateState(app.id, e.target.value as ApplicationState)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
                  >
                    <option value="postulado_auto">✉ Enviado por Email</option>
                    <option value="en_revision">En Revisión de CV</option>
                    <option value="entrevista">¡Entrevista!</option>
                    <option value="descartado">Descartado</option>
                  </select>

                  <button
                    onClick={() => onDeleteApplication(app.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                    title="Eliminar de mi registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Cover Letter View */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Carta de Presentación Enviada
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-80 overflow-y-auto text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {selectedLetter}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLetter(null)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
