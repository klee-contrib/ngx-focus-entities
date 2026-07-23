import { signal, WritableSignal } from '@angular/core';
import {
  apply,
  applyEach,
  FieldTree,
  form,
  FormOptions,
  required,
  Schema,
  schema,
  SchemaFn,
  SchemaOrSchemaFn,
  validate,
} from '@angular/forms/signals';
import { Entity, EntityToType, FieldEntry } from '@focus4/entities';
import { ZodType } from 'zod';
import './types/domain';
import { EntityToModel } from './types/signal-form';

/**
 * Construit l'objet de données initial (le "modèle") à partir d'une entité, de façon récursive.
 * Contrairement à `buildForm` qui produit des `FormControl`/`FormGroup` du module `@angular/forms`,
 * cette fonction produit une donnée brute destinée à alimenter un `WritableSignal` sur lequel repose
 * un formulaire réactif signal (`@angular/forms/signals`).
 *
 * @param entity L'entité de base à partir de laquelle construire le modèle.
 *               Si l'entité est une liste, le modèle produit est un tableau.
 * @param value Valeurs optionnelles à fusionner dans le modèle. Les valeurs par défaut des domaines
 *              sont utilisées pour les champs non renseignés.
 * @returns Un objet (ou un tableau d'objets) typé correspondant à l'entité.
 */
export function buildModel<E extends Entity>(
  entity: [E],
  value?: EntityToType<E>[],
): EntityToModel<E>[];
export function buildModel<E extends Entity>(entity: E, value?: EntityToType<E>): EntityToModel<E>;
export function buildModel<E extends Entity>(
  entity: E | [E],
  value?: EntityToType<E> | EntityToType<E>[],
): EntityToModel<E> | EntityToModel<E>[] {
  // Cas d'un noeud de type liste : on construit un tableau à partir des valeurs fournies.
  if (Array.isArray(entity) || Array.isArray(value)) {
    return ((value as EntityToType<E>[]) ?? []).map((v) => buildModel((entity as E[])[0], v));
  }

  // Cas d'un noeud simple : on parcourt tous les champs de l'entité.
  const model: any = {};
  for (const key in entity) {
    const field: any = entity[key];

    switch (field.type) {
      case 'list':
        // Liste d'entités : un tableau de modèles.
        model[key] = (((value as any)?.[key] as any[]) ?? []).map((v) =>
          buildModel(field.entity, v),
        );
        break;
      case 'recursive-list':
        // Liste récursive : un tableau de modèles de l'entité elle-même.
        model[key] = (((value as any)?.[key] as any[]) ?? []).map((v) => buildModel(entity, v));
        break;
      case 'object':
        // Objet imbriqué : on construit récursivement le modèle.
        model[key] = buildModel(field.entity, (value as any)?.[key]);
        break;
      default:
        // Champ simple : valeur fournie, sinon valeur par défaut du domaine, sinon `null`.
        // On évite `undefined` : un champ `undefined` n'est pas matérialisé dans le `FieldTree`.
        model[key] = (value as any)?.[key] ?? field.defaultValue ?? null;
    }
  }

  return model;
}

/**
 * Construit un `SchemaFn` de formulaire signal à partir d'une entité, de façon récursive.
 * Le schéma applique, sur chaque champ, les règles déduites de la définition de l'entité et de ses
 * domaines :
 * - le validateur `required` pour les champs obligatoires ;
 * - la validation du schéma `zod` du domaine (ignorée si la valeur est vide) ;
 * - les règles signal additionnelles éventuelles déclarées sur le domaine (`signalRules`).
 *
 * Le schéma retourné peut être passé directement à la fonction `form` d'`@angular/forms/signals`,
 * ou combiné avec d'autres schémas via `apply`/`applyEach`.
 *
 * @param entity L'entité à partir de laquelle construire le schéma.
 * @returns Un `SchemaFn` typé correspondant à l'entité.
 */
