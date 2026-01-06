import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { output, ZodType } from 'zod';
/**
 * Définition d'un domaine.
 * Cette interface décrit la structure d'un domaine, qui peut être utilisé pour définir
 * les propriétés et comportements d'un champ dans un formulaire.
 */
declare global {
  interface Domain<S extends ZodType> {
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
     * Type d'un champ du domaine.
     * Ce champ spécifie le type de données du champ, par exemple 'string', 'number', etc.
     * Il est utilisé pour définir le type de valeur que le champ peut contenir.
     */
    schema: S;

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
    inputComponent?: new () => any;

    /**
     * Fonction pour charger un composant de manière asynchrone.
     * Cette fonction retourne une promesse qui résout en un composant Angular.
     * Elle est utilisée pour charger le composant d'input de manière dynamique.
     */
    loadInputComponent?: () => Promise<new () => any>;

    /**
     * Composant personnalisé pour le champ.
     * Ce champ permet de spécifier un composant Angular personnalisé à utiliser pour le champ du formulaire.
     */
    displayComponent?: new () => any;

    /**
     * Fonction pour charger un composant de manière asynchrone.
     * Cette fonction retourne une promesse qui résout en un composant Angular.
     * Elle est utilisée pour charger le composant d'affichage de manière dynamique.
     */
    loadDisplayComponent?: () => Promise<new () => any>;
  }
}
