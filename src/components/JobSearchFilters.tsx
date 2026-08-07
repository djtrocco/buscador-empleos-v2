import React from 'react';
import { Search, MapPin, Globe, Briefcase, Filter, Sparkles, RefreshCw } from 'lucide-react';
import { JobPortal, JobModality } from '../types';

interface JobSearchFiltersProps {
  query: string;
  setQuery: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  portal: string;
  setPortal: (val: string) => void;
  modality: string;
  setModality: (val: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export const JobSearchFilters: React.FC<JobSearchFiltersProps> = ({
  query,
  setQuery,
  location,
  setLocation,
  portal,
  setPortal,
  modality,
  setModality,
  onSearch,
  isSearching,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Search Input Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Puesto, habilidades o palabras clave (Ej: React, Analista, Contador, Ventas)..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
          />
        </div>

        <button
          onClick={onSearch}
          disabled={isSearching}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 shrink-0"
        >
          {isSearching ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Buscando en Argentina...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Buscar Empleos con IA</span>
            </>
          )}
        </button>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
        {/* Ubicación / Provincia */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" /> Ubicación en Argentina
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="todas">Todas las provincias / Remoto</option>
            <option value="Buenos Aires">Buenos Aires / CABA</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Rosario">Rosario / Santa Fe</option>
            <option value="Mendoza">Mendoza</option>
            <option value="Tucumán">Tucumán</option>
            <option value="Remoto">100% Remoto (Desde Argentina)</option>
          </select>
        </div>

        {/* Portal de Empleo */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> Portal de Búsqueda
          </label>
          <select
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="todos">Todos los portales argentinos</option>
            <option value="zonajobs">ZonaJobs</option>
            <option value="bumeran">Bumeran Argentina</option>
            <option value="computrabajo">CompuTrabajo Argentina</option>
            <option value="linkedin">LinkedIn (Solo Búsqueda)</option>
            <option value="indeed">Indeed Argentina</option>
          </select>
        </div>

        {/* Modalidad de Trabajo */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Modalidad
          </label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="todos">Cualquier modalidad</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>
      </div>
    </div>
  );
};
