import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  Entity,
  FieldEntry,
  ListEntry,
  ObjectEntry,
  RecursiveListEntry,
} from '@focus4/entities';
import './domain';
/**
 * @description Transforme une entité en formulaire Angular.
 * Cette fonction de type générique transforme une structure d'entité en un formulaire Angular
 * en utilisant les classes FormGroup, FormControl, et FormArray d'Angular.
 */
export type EntityToForm<E extends Entity> = FormGroup<{
  /**
   * Pour chaque propriété P de l'entité E, détermine le type de contrôle de formulaire approprié.
   * - Si la propriété est de type FieldEntry, crée un FormControl avec le type de données FT.
   * - Si la propriété est de type ObjectEntry, récursivement transforme l'objet imbriqué en un FormGroup.
   * - Si la propriété est de type ListEntry, crée un FormArray de formulaires pour chaque élément de la liste.
   * - Si la propriété est de type RecursiveListEntry, crée un FormArray de formulaires pour l'entité elle-même.
   * - Si la propriété ne correspond à aucun des types ci-dessus, utilise 'never' pour indiquer une incompatibilité.
   */
  -readonly [P in keyof E]: E[P] extends FieldEntry
    ? FormControl<E[P]['fieldType'] | undefined> // Crée un FormControl pour les champs simples
    : E[P] extends ObjectEntry<infer OE extends Entity>
    ? EntityToForm<OE> // Récursivement transforme les objets imbriqués
    : E[P] extends ListEntry<infer LE extends Entity>
    ? FormArray<EntityToForm<LE>> // Crée un FormArray pour les listes d'éléments
    : E[P] extends RecursiveListEntry
    ? FormArray<EntityToForm<E>> // Crée un FormArray pour les listes récursives
    : never; // Indique une incompatibilité si le type n'est pas reconnu
}>;
