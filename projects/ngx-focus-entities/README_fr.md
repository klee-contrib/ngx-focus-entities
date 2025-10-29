# NgxFocusEntities

Librairie permettant de générer des formulaires réactifs Angular à partir d'une représentation type `Focus4` générée avec TopModel.

## Domain

Il est possible de créer un domaine avec la méthode `domain`. Il est possible d'y définir :

- `schema` : un schéma Zod pour la validation. Ce schéma sera utilisé pour valider la valeur du champ.
- `validators` : liste des validateurs `ValidatorFn`. Ces validateurs seront ajoutés aux `FormControl` créés avec la méthode `buildForm`
- `asyncValidators` : liste des validateurs asynchrones `AsyncValidatorFn`
Ces validateurs seront ajoutés aux `FormControl` créés avec la méthode `buildForm`
- `htmlType` : type `typescript`, valorisable dans les balises `<input>`
- `component` : un composant Angular personnalisé à utiliser pour le champ.
- `loadComponent` : une fonction pour charger un composant de manière asynchrone.

## Build Form

La méthode `buildForm(entity: MaClasseExempleEntity, valeur?: MaClasseExemple)` permet de créer des formulaires `Angular` typés, contenant les validateurs définis dans les domaines, ainsi que le validateur `required` si le champ est obligatoire.
La méthode peut prendre en 2e paramètre un objet contenant une valeur initiale du `FormGroup`, qui sera répercutée dans la création de l'objet.

## Utilisation

Si on considère le modèle suivant (généré avec [TopModel](https://github.com/klee-contrib/topmodel)):

```ts
import { entity, e } from '@focus4/entities';
import z from 'zod';
import { domain } from 'ngx-focus-entities';

const DO_ID = domain({
  schema: z.number().int().positive(),
});

const DO_LIBELLE_100 = domain({
  schema: z.string().max(100),
  validators: [Validators.maxLength(100)],
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
type UtilisateurFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  nom: FormControl<string | undefined>;
  parents: FormArray<UtilisateurFormGroup>;
  adresss: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profil: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

const form: UtilisateurFormGroup = buildForm(UtilisateurDtoEntity);
```
