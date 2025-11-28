import { describe, expect, it } from 'vitest';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { buildForm } from './form-builder';

import {
  e,
  entity,
  FieldEntry,
  ListEntry,
  ObjectEntry,
  RecursiveListEntry,
} from '@focus4/entities';
import z from 'zod';
import { domain } from './domain-builder';
const DO_ID = domain({
  schema: z.number().int().positive(),
});

const DO_LIBELLE_100 = domain({
  schema: z.string().max(100),
  validators: [Validators.max(100)],
});

export const ProfilDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('profil.profil.id').defaultValue(10)),
});

export const AdressDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('adress.adress.id')),
});

export const UtilisateurDtoEntity = entity({
  id: e.field<typeof DO_ID>(DO_ID, (b) => b.label('utilisateur.utilisateur.id')),
  nom: e.field(DO_LIBELLE_100, (b) => b.label('utilisateur.utilisateur.nom').optional()),
  parents: e.recursiveList(),
  profil: e.object(ProfilDtoEntity),
  adresss: e.list(AdressDtoEntity),
});

export interface UtilisateurDtoEntityType {
  id: FieldEntry<typeof DO_ID>;
  nom: FieldEntry<typeof DO_LIBELLE_100>;
  parents: RecursiveListEntry;
  adresss: ListEntry<AdressDtoEntityType>;
  profil: ObjectEntry<ProfilDtoEntityType>;
}

export interface ProfilDtoEntityType {
  id: FieldEntry<typeof DO_ID>;
}

export interface AdressDtoEntityType {
  id: FieldEntry<typeof DO_ID>;
}

type UtilisateurFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  nom: FormControl<string | undefined>;
  parents: FormArray<UtilisateurFormGroup>;
  adresss: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profil: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

describe('Form Group', () => {
  describe('No default value', () => {
    const form = buildForm(UtilisateurDtoEntity);
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
    it('Nested FormControl domain default value', () => {
      expect(form.controls.profil?.controls.id.value).toBe(10);
    });
    it('Simple FormArray', () => {
      expect(form.controls.adresss?.controls).toBeInstanceOf(Array);
    });
    it('Recursive FormArray', () => {
      expect(form.controls.parents?.controls).toBeInstanceOf(Array);
    });
  });

  describe('FormGroup with Value', () => {
    const value = {
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
});

describe('FormArray ', () => {
  describe('No default value', () => {
    const formArray = buildForm([UtilisateurDtoEntity]);
    it('should be created', () => {
      expect(formArray).toBeDefined();
    });
    it('Should be array', () => {
      expect(formArray.controls).toBeInstanceOf(Array);
    });
    it('Should array content be form group', () => {
      expect(formArray.controls).toBeInstanceOf(Array);
    });
  });

  describe('With default value', () => {
    const value = {
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
    const formArray = buildForm([UtilisateurDtoEntity], [value]);
    it('should be created', () => {
      expect(formArray).toBeDefined();
    });
    it('Should be array', () => {
      expect(formArray.controls).toBeInstanceOf(Array);
    });
    it('Should array content be form group', () => {
      expect(formArray.controls).toBeInstanceOf(Array);
    });

    const form = formArray.controls[0];
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
});

describe('FormGroup validator', () => {
  const form: UtilisateurFormGroup = buildForm(UtilisateurDtoEntity);
  it('Has Required Validator', () => {
    expect(form.controls.id.hasValidator(Validators.required)).toBe(true);
  });
  it('Has max Validator', () => {
    expect(form.controls.nom.hasValidator(Validators.required)).toBe(false);
    const maxValidator = DO_LIBELLE_100.validators?.[0];
    if (maxValidator) {
      expect(form.controls.nom.hasValidator(maxValidator)).toBe(true);
    }
  });
});