export function buildSchema<E extends Entity>(entity: E): Schema<EntityToModel<E>> {
  // On mémoïse le `Schema` créé afin de pouvoir le référencer lui-même pour les listes récursives.
  // Une simple `SchemaFn` auto-référencée provoquerait une récursion infinie à la compilation du
  // schéma ; un `Schema` mis en cache est réutilisé par le moteur lorsqu'il rencontre la même
  // instance, ce qui permet de gérer la récursivité.
  const cachedSchema: Schema<any> = schema<any>((path: any) => {
    for (const key in entity) {
      const field: any = entity[key];

      switch (field.type) {
        case 'list':
          // Liste d'entités : on applique le schéma de l'entité à chaque élément.
          applyEach(path[key], buildSchema(field.entity) as any);
          break;
        case 'recursive-list':
          // Liste récursive : on applique le schéma courant (instance mise en cache) à chaque élément.
          applyEach(path[key], cachedSchema as any);
          break;
        case 'object':
          // Objet imbriqué : on applique récursivement le schéma de l'entité.
          apply(path[key], buildSchema(field.entity) as any);
          break;
        default: {
          // Champ simple : validateurs déduits du domaine.
          const fieldEntry = field as FieldEntry;
          if (fieldEntry.isRequired) {
            required(path[key]);
          }
          bindDomainValidation(path[key], fieldEntry.domain);
        }
      }
    }
  });

  return cachedSchema as Schema<EntityToModel<E>>;
}

/**
 * Instancie un formulaire réactif signal (`@angular/forms/signals`) à partir d'une entité.
 * Combine `buildModel` (donnée initiale) et `buildSchema` (règles de validation) au sein d'un appel
 * à la fonction `form`. Le formulaire retourné est un `FieldTree` dont l'arbre de champs reflète la
 * structure de l'entité.
 *
 * Doit être appelée dans un contexte d'injection, ou en fournissant un `injector` via les `options`.
 *
 * @param entity L'entité à partir de laquelle instancier le formulaire.
 *               Si l'entité est une liste, le formulaire est un `FieldTree` de tableau.
 * @param value Valeurs initiales optionnelles du formulaire.
 * @param options Options de la fonction `form` (`injector`, `name`, etc.).
 * @returns Un `FieldTree` représentant le formulaire signal construit à partir de l'entité.
 */
export function buildSignalForm<E extends Entity>(
  entity: [E],
  value?: EntityToType<E>[],
  options?: FormOptions<EntityToModel<E>[]>,
): FieldTree<EntityToModel<E>[]>;
export function buildSignalForm<E extends Entity>(
  entity: E,
  value?: EntityToType<E>,
  options?: FormOptions<EntityToModel<E>>,
): FieldTree<EntityToModel<E>>;
export function buildSignalForm<E extends Entity>(
  entity: E | [E],
  value?: EntityToType<E> | EntityToType<E>[],
  options?: FormOptions<any>,
): FieldTree<EntityToModel<E>> | FieldTree<EntityToModel<E>[]> {
  // Cas d'un formulaire de type liste : le modèle est un tableau et le schéma s'applique à chaque élément.
  if (Array.isArray(entity)) {
    const model = signal(buildModel(entity as [E], value as EntityToType<E>[]));
    const itemSchema = buildSchema((entity as E[])[0]);
    const arraySchema: SchemaFn<EntityToModel<E>[]> = (path: any) =>
      applyEach(path, itemSchema as any);
    return buildFormFrom(model, arraySchema, options);
  }

  const model = signal(buildModel(entity as E, value as EntityToType<E>));
  return buildFormFrom(model, buildSchema(entity as E), options);
}

/** Appelle `form` avec ou sans options selon leur présence, pour respecter les surcharges. */
function buildFormFrom<T>(
  model: WritableSignal<T>,
  schemaOrFn: SchemaOrSchemaFn<T>,
  options?: FormOptions<T>,
): FieldTree<T> {
  return options ? form(model, schemaOrFn, options) : form(model, schemaOrFn);
}

/**
 * Applique la validation déduite d'un domaine à un chemin de champ signal.
 * - le schéma `zod` est validé lorsqu'une valeur non vide est renseignée ;
 * - les `signalRules` éventuelles du domaine sont appliquées via `apply`.
 */
function bindDomainValidation(path: any, domain: Domain<ZodType>): void {
  const schema = domain.schema;
  if (schema) {
    validate(path, (ctx: any) => {
      const value = ctx.value();
      if (!value) {
        return null;
      }
      const result = schema.safeParse(value);
      return result.success
        ? null
        : { kind: 'formatError', message: result.error.issues[0]?.message };
    });
  }

  if (domain.signalRules) {
    apply(path, domain.signalRules as any);
  }
}
