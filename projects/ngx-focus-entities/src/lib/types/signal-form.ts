import { FieldTree } from '@angular/forms/signals';
import { Entity, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry } from '@focus4/entities';
import './domain';
import { ZodType } from 'zod';

/**
 * @description Transforme une entité en type de données ("modèle") d'un formulaire signal.
 * Contrairement à `EntityToType` (issu de `@focus4/entities`, dont toutes les propriétés sont
 * optionnelles), toutes les clés sont ici présentes et non `undefined` : un champ simple vide vaut
 * `null`. C'est la forme produite par `buildModel` et attendue par la fonction `form`. Cette
 * garantie est nécessaire pour que l'arbre de champs (`FieldTree`) expose tous les sous-champs :
 * un champ dont la valeur est `undefined` n'est en effet pas matérialisé dans le `FieldTree`.
 */
export type EntityToModel<E extends Entity> = {
  -readonly [P in keyof E]: E[P] extends FieldEntry<Domain<ZodType<string>>>
    ? NonNullable<E[P]['fieldType']>
    : E[P] extends FieldEntry
      ? NonNullable<E[P]['fieldType']> | null // Champ simple : valeur, ou `null` lorsqu'elle est vide.
      : E[P] extends ObjectEntry<infer OE extends Entity>
        ? EntityToModel<OE> // Objet imbriqué.
        : E[P] extends ListEntry<infer LE extends Entity>
          ? EntityToModel<LE>[] // Liste d'entités.
          : E[P] extends RecursiveListEntry
            ? EntityToModel<E>[] // Liste récursive.
            : never;
};

/**
 * @description Transforme une entité en formulaire réactif signal (`@angular/forms/signals`).
 * Le type de formulaire signal est le `FieldTree` du modèle associé à l'entité : l'arbre de champs
 * (`FieldTree`) reflète la structure de l'entité.
 *
 * C'est l'équivalent, pour les formulaires signal, du type `EntityToForm` utilisé par les
 * formulaires réactifs.
 */
export type EntityToSignalForm<E extends Entity> = FieldTree<EntityToModel<E>>;
