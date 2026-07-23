# NgxFocusEntities

Librairie permettant de générer des formulaires réactifs Angular à partir d'une représentation type `Focus4` générée avec [TopModel](https://github.com/klee-contrib/topmodel).

## Installation

Ajouter ngx-focus-entities avec la ligne de commande :

```bash
ng add ngx-focus-entities
```

## Mise à jour

```bash
ng update ngx-focus-entities
```

## Prérequis

- Angular >= 22
- @focus4/entities >= 12
- zod >= 4 < 5

## Domain

Il est possible de créer un domaine avec la méthode `domain`. Il est possible d'y définir :

- `schema` : un schéma Zod pour la validation. Ce schéma sera utilisé pour valider la valeur du champ.
- `validators` : liste des validateurs `ValidatorFn`. Ces validateurs seront ajoutés aux `FormControl` créés avec la méthode `buildForm`.
- `asyncValidators` : liste des validateurs asynchrones `AsyncValidatorFn`. Ces validateurs seront ajoutés aux `FormControl` créés avec la méthode `buildForm`.
- `htmlType` : un type d'input html, valorisable dans les balises `<input>` (par exemple, 'text', 'email', 'number', 'date', etc.).
- `inputComponent` : un composant Angular personnalisé à utiliser pour le champ de saisie.
- `loadInputComponent` : une fonction pour charger un composant de saisie de manière asynchrone.
- `displayComponent` : un composant Angular personnalisé à utiliser pour l'affichage du champ.
- `loadDisplayComponent` : une fonction pour charger un composant d'affichage de manière asynchrone.
- `signalRules` : règles de formulaire signal (`@angular/forms/signals`) additionnelles, appliquées au champ lors de la construction d'un formulaire signal avec `buildSignalForm`/`buildSchema`. Il s'agit d'un `Schema` ou d'une fonction de schéma permettant de déclarer, au niveau du domaine, des règles natives des formulaires signal (`min`, `max`, `pattern`, `validate`, `disabled`, etc.), en complément du schéma `zod`. C'est l'équivalent, pour les formulaires signal, de `validators`.

## Build Form

La méthode `buildForm(entity: MaClasseExempleEntity, valeur?: MaClasseExemple)` permet de créer des formulaires `Angular` typés, contenant les validateurs définis dans les domaines, ainsi que le validateur `required` si le champ est obligatoire.
La méthode peut prendre en 2e paramètre un objet contenant une valeur initiale du `FormGroup`, qui sera répercutée dans la création de l'objet.

## Utilisation

Si on considère le modèle suivant (généré avec [TopModel](https://github.com/klee-contrib/topmodel)):

```ts
import { entity, e } from '@focus4/entities';
import { Validators } from '@angular/forms';
import z from 'zod';
import { domain } from 'ngx-focus-entities';

const DO_ID = domain({
  schema: z.number().int().positive(),
});

const DO_LIBELLE_100 = domain({
  schema: z.string().max(100),
  validators: [Validators.maxLength(100)],
  htmlType: 'text',
});

export const ProfilDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('profil.profil.id').defaultValue(10)),
});

export const AdressDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('adress.adress.id')),
});

export const UtilisateurDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('utilisateur.utilisateur.id')),
  nom: e.field(DO_LIBELLE_100, (b) => b.label('utilisateur.utilisateur.nom').optional()),
  parents: e.recursiveList(),
  profil: e.object(ProfilDtoEntity),
  adresss: e.list(AdressDtoEntity),
});
```

Alors il est possible d'utiliser la fonction `buildForm`, qui renverra des objets `FormGroup` Angular typés et peuplés correctement :

```ts
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { buildForm } from 'ngx-focus-entities';

type UtilisateurFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  nom: FormControl<string | undefined>;
  parents: FormArray<UtilisateurFormGroup>;
  adresss: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profil: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

// Créer un formulaire vide
const form: UtilisateurFormGroup = buildForm(UtilisateurDtoEntity);

// Créer un formulaire avec des valeurs initiales
const formWithValues: UtilisateurFormGroup = buildForm(UtilisateurDtoEntity, {
  id: 1,
  nom: 'Jean Dupont',
  parents: [],
  adresss: [{ id: 1 }],
  profil: { id: 10 },
});
```

## Formulaires signal (Signal Forms)

En plus des `FormGroup`/`FormArray` réactifs produits par `buildForm`, la librairie permet
d'instancier des [formulaires signal Angular](https://angular.dev/guide/forms/signals)
(`@angular/forms/signals`) à partir des mêmes entités et domaines Focus4.

Trois utilitaires sont fournis :

- `buildModel(entity, value?)` : construit l'objet de données brut (le « modèle ») à partir d'une
  entité, en appliquant les valeurs par défaut des domaines. Toutes les clés sont présentes et aucun
  champ n'est `undefined` (un champ vide vaut `null`), ce qui est nécessaire pour que le `FieldTree`
  expose tous les sous-champs.
- `buildSchema(entity)` : construit un `Schema` de formulaire signal à partir d'une entité. Pour
  chaque champ, il applique le validateur `required` (si le champ est obligatoire), la validation du
  schéma `zod` du domaine, et les `signalRules` éventuelles du domaine. Les objets imbriqués, listes
  et listes récursives sont gérés récursivement (via `apply`/`applyEach`).
- `buildSignalForm(entity, value?, options?)` : combine `buildModel` et `buildSchema` en un seul
  appel à `form`, et retourne un `FieldTree`. Doit être appelée dans un contexte d'injection, ou en
  fournissant un `injector` via les `options`.

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { buildModel, buildSchema, buildSignalForm } from 'ngx-focus-entities';
import { UtilisateurDtoEntity } from './utilisateur';

@Component({
  /* ... */
})
export class UtilisateurComponent {
  // En une ligne : construit le modèle, le schéma et le formulaire.
  protected readonly utilisateurForm = buildSignalForm(UtilisateurDtoEntity, {
    id: 1,
    nom: 'Jean Dupont',
    adresss: [{ id: 1 }],
    profil: { id: 10 },
  });

  // Ou en gérant soi-même le signal du modèle :
  private readonly model = signal(buildModel(UtilisateurDtoEntity, { id: 1 }));
  protected readonly autreForm = form(this.model, buildSchema(UtilisateurDtoEntity));
}
```

```html
<input [control]="utilisateurForm.nom" />
@if (utilisateurForm.nom().invalid()) {
  <span>{{ utilisateurForm.nom().errors()[0].message }}</span>
}
```

## Fonctionnalités

- Génération automatique de formulaires Angular réactifs (`FormGroup`) **et** de formulaires signal (`FieldTree`) à partir d'entités Focus4
- Support des schémas Zod pour la validation
- Support des composants personnalisés (composants de saisie et d'affichage)
- Types TypeScript complets avec inférence automatique
- Support des objets imbriqués, listes et listes récursives
- Validation des champs obligatoires
- Validateurs synchrones et asynchrones (formulaires réactifs) et règles natives des formulaires signal
- Compatible avec Angular 22
