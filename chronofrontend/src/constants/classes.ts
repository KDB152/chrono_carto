// Constantes partagees pour les classes
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
  'Le groupe est sature. Veuillez choisir un autre groupe par exemple.';

export function getClassLabel(classLevel?: string | null): string {
  if (!classLevel) return '';
  return LEGACY_CLASS_LABELS[classLevel] || classLevel;
}

export const AVAILABLE_LEVELS = [
  'Seconde',
  'Premiere',
  'Terminale'
];

export function isSameOrAliasClass(class1?: string | null, class2?: string | null): boolean {
  if (!class1 || !class2) return false;
  if (class1 === class2) return true;

  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const n1 = normalize(class1);
  const n2 = normalize(class2);

  if (n1 === n2) return true;

  const base1 = n1.split('(')[0].trim();
  const base2 = n2.split('(')[0].trim();

  if (base1 === base2) return true;

  const label1 = normalize(getClassLabel(class1));
  const label2 = normalize(getClassLabel(class2));

  if (label1 === label2) return true;

  const labelBase1 = label1.split('(')[0].trim();
  const labelBase2 = label2.split('(')[0].trim();

  if (labelBase1 === labelBase2) return true;

  return n1.includes(base2) || n2.includes(base1);
}
