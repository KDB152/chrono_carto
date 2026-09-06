export const MAX_STUDENTS_PER_GROUP = 20;

export const GROUP_FULL_MESSAGE =
  'Le groupe est saturé. Veuillez choisir un autre groupe par exemple.';

export const AVAILABLE_CLASS_LEVELS = [
  'Terminale groupe 1 (Lundi 18h30-20h30)',
  'Terminale groupe 2 (Vendredi 16h30-18h30)',
  'Terminale groupe 3 (Vendredi 18h30-20h30)',
  'Terminale groupe 4 (Dimanche 08h00-10h00)',
  '1ere groupe 1 (Jeudi 18h30-20h30)',
  '1ere groupe 2 (Vendredi 14h00-16h00)',
  '1ere groupe 3 (Dimanche 10h00-12h00)',
];

const LEGACY_CLASS_LEVELS: Record<string, string> = {
  'Terminale groupe 1': 'Terminale groupe 1 (Lundi 18h30-20h30)',
  'Terminale groupe 2': 'Terminale groupe 2 (Vendredi 16h30-18h30)',
  'Terminale groupe 3': 'Terminale groupe 3 (Vendredi 18h30-20h30)',
  'Terminale groupe 4': 'Terminale groupe 4 (Dimanche 08h00-10h00)',
  '1ere groupe 1': '1ere groupe 1 (Jeudi 18h30-20h30)',
  '1ere groupe 2': '1ere groupe 2 (Vendredi 14h00-16h00)',
  '1ere groupe 3': '1ere groupe 3 (Dimanche 10h00-12h00)',
};

export const CLASS_LABELS: Record<string, string> = {
  ...LEGACY_CLASS_LEVELS,
  ...Object.fromEntries(AVAILABLE_CLASS_LEVELS.map((name) => [name, name])),
};

export function normalizeClassLevel(classLevel?: string | null): string | undefined {
  if (!classLevel) return undefined;
  const trimmed = classLevel.trim();
  if (AVAILABLE_CLASS_LEVELS.includes(trimmed) || CLASS_LABELS[trimmed]) {
    return CLASS_LABELS[trimmed] || trimmed;
  }
  return trimmed;
}

export function getClassLevelAliases(classLevel?: string | null): string[] {
  const normalized = normalizeClassLevel(classLevel);
  if (!normalized) return [];
  const aliases = Object.entries(CLASS_LABELS)
    .filter(([key, label]) => key === normalized || label === normalized)
    .flatMap(([key, label]) => [key, label]);
  return Array.from(new Set([normalized, ...aliases]));
}
