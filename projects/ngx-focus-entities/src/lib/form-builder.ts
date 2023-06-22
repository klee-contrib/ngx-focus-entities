import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EntityToForm, EntityToType } from './types/entity';

/**
 * Construit un noeud à partir d'une entité, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildForm<E>(
  entity: E,
  value?: EntityToType<E>
): EntityToForm<E>;
export function buildForm<E>(
  entity: [E],
  value?: EntityToType<E>[]
): EntityToForm<E>;
export function buildForm<E>(
  entity: E | E[],
  value?: EntityToType<E> | EntityToType<E>[]
): EntityToForm<E> {
  // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
  if (Array.isArray(entity) || Array.isArray(value)) {
    return new FormArray(
      ((value as EntityToType<E>[]) ?? []).map((v) =>
        buildForm((entity as E[])[0], v)
      )
    ) as any;
  }
  // Cas d'un noeud simple : On parcourt tous les champs de l'entité.

  const formMap: any = {};
  for (const key in entity) {
    const field = entity[key] as any;
    let abstractControl;
    switch (field.type) {
      case 'list':
        abstractControl = new FormArray(
          ((value?.[key] as any) ?? []).map((v: any) =>
            buildForm(field.entity, v)
          )
        );
        break;
      case 'recursive-list':
        abstractControl = new FormArray(
          ((value && (value[key] as any)) ?? []).map((v: any) =>
            buildForm(entity, v)
          )
        );
        break;
      case 'object':
        abstractControl = buildForm(field.entity, value?.[key]);
        break;
      default:
        abstractControl = new FormControl(value?.[key], {
          validators: field.domain.validators,
          asyncValidators: field.domain.asyncValidators,
          nonNullable: field.isRequired,
        });
    }
    formMap[key] = abstractControl;
  }
  // Ajout des propriétés de l'entité, pour y accéder directement dans les services sans utiliser le get()
  return new FormGroup(formMap);
}
