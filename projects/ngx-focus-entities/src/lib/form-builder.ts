import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { EntityToType } from './types/entity';
import { EntityToForm } from './types/form';

/**
 * Construit un noeud de formulaire à partir d'une entité, potentiellement de façon récursive.
 * Cette fonction transforme une structure d'entité en un formulaire Angular, en utilisant
 * FormGroup, FormArray, et FormControl pour représenter les différents types de champs.
 *
 * @param entity L'entité de base à partir de laquelle construire le formulaire.
 *               Si l'entité est une liste, elle est traitée comme un noeud de type liste.
 * @param value Valeurs optionnelles à assigner aux contrôles du formulaire.
 * @returns Un FormGroup ou FormArray représentant le formulaire construit à partir de l'entité.
 */
export function buildForm<E>(
  entity: [E],
  value?: EntityToType<E>[]
): FormArray<EntityToForm<E>>;
export function buildForm<E>(
  entity: E,
  value?: EntityToType<E>
): EntityToForm<E>;
export function buildForm<E>(
  entity: E | [E],
  value?: EntityToType<E> | EntityToType<E>[]
): EntityToForm<E> | FormArray<EntityToForm<E>> {
  // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
  if (Array.isArray(entity) || Array.isArray(value)) {
    return new FormArray(
      ((value as EntityToType<E>[]) ?? []).map((v) =>
        buildForm((entity as E[])[0], v)
      )
    );
  }

  // Cas d'un noeud simple : On parcourt tous les champs de l'entité.
  const formMap: any = {};
  for (const key in entity) {
    const field = entity[key] as any;
    let abstractControl;

    switch (field.type) {
      case 'list':
        // Si le champ est de type liste, crée un FormArray pour chaque élément de la liste.
        abstractControl = new FormArray(
          ((value?.[key] as any) ?? []).map((v: any) =>
            buildForm(field.entity, v)
          )
        );
        break;
      case 'recursive-list':
        // Si le champ est de type liste récursive, crée un FormArray pour l'entité elle-même.
        abstractControl = new FormArray(
          ((value && (value[key] as any)) ?? []).map((v: any) =>
            buildForm(entity, v)
          )
        );
        break;
      case 'object':
        // Si le champ est de type objet, construit récursivement un formulaire pour l'objet imbriqué.
        abstractControl = buildForm(field.entity, value?.[key]);
        break;
      default:
        // Pour les autres types de champs, crée un FormControl avec les validateurs appropriés.
        const validators = [...(field.domain.validators ?? [])];
        if (field.isRequired) {
          validators.push(Validators.required);
        }

        const defaultValue = value?.[key] ?? field.defaultValue;
        abstractControl = new FormControl(defaultValue, {
          validators: validators,
          asyncValidators: field.domain.asyncValidators,
          nonNullable: field.isRequired,
        });
    }

    // Ajoute le contrôle de formulaire au map du formulaire.
    formMap[key] = abstractControl;
  }

  // Retourne un FormGroup contenant tous les contrôles de formulaire construits.
  return new FormGroup(formMap);
}
