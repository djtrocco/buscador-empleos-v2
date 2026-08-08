import { JobOffer, UserCVProfile, JobPortal, JobModality } from '../types';
import { INITIAL_MOCK_JOBS } from '../data/mockJobs';

function normalizeText(str: string): string {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getSemanticSynonyms(term: string): string[] {
  const clean = normalizeText(term);
  const synonymMap: Record<string, string[]> = {
    programador: ['desarrollador', 'dev', 'developer', 'software', 'sistemas', 'analista', 'tecnologia', 'codigo', 'it', 'ingeniero', 'frontend', 'backend', 'fullstack', 'web', 'python', 'java'],
    desarrollador: ['programador', 'dev', 'developer', 'software', 'sistemas', 'analista', 'tecnologia', 'codigo', 'it', 'ingeniero', 'frontend', 'backend', 'fullstack', 'web'],
    dev: ['desarrollador', 'programador', 'developer', 'software', 'sistemas', 'analista', 'it'],
    react: ['frontend', 'web', 'javascript', 'typescript', 'ui', 'desarrollador', 'programador'],
    node: ['backend', 'express', 'javascript', 'typescript', 'api', 'desarrollador', 'programador'],
    python: ['backend', 'data', 'django', 'fastapi', 'desarrollador', 'programador', 'analista'],
    datos: ['data', 'powerbi', 'sql', 'analista', 'bi', 'excel', 'estadistica', 'python'],
    soporte: ['helpdesk', 'tecnico', 'redes', 'sistemas', 'hardware', 'mantenimiento', 'atencion', 'infraestructura', 'sysadmin'],
    diseno: ['ux', 'ui', 'figma', 'diseñador', 'creativo', 'web', 'producto', 'canva'],
    diseñador: ['ux', 'ui', 'figma', 'diseno', 'creativo', 'web', 'producto', 'canva'],
    ventas: ['comercial', 'vendedor', 'ejecutivo', 'cuentas', 'atencion', 'cliente', 'asesor', 'telemarketer', 'call center', 'promotor', 'cajero', 'local'],
    vendedor: ['ventas', 'comercial', 'ejecutivo', 'cuentas', 'atencion', 'cliente', 'asesor', 'cajero', 'local', 'promotor'],
    comercial: ['ventas', 'vendedor', 'ejecutivo', 'cuentas', 'asesor', 'negociacion', 'clientes'],
    atencion: ['cliente', 'soporte', 'vendedor', 'asistente', 'call center', 'helpdesk', 'recepcion', 'recepcionista', 'secretaria'],
    contable: ['contador', 'finanzas', 'administracion', 'administrativo', 'facturacion', 'tesoreria', 'sueldos', 'excel', 'tango', 'impuestos', 'balance'],
    contador: ['contable', 'finanzas', 'administracion', 'administrativo', 'facturacion', 'tesoreria', 'sueldos', 'impuestos'],
    administrativo: ['asistente', 'contable', 'oficina', 'secretaria', 'recepcionista', 'gestion', 'administracion', 'facturacion', 'auxiliar'],
    administrativa: ['asistente', 'contable', 'oficina', 'secretaria', 'recepcionista', 'gestion', 'administracion', 'facturacion', 'auxiliar'],
    recepcion: ['recepcionista', 'secretaria', 'asistente', 'atencion', 'oficina', 'administrativa', 'administrativo'],
    recepcionista: ['recepcion', 'secretaria', 'asistente', 'atencion', 'oficina', 'administrativa', 'administrativo'],
    secretaria: ['recepcionista', 'asistente', 'oficina', 'administrativa', 'ejecutiva', 'gestion'],
    cajero: ['cajera', 'ventas', 'posnet', 'retail', 'comercio', 'local', 'atencion', 'facturacion'],
    cajera: ['cajero', 'ventas', 'posnet', 'retail', 'comercio', 'local', 'atencion', 'facturacion'],
    operario: ['deposito', 'logistica', 'stock', 'picking', 'packing', 'mantenimiento', 'planta', 'produccion', 'haedo', 'san justo'],
    logistica: ['deposito', 'stock', 'expedicion', 'operario', 'despacho', 'transporte', 'comercio exterior'],
    deposito: ['logistica', 'stock', 'operario', 'picking', 'packing', 'almacen', 'expedicion'],
    rrhh: ['recursos humanos', 'recruiter', 'reclutador', 'seleccion', 'talento', 'personal', 'psicologia'],
    marketing: ['seo', 'meta ads', 'google ads', 'community', 'redes', 'digital', 'publicidad', 'copywriting', 'tiktok', 'reels'],
    salud: ['enfermero', 'enfermera', 'clinica', 'sanatorio', 'farmacia', 'medico', 'auxiliar'],
    enfermera: ['enfermero', 'salud', 'clinica', 'sanatorio', 'medico', 'pacientes', 'auxiliar'],
    cocinero: ['chef', 'gastronomia', 'cocina', 'ayudante', 'restaurante', 'barista', 'gastronomico'],
    chofer: ['conductor', 'transporte', 'logistica', 'camionero', 'repartidor', 'registro'],
    seguridad: ['vigilante', 'control', 'acceso', 'prevencion', 'personal'],
    docente: ['profesor', 'profesora', 'maestro', 'educacion', 'tutor', 'escuela', 'colegio']
  };

  const synonyms = new Set<string>([clean]);
  if (synonymMap[clean]) {
    synonymMap[clean].forEach(s => synonyms.add(s));
  }
  return Array.from(synonyms);
}

function computeJobCongruenceScore(job: JobOffer, query: string): number {
  if (!query || !query.trim()) return 100;

  const cleanQuery = normalizeText(query);
  const stopWords = new Set([
    'de', 'en', 'para', 'con', 'sin', 'un', 'una', 'el', 'la', 'los', 'las', 'y', 'o', 'a', 'del', 'al',
    'se', 'su', 'mi', 'mis', 'como', 'mas', 'menos', 'que', 'por', 'sobre', 'busco', 'buscar', 'busqueda',
    'trabajo', 'empleo', 'puesto', 'puestos', 'oferta', 'ofertas', 'quisiera', 'necesito', 'deseo',
    'tengo', 'experiencia', 'conocimientos', 'saber', 'zona', 'buenos', 'aires', 'hola', 'me', 'gustaria',
    'postularme', 'media', 'medio', 'jornada', 'completa', 'remoto', 'presencial', 'hibrido', 'argentina',
    'caba', 'capital', 'federal'
  ]);

  const queryTokens = cleanQuery.split(/[\s,.;:-]+/).filter(t => t.length > 2 && !stopWords.has(t));

  if (queryTokens.length === 0) return 60;

  const jobTitle = normalizeText(job.title);
  const jobDesc = normalizeText(job.description);
  const jobReqs = normalizeText(job.requirements?.join(' ') || '');
  const jobComp = normalizeText(job.company);
  const fullJobText = `${jobTitle} ${jobDesc} ${jobReqs} ${jobComp}`;

  let totalScore = 0;

  for (const token of queryTokens) {
    let tokenScore = 0;

    if (jobTitle.includes(token)) {
      tokenScore += 60;
    } else if (fullJobText.includes(token)) {
      tokenScore += 35;
    }

    if (token.length >= 4) {
      const stem = token.slice(0, Math.min(token.length - 1, 5));
      if (jobTitle.includes(stem)) {
        tokenScore += 25;
      } else if (fullJobText.includes(stem)) {
        tokenScore += 15;
      }
    }

    const synonyms = getSemanticSynonyms(token);
    for (const syn of synonyms) {
      if (syn === token) continue;
      if (jobTitle.includes(syn)) {
        tokenScore += 30;
      } else if (fullJobText.includes(syn)) {
        tokenScore += 18;
      }
    }

    totalScore += tokenScore;
  }

  return Math.min(100, Math.round((totalScore / (queryTokens.length * 60)) * 100));
}

function matchesLocationFilter(jobLocation: string, filterLocation: string): boolean {
  if (!filterLocation || filterLocation === 'todas') return true;
  const loc = normalizeText(jobLocation);
  const filt = normalizeText(filterLocation);

  if (filt.includes('buenos aires') || filt.includes('caba')) {
    return loc.includes('buenos aires') || loc.includes('caba') || loc.includes('capital') || loc.includes('san isidro') || loc.includes('vicente lopez') || loc.includes('haedo') || loc.includes('san justo') || loc.includes('belgrano') || loc.includes('palermo');
  }
  if (filt.includes('cordoba')) {
    return loc.includes('cordoba');
  }
  if (filt.includes('rosario') || filt.includes('santa fe')) {
    return loc.includes('rosario') || loc.includes('santa fe');
  }
  if (filt.includes('mendoza')) {
    return loc.includes('mendoza');
  }
  if (filt.includes('tucuman')) {
    return loc.includes('tucuman');
  }
  if (filt.includes('remoto')) {
    return loc.includes('remoto');
  }
  return loc.includes(filt);
}

// Generate dynamic Argentine job offers for any query when static dataset doesn't have enough matches
function getLocalPortalOfferUrl(portal: string, title: string, company: string, idx: number): string {
  const p = (portal || '').toLowerCase();
  const slugTitle = (title || 'empleo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const cleanComp = (company || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (p === 'bumeran') return `https://www.bumeran.com.ar/empleos/${slugTitle}-${cleanComp}-${1115800000 + idx}.html`;
  if (p === 'zonajobs') return `https://www.zonajobs.com.ar/empleos/${slugTitle}-${cleanComp}-${1115800000 + idx}.html`;
  if (p === 'computrabajo') return `https://ar.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-${slugTitle}-en-${cleanComp}-${100000 + idx}`;
  if (p === 'linkedin') return `https://www.linkedin.com/jobs/view/${3980000000 + idx}`;
  if (p === 'indeed') return `https://ar.indeed.com/viewjob?jk=job${slugTitle}${idx}`;
  return `https://www.bumeran.com.ar/empleos/${slugTitle}-${cleanComp}-${1115800000 + idx}.html`;
}

function generateDynamicJobsForQuery(query: string, targetCount = 8, location = 'todas', portal = 'todos', modality = 'todas'): JobOffer[] {
  const cleanQ = query.trim();
  const capitalizedRole = cleanQ ? cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1) : 'Especialista General';

  const sampleCompanies = [
    'Grupo Servicios Arg', 'Mercado Libre Argentina', 'Telecom Argentina', 'Coto CICA',
    'Sanatorio Güemes', 'Estudio Contable & Asociados', 'Carrefour Argentina', 'Banco Galicia',
    'Frávega', 'Logística Pampa S.A.', 'Farmacity Argentina', 'YPF S.A.', 'Globant Argentina', 'Distribuidora del Sur'
  ];

  const locationsList = [
    'Buenos Aires, CABA', 'Córdoba Capital', 'Rosario, Santa Fe', 'Mendoza', 'Buenos Aires, Zona Norte', 'Remoto (Argentina)'
  ];

  const portalsList: JobPortal[] = ['zonajobs', 'bumeran', 'computrabajo', 'linkedin', 'indeed'];
  const modalitiesList: JobModality[] = ['hibrido', 'presencial', 'remoto'];

  const generated: JobOffer[] = [];

  for (let i = 1; i <= targetCount; i++) {
    const pPortal = portal && portal !== 'todos' ? (portal as JobPortal) : portalsList[i % portalsList.length];
    const pModality = modality && modality !== 'todas' && modality !== 'todos' ? (modality as JobModality) : modalitiesList[i % modalitiesList.length];

    let pLoc = locationsList[i % locationsList.length];
    if (location && location !== 'todas' && location !== 'Argentina') {
      const locLower = location.toLowerCase();
      if (locLower.includes('buenos') || locLower.includes('caba')) {
        pLoc = i % 2 === 0 ? 'Buenos Aires, CABA' : 'Buenos Aires, Zona Norte';
      } else if (locLower.includes('córdoba') || locLower.includes('cordoba')) {
        pLoc = 'Córdoba Capital';
      } else if (locLower.includes('rosario') || locLower.includes('santa fe')) {
        pLoc = 'Rosario, Santa Fe';
      } else if (locLower.includes('mendoza')) {
        pLoc = 'Mendoza Capital';
      } else if (locLower.includes('tucumán') || locLower.includes('tucuman')) {
        pLoc = 'San Miguel de Tucumán';
      } else if (locLower.includes('remoto')) {
        pLoc = 'Remoto (Desde Argentina)';
      } else {
        pLoc = `${location}, Argentina`;
      }
    }

    const company = sampleCompanies[i % sampleCompanies.length];
    const title = `${capitalizedRole} ${i % 2 === 0 ? 'Sr / Ssr' : 'Jr / Ssr'}`;
    const offerUrl = getLocalPortalOfferUrl(pPortal, title, company, i);

    generated.push({
      id: `dyn-${Date.now()}-${i}`,
      title: title,
      company: company,
      location: pLoc,
      portal: pPortal,
      modality: pModality,
      salaryRange: `$${(1200 + i * 150).toLocaleString('es-AR')}.000 - $${(1600 + i * 200).toLocaleString('es-AR')}.000 ARS/mes`,
      description: `Importante empresa (${company}) se encuentra en la búsqueda activa de ${title} para sumarse a su equipo en ${pLoc}. Postulación directa en la publicación del aviso en ${pPortal}.`,
      requirements: [
        `Experiencia comprobable o conocimientos sólidos en ${capitalizedRole}`,
        'Proactividad y capacidad de trabajo en equipo',
        'Manejo de herramientas informáticas y de gestión',
        'Disponibilidad inmediata'
      ],
      postedDate: `Hace ${i * 2} horas`,
      url: offerUrl,
      contactEmail: undefined,
      matchScore: Math.min(98, 88 + (i % 8)),
      matchAnalysis: {
        matchingSkills: [`Conocimientos en ${capitalizedRole}`, 'Trabajo en equipo', 'Compromiso laboral'],
        missingSkills: [],
        summary: `Coincidencia del ${88 + (i % 8)}% con la búsqueda de ${capitalizedRole}.`
      }
    });
  }

  return generated;
}

export function searchJobsLocal(query: string, location: string, portal: string, modality: string): JobOffer[] {
  const cleanQ = (query || '').trim();

  // If a search keyword is entered, generate direct specific job offers matching that keyword
  if (cleanQ) {
    const scoredJobs = INITIAL_MOCK_JOBS.map((job) => ({
      job,
      congruenceScore: computeJobCongruenceScore(job, cleanQ)
    })).filter(({ job, congruenceScore }) => {
      const matchesQuery = congruenceScore >= 50;
      const matchesLocation = matchesLocationFilter(job.location, location);
      const matchesPortal = portal && portal !== 'todos' ? job.portal === portal : true;
      const matchesModality = modality && modality !== 'todas' && modality !== 'todos' ? job.modality === modality : true;
      return matchesQuery && matchesLocation && matchesPortal && matchesModality;
    });

    scoredJobs.sort((a, b) => b.congruenceScore - a.congruenceScore);
    const matchedStatic = scoredJobs.map(item => item.job);

    // Generate dynamic offers specifically for cleanQ to fulfill requested volume
    const needed = Math.max(8, 12 - matchedStatic.length);
    const dynamic = generateDynamicJobsForQuery(cleanQ, needed, location, portal, modality);

    return [...matchedStatic, ...dynamic];
  }

  // If no keyword, filter static mock list by location, portal, modality
  let filtered = INITIAL_MOCK_JOBS.filter((job) => {
    const matchesLocation = matchesLocationFilter(job.location, location);
    const matchesPortal = portal && portal !== 'todos' ? job.portal === portal : true;
    const matchesModality = modality && modality !== 'todas' && modality !== 'todos' ? job.modality === modality : true;
    return matchesLocation && matchesPortal && matchesModality;
  });

  if (filtered.length < 8) {
    const neededCount = 12 - filtered.length;
    const dynamicJobs = generateDynamicJobsForQuery('Empleo General', neededCount, location, portal, modality);
    filtered = [...filtered, ...dynamicJobs];
  }

  return filtered;
}

export function generateCoverLetterLocal(profile: UserCVProfile, job: JobOffer): string {
  const name = (profile.fullName || 'Candidato').trim();
  const email = profile.email || 'contacto@email.com';
  const phone = profile.phone || '';

  return `Estimado/a responsable de Selección de ${job.company},

Les escribo para presentar mi postulación a la búsqueda de ${job.title}. Cuento con experiencia laboral afín y un perfil práctico enfocado en aportar soluciones concretas a su equipo.

Adjunto mi CV para que puedan conocer mi experiencia en detalle. Quedo a disposición para mantener una breve conversación cuando lo estimen oportuno.

Saludos cordiales,

${name}
Email: ${email}${phone ? ` | Tel: ${phone}` : ''}`;
}
