import { Domain } from './domain';

/**
 * Métadonnées d'une entrée de type "field" pour une entité.
 * Cette interface décrit les propriétés et comportements d'un champ de type "field" dans une entité.
 */
export interface FieldEntry<
  DT extends 'boolean' | 'number' | 'object' | 'string' = any,
  T extends DomainType<DT> = DomainType<DT>
> {
  /**
   * Indique que le type de l'entrée est "field".
   */
  readonly type: 'field';

  /**
   * Type du champ, s'il est plus précis que celui du domaine.
   * Permet de spécifier un type plus précis pour le champ si nécessaire.
   */
  readonly fieldType?: T;

  /**
   * Domaine du champ.
   * Définit les propriétés et comportements du champ, comme les validateurs et le type HTML.
   */
  readonly domain: Domain<DT>;

  /**
   * Indique si le champ est obligatoire.
   */
  readonly isRequired: boolean;

  /**
   * Nom de l'entrée.
   * Utilisé pour identifier le champ dans le code.
   */
  readonly name: string;

  /**
   * Libellé de l'entrée.
   * Texte affiché à l'utilisateur pour décrire le champ.
   */
  readonly label: string;

  /**
   * Commentaire de l'entrée.
   * Fournit des informations supplémentaires sur le champ, utilisé pour la documentation ou l'affichage.
   */
  readonly comment?: string;

  /**
   * Valeur par défaut du champ dans un formulaire.
   * Définit la valeur initiale du champ lorsqu'il est affiché dans un formulaire.
   */
  readonly defaultValue?: T;
}

/**
 * Alias de type pour FieldEntry avec un domaine spécifique.
 * Simplifie la définition de champs avec un domaine connu.
 */
export type FieldEntry2<
  D extends Domain,
  T extends DomainType<D['type']> = DomainType<D['type']>
> = FieldEntry<D['type'], T>;

/**
 * Récupère le type primitif d'un champ associé à un type défini dans un domaine.
 * Cette fonction de type mappe les types de domaine ('string', 'number', etc.) à leurs types primitifs correspondants.
 */
export type DomainType<DT> =
  DT extends 'string' ? string :
  DT extends 'number' ? number :
  DT extends 'boolean' ? boolean :
  any;

/**
 * Type effectif d'un champ.
 * Extrait le type de valeur d'un champ à partir de ses métadonnées.
 */
export type FieldEntryType<F extends FieldEntry> =
  F extends FieldEntry<infer _, infer T> ? T : never;

/**
 * Métadonnées d'une entrée de type "object" pour une entité.
 * Cette interface décrit les propriétés d'un champ de type "object" dans une entité.
 */
export interface ObjectEntry<E = any> {
  /**
   * Indique que le type de l'entrée est "object".
   */
  readonly type: 'object';

  /**
   * Entité de l'entrée.
   * Définit la structure de l'objet imbriqué.
   */
  readonly entity: E;
}

/**
 * Métadonnées d'une entrée de type "list" pour une entité.
 * Cette interface décrit les propriétés d'un champ de type "list" dans une entité.
 */
export interface ListEntry<E = any> {
  /**
   * Indique que le type de l'entrée est "list".
   */
  readonly type: 'list';

  /**
   * Entité de l'entrée.
   * Définit la structure des éléments de la liste.
   */
  readonly entity: E;
}

/**
 * Métadonnées d'une entrée de type "recursive-list" pour une entité.
 * Cette interface décrit les propriétés d'un champ de type "recursive-list" dans une entité.
 */
export interface RecursiveListEntry {
  /**
   * Indique que le type de l'entrée est "recursive-list".
   */
  readonly type: 'recursive-list';
}

/**
 * Génère le type associé à une entité, avec toutes ses propriétés en optionnel.
 * Cette fonction de type transforme une entité en un type où toutes les propriétés sont optionnelles,
 * en tenant compte des types de champs (field, object, list, recursive-list).
 */
export type EntityToType<E> = {
  -readonly [P in keyof E]?:
    E[P] extends FieldEntry ? FieldEntryType<E[P]> :
    E[P] extends ObjectEntry<infer OE> ? EntityToType<OE> :
    E[P] extends ListEntry<infer LE> ? EntityToType<LE>[] :
    E[P] extends RecursiveListEntry ? EntityToType<E>[] :
    never;
};

/**
 * Définition de champ dans un store.
 * Cette interface décrit un champ stocké dans un magasin de données, avec ses métadonnées et sa valeur.
 */
export interface EntityField<F extends FieldEntry = FieldEntry> {
  /**
   * Métadonnées du champ.
   * Contient les informations sur le champ, comme son type et ses validateurs.
   */
  readonly $field: F;

  /**
   * Valeur du champ.
   * Contient la valeur actuelle du champ, qui peut être undefined si elle n'est pas définie.
   */
  value: FieldEntryType<F> | undefined;
}
