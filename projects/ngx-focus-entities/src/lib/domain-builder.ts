import z, { ZodType, ZodUnknown } from 'zod';

/**
 * Fonction générique pour créer ou modifier un domaine.
 * Cette fonction prend un objet `domain` et retourne un nouvel objet `Domain` avec un type de données spécifié.
 *
 * @param domain - L'objet domaine à partir duquel créer ou modifier le domaine.
 * @returns Un nouvel objet `Domain` avec le type de données spécifié et un type HTML par défaut défini sur 'text'.
 */
export function domain<
  S extends ZodType = ZodUnknown,
  InputComponent = any,
  DisplayComponent = any,
>(
  schema: S = z.unknown() as unknown as S,
  options?: Omit<Partial<Domain<S, InputComponent, DisplayComponent>>, 'schema'>,
): Domain<S, InputComponent, DisplayComponent> {
  return {
    /**
     * Utilise l'opérateur de décomposition (spread operator) pour inclure toutes les propriétés de l'objet `domain` passé en argument.
     * Cela permet de conserver toutes les propriétés existantes de l'objet `domain` tout en ajoutant ou en remplaçant le `htmlType`.
     */
    schema,
    ...options,
  };
}
