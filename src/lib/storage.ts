import fs from 'fs';
import path from 'path';
import { Lead, LandingPageProject, AppSettings } from '@/types';

interface DatabaseSchema {
  leads: Lead[];
  projects: LandingPageProject[];
  settings: AppSettings;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultSettings: AppSettings = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  provider: process.env.GEMINI_API_KEY ? 'gemini' : 'heuristic',
  mapProvider: 'osm',
  userCity: 'São Paulo, SP',
  defaultRadiusKm: 5,
};

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      leads: [],
      projects: [],
      settings: defaultSettings,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      leads: parsed.leads || [],
      projects: parsed.projects || [],
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
  } catch (err) {
    console.error('Error reading db.json, returning defaults', err);
    return { leads: [], projects: [], settings: defaultSettings };
  }
}

function writeDb(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Leads
export function getLeads(): Lead[] {
  return ensureDb().leads;
}

export function saveLead(lead: Lead): Lead {
  const db = ensureDb();
  const existingIdx = db.leads.findIndex((l) => l.id === lead.id || l.businessId === lead.businessId);
  if (existingIdx >= 0) {
    db.leads[existingIdx] = { ...db.leads[existingIdx], ...lead, updatedAt: new Date().toISOString() };
  } else {
    db.leads.unshift(lead);
  }
  writeDb(db);
  return lead;
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const db = ensureDb();
  const idx = db.leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  db.leads[idx] = { ...db.leads[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.leads[idx];
}

export function deleteLead(id: string): boolean {
  const db = ensureDb();
  const initialLen = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== id);
  if (db.leads.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// Projects
export function getProjects(): LandingPageProject[] {
  return ensureDb().projects;
}

export function getProjectById(id: string): LandingPageProject | null {
  const db = ensureDb();
  return db.projects.find((p) => p.id === id) || null;
}

export function saveProject(project: LandingPageProject): LandingPageProject {
  const db = ensureDb();
  const existingIdx = db.projects.findIndex((p) => p.id === project.id);
  if (existingIdx >= 0) {
    db.projects[existingIdx] = { ...db.projects[existingIdx], ...project, updatedAt: new Date().toISOString() };
  } else {
    db.projects.unshift(project);
  }
  writeDb(db);
  return project;
}

export function deleteProject(id: string): boolean {
  const db = ensureDb();
  const initialLen = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);
  if (db.projects.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// Settings
export function getSettings(): AppSettings {
  return ensureDb().settings;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const db = ensureDb();
  db.settings = { ...db.settings, ...settings };
  writeDb(db);
  return db.settings;
}
