# NgxFocusEntities

Librairie permettant de générer des formulaires réactifs Angular à partir d'une représentation type `Focus4` générée avec TopModel.

## Domain

Il est mossible de créer un domaine avec la méthode `domain`. Il est possible d'y définir :

- `validators` : liste des validateurs `ValidatorFn`. Ces validateurs seront ajoutés aux `FormControl` créés avec la méthode `buildForm`
- `asyncValidators` : liste des validateurs asynchrones `AsyncValidatorFn`
Ces validateurs seront ajoutés aux `FormControl` créés avec la méthode `buildForm`
- `htmlType` : type `typescript`, valorisable dans les balises `<input>`
- `type` : type `ts`, utilisé dans le typage des domaines. Les valeurs possibles sont `'boolean' | 'number' | 'object' | 'string'`

## Build Form

La méthode `buildForm(entity: MaClasseExempleEntity, valeur?: MaClasseExemple)` permet de créer des formulaires `Angular` typés, contenant les validateurs définis dans les domaines, ainsi que le validateur `required` si le champ est obligatoire.
La méthode peut prendre en 2e paramètre un objet contenant une valeur initiale du `FormGroup`, qui sera répercutée dans la création de l'objet.

## Utilisation

Si on considère le modèle suivant (généré avec [TopModel](https://github.com/klee-contrib/topmodel)):

```ts
export interface UtilisateurDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
  parents: RecursiveListEntry;
  adresss: ListEntry<AdressDtoEntityType>;
  profil: ObjectEntry<ProfilDtoEntityType>;
}

export interface ProfilDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
}

export interface AdressDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
}


export const ProfilDtoEntity: ProfilDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: false,
    label: 'profil.profil.id',
  },
};

export const AdressDtoEntity: AdressDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: false,
    label: 'adress.adress.id',
  },
};

export const UtilisateurDtoEntity: UtilisateurDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: true,
    label: 'utilisateur.utilisateur.id',
  },
  parents: {
    type: 'recursive-list',
  },
  profil: {
    type: 'object',
    entity: ProfilDtoEntity,
  },
  adresss: {
    type: 'list',
    entity: AdressDtoEntity,
  },
};
```

avec le domaine

```ts
const DO_ID = domain({
  htmlType: 'number',
  type: 'number',
});
```

Alors il est possible d'utiliser la fonction `buildForm`, qui renverra des objets `FormGroup` Angular typés et peuplés correctement :

```ts
type UtilisateurFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  parents: FormArray<UtilisateurFormGroup>;
  adresss: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profil: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

const form:UtilisateurFormGroup = buildForm(UtilisateurDtoEntity);
```
