import { ValidatorFn, AsyncValidatorFn } from "@angular/forms";
import { DomainType } from "./entity";

/** Définition d'un domaine. */
export interface Domain<
  DT extends 'boolean' | 'number' | 'object' | 'string' = any
> {
  htmlType?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
  /** Formatteur pour l'affichage du champ en consulation. */
  displayFormatter?: (value: DomainType<DT> | undefined) => string;
  /** Type d'un champ du domaine. */
  type: DT;
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
}

