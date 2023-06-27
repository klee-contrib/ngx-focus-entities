
import { Domain } from './domain';


/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<
  DT extends 'boolean' | 'number' | 'object' | 'string' = any,
  T extends DomainType<DT> = DomainType<DT>
> {
  readonly type: 'field';

  /** Type du champ, s'il est plus précis que celui du domaine. */
  readonly fieldType?: T;

  /** Domaine du champ. */
  readonly domain: Domain<DT>;

  /** Champ obligatoire. */
  readonly isRequired: boolean;

  /** Nom de l'entrée. */
  readonly name: string;

  /** Libellé de l'entrée. */
  readonly label: string;

  /** Commentaire de l'entrée */
  readonly comment?: string;

  /** Valeur par défaut du champ dans un formulaire. */
  readonly defaultValue?: T;
}

export type FieldEntry2<
  D extends Domain,
  T extends DomainType<D['type']> = DomainType<D['type']>
> = FieldEntry<D['type'], T>;

/** Récupère le type primitif d'un champ associé à un type défini dans un domaine. */
export type DomainType<DT> = DT extends 'string'
  ? string
  : DT extends 'number'
  ? number
  : DT extends 'boolean'
  ? boolean
  : any;

/** Type effectif d'un champ. */
export type FieldEntryType<F extends FieldEntry> = F extends FieldEntry<
  infer _,
  infer T
>
  ? T
  : never;

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<E = any> {
  readonly type: 'object';

  /** Entité de l'entrée */
  readonly entity: E;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<E = any> {
  readonly type: 'list';

  /** Entité de l'entrée */
  readonly entity: E;
}

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface RecursiveListEntry {
  readonly type: 'recursive-list';
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<E> = {
  -readonly [P in keyof E]?: E[P] extends FieldEntry
    ? FieldEntryType<E[P]>
    : E[P] extends ObjectEntry<infer OE>
    ? EntityToType<OE>
    : E[P] extends ListEntry<infer LE>
    ? EntityToType<LE>[]
    : E[P] extends RecursiveListEntry
    ? EntityToType<E>[]
    : never;
};

/** Définition de champ dans un store. */
export interface EntityField<F extends FieldEntry = FieldEntry> {
  /** Métadonnées. */
  readonly $field: F;

  /** Valeur. */
  value: FieldEntryType<F> | undefined;
}
