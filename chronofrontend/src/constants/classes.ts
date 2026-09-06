// Constantes partagées pour les classes
export const MAX_STUDENTS_PER_GROUP = 20;

export const AVAILABLE_CLASSES = [
  'Terminale groupe 1 (Lundi 18h30-20h30)',
  'Terminale groupe 2 (Vendredi 16h30-18h30)',
  'Terminale groupe 3 (Vendredi 18h30-20h30)',
  'Terminale groupe 4 (Dimanche 08h00-10h00)',
  '1ere groupe 1 (Jeudi 18h30-20h30)',
  '1ere groupe 2 (Vendredi 14h00-16h00)',
  '1ere groupe 3 (Dimanche 10h00-12h00)',
];

const LEGACY_CLASS_LABELS: Record<string, string> = {
  'Terminale groupe 1': 'Terminale groupe 1 (Lundi 18h30-20h30)',
  'Terminale groupe 2': 'Terminale groupe 2 (Vendredi 16h30-18h30)',
  'Terminale groupe 3': 'Terminale groupe 3 (Vendredi 18h30-20h30)',
  'Terminale groupe 4': 'Terminale groupe 4 (Dimanche 08h00-10h00)',
  '1ere groupe 1': '1ere groupe 1 (Jeudi 18h30-20h30)',
  '1ere groupe 2': '1ere groupe 2 (Vendredi 14h00-16h00)',
  '1ere groupe 3': '1ere groupe 3 (Dimanche 10h00-12h00)',
};

export const GROUP_FULL_MESSAGE =
  'Le groupe est saturé. Veuillez choisir un autre groupe par exemple.';

export function getClassLabel(classLevel?: string | null): string {
  if (!classLevel) return '';
  return LEGACY_CLASS_LABELS[classLevel] || classLevel;
}

export const AVAILABLE_LEVELS = [
  'Seconde',
  'Première',
  'Terminale'
];
