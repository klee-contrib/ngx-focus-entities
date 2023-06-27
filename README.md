# NgxFocusEntities

Librairie permettant de générer des formulaires réactifs Angular à partir d'une représentation type `Focus4` générée avec TopModel.

## Utilisation

Si on considère le modèle suivant :

```ts
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
