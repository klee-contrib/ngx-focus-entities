import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { buildForm } from './form-builder';
const DO_ID = domain({
  htmlType: 'number',
  type: 'number',
});

const DO_LIBELLE_100 = domain({
  type: 'string',
  validators: [Validators.max(100)],
});

import {
  EntityToType,
  FieldEntry2,
  ListEntry,
  ObjectEntry,
  RecursiveListEntry,
} from './types/entity';
import { domain } from './domain-builder';

export const ProfilDtoEntity: ProfilDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: false,
    label: 'profil.profil.id',
    defaultValue: 10,
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
  nom: {
    type: 'field',
    name: 'nom',
    domain: DO_LIBELLE_100,
    isRequired: false,
    label: 'utilisateur.utilisateur.nom',
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

export interface UtilisateurDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
  nom: FieldEntry2<typeof DO_LIBELLE_100, string>;
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

type UtilisateurFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  nom: FormControl<string | undefined>;
  parents: FormArray<UtilisateurFormGroup>;
  adresss: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profil: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

describe('TopModel Form Builder no value', () => {
  const form: UtilisateurFormGroup = buildForm(UtilisateurDtoEntity);
  it('should be created', () => {
    expect(form).toBeDefined();
  });
  it('Simple FormControl number', () => {
    expect(form.controls.id).toBeDefined();
  });
  it('Simple FormControl string', () => {
    expect(form.controls.nom).toBeDefined();
  });
  it('Nested FormControl', () => {
    expect(form.controls.profil?.controls.id).toBeDefined();
  });
  it('Nested FormControl default value', () => {
    expect(form.controls.profil?.controls.id.value).toBe(10);
  });
  it('Simple FormArray', () => {
    expect(form.controls.adresss?.controls).toBeInstanceOf(Array);
  });
  it('Recursive FormArray', () => {
    expect(form.controls.parents?.controls).toBeInstanceOf(Array);
  });
});

describe('TopModel Form Builder validator', () => {
  const form: UtilisateurFormGroup = buildForm(UtilisateurDtoEntity);
  it('Has Required Validator', () => {
    expect(form.controls.id.hasValidator(Validators.required)).toBeTrue();
  });
  it('Has max Validator max', () => {
    expect(form.controls.nom.hasValidator(Validators.required)).toBeFalse();
    expect(
      form.controls.nom.hasValidator(DO_LIBELLE_100.validators?.[0]!)
    ).toBeTrue();
  });
});

describe('TopModel Form Builder Value', () => {
  const value: EntityToType<typeof UtilisateurDtoEntity> = {
    id: 2,
    profil: { id: 5 },
    adresss: [
      {
        id: 6,
      },
      { id: 7 },
    ],
    parents: [{ id: 1 }],
  };
  const form = buildForm(UtilisateurDtoEntity, value);
  it('should be created', () => {
    expect(form).toBeDefined();
  });
  it('Simple FormControl', () => {
    expect(form.controls.id).toBeDefined();
    expect(form.controls.id.value).toBe(2);
  });
  it('Nested FormControl', () => {
    expect(form.controls.profil?.controls.id).toBeDefined();
    expect(form.controls.profil?.controls.id.value).toBe(5);
  });
  it('Simple FormArray', () => {
    expect(form.controls.adresss?.controls).toBeInstanceOf(Array);
    expect(form.controls.adresss.controls[0].controls.id.value).toBe(6);
    expect(form.controls.adresss.controls[1].controls.id.value).toBe(7);
  });
  it('Recursive FormArray', () => {
    expect(form.controls.parents?.controls).toBeInstanceOf(Array);
    expect(form.controls.parents?.controls[0].controls.id.value).toBe(1);
  });
});
