import { Domain } from './types/domain';

/**
 * Fonction générique pour créer ou modifier un domaine.
 * Cette fonction prend un objet `domain` et retourne un nouvel objet `Domain` avec un type de données spécifié.
 *
 * @param domain - L'objet domaine à partir duquel créer ou modifier le domaine.
 * @returns Un nouvel objet `Domain` avec le type de données spécifié et un type HTML par défaut défini sur 'text'.
 */
export function domain<
  DT extends 'boolean' | 'number' | 'object' | 'string' = any
>(domain: Domain): Domain<DT> {
  return {
    /**
     * Définit le type HTML par défaut pour le champ du domaine.
     * Ici, le type HTML est défini sur 'text', ce qui signifie que le champ sera un champ de texte par défaut.
     */
    htmlType: 'text',

    /**
     * Utilise l'opérateur de décomposition (spread operator) pour inclure toutes les propriétés de l'objet `domain` passé en argument.
     * Cela permet de conserver toutes les propriétés existantes de l'objet `domain` tout en ajoutant ou en remplaçant le `htmlType`.
     */
    ...domain,
  };
}
