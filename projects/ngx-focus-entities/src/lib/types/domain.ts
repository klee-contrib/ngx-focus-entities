import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { DomainType } from './entity';

/**
 * Définition d'un domaine.
 * Cette interface décrit la structure d'un domaine, qui peut être utilisé pour définir
 * les propriétés et comportements d'un champ dans un formulaire.
 */
export interface Domain<
  DT extends 'boolean' | 'number' | 'object' | 'string' = any
> {
  /**
   * Type HTML du champ.
   * Ce champ spécifie le type d'élément HTML à utiliser pour le champ du formulaire.
   * Par exemple, 'text' pour un champ de texte, 'email' pour un champ d'email, etc.
   */
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

  /**
   * Formateur pour l'affichage du champ en consultation.
   * Cette fonction est utilisée pour formater la valeur du champ lorsqu'elle est affichée en mode consultation.
   * Elle prend la valeur du champ et retourne une chaîne de caractères formatée.
   */
  displayFormatter?: (value: DomainType<DT> | undefined) => string;

  /**
   * Type d'un champ du domaine.
   * Ce champ spécifie le type de données du champ, par exemple 'string', 'number', etc.
   * Il est utilisé pour définir le type de valeur que le champ peut contenir.
   */
  type: DT;

  /**
   * Validateurs synchrones pour le champ.
   * Un tableau de fonctions de validation qui sont exécutées de manière synchrone pour valider la valeur du champ.
   */
  validators?: ValidatorFn[];

  /**
   * Validateurs asynchrones pour le champ.
   * Un tableau de fonctions de validation qui sont exécutées de manière asynchrone pour valider la valeur du champ.
   */
  asyncValidators?: AsyncValidatorFn[];

  /**
   * Composant personnalisé pour le champ.
   * Ce champ permet de spécifier un composant Angular personnalisé à utiliser pour le champ du formulaire.
   */
  component?: any;

  /**
   * Fonction pour charger un composant de manière asynchrone.
   * Cette fonction retourne une promesse qui résout en un composant Angular.
   * Elle est utilisée pour charger des composants de manière dynamique.
   */
  loadComponent?: () => Promise<any>;
}
