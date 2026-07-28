import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { applyEach, form, required, schema, validate } from '@angular/forms/signals';
import { e, entity } from '@focus4/entities';
import { describe, expect, it } from 'vitest';
import z from 'zod';
import { domain } from './domain-builder';
import { buildModel, buildSchema, buildSignalForm } from './signal-form-builder';
import { EntityToModel } from './types/signal-form';

const DO_ID = domain(z.number().int().positive());

const DO_LIBELLE_100 = domain(z.string().max(100));

const ProfilDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('profil.profil.id').defaultValue(10)),
});

const AdressDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('adress.adress.id')),
});

const UtilisateurDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('utilisateur.utilisateur.id')),
  nom: e.field(DO_LIBELLE_100, (b) => b.label('utilisateur.utilisateur.nom').optional()),
  parents: e.recursiveList(),
  profil: e.object(ProfilDtoEntity),
  adresss: e.list(AdressDtoEntity),
});

describe('buildModel', () => {
  describe('No default value', () => {
    const model = buildModel(UtilisateurDtoEntity);
    it('should be created', () => {
      expect(model).toBeDefined();
    });
    it('applies domain default value on nested field', () => {
      expect(model.profil?.id).toBe(10);
    });
    it('initializes fields without default to null (never undefined)', () => {
      expect(model.id).toBeNull();
      expect(model.nom).toBe('');
    });
    it('initializes lists as empty arrays', () => {
      expect(model.adresss).toBeInstanceOf(Array);
      expect(model.adresss).toHaveLength(0);
    });
    it('initializes recursive lists as empty arrays', () => {
      expect(model.parents).toBeInstanceOf(Array);
      expect(model.parents).toHaveLength(0);
    });
  });

  describe('With value', () => {
    const model = buildModel(UtilisateurDtoEntity, {
      id: 2,
      profil: { id: 5 },
      adresss: [{ id: 6 }, { id: 7 }],
      parents: [{ id: 1 }],
    });
    it('reflects the simple field value', () => {
      expect(model.id).toBe(2);
    });
    it('reflects the nested field value', () => {
      expect(model.profil?.id).toBe(5);
    });
    it('reflects the list values', () => {
      expect(model.adresss?.[0]?.id).toBe(6);
      expect(model.adresss?.[1]?.id).toBe(7);
    });
    it('reflects the recursive list values', () => {
      expect(model.parents?.[0]?.id).toBe(1);
    });
  });

  describe('Array entity', () => {
    it('builds an array of models', () => {
      const models = buildModel([UtilisateurDtoEntity], [{ id: 2 }, { id: 3 }]);
      expect(models).toBeInstanceOf(Array);
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe(2);
      expect(models[1].profil?.id).toBe(10);
    });
  });
});

describe('buildSchema / buildSignalForm', () => {
  it('creates a field tree that mirrors the entity structure', () => {
    const f = TestBed.runInInjectionContext(() => buildSignalForm(UtilisateurDtoEntity));
    expect(f.id).toBeDefined();
    expect(f.nom).toBeDefined();
    expect(f.profil.id).toBeDefined();
    expect(f.adresss).toBeDefined();
    expect(f.parents).toBeDefined();
  });

  it('applies domain default values through the model', () => {
    const f = TestBed.runInInjectionContext(() => buildSignalForm(UtilisateurDtoEntity));
    expect(f.profil.id().value()).toBe(10);
  });

  it('reflects provided initial values', () => {
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm(UtilisateurDtoEntity, {
        id: 2,
        profil: { id: 5 },
        adresss: [{ id: 6 }],
        parents: [{ id: 1 }],
      }),
    );
    expect(f.id().value()).toBe(2);
    expect(f.profil.id().value()).toBe(5);
    expect(f.adresss[0].id().value()).toBe(6);
    expect(f.parents[0].id().value()).toBe(1);
  });

  it('marks required fields as invalid when empty', () => {
    const f = TestBed.runInInjectionContext(() => buildSignalForm(UtilisateurDtoEntity));
    const errors = f.id().errors();
    expect(errors.some((error) => error.kind === 'required')).toBe(true);
  });

  it('does not require optional fields', () => {
    const f = TestBed.runInInjectionContext(() => buildSignalForm(UtilisateurDtoEntity));
    const errors = f.nom().errors();
    expect(errors.some((error) => error.kind === 'required')).toBe(false);
  });

  it('validates the zod schema of the domain', () => {
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm(UtilisateurDtoEntity, { id: 1, nom: 'a'.repeat(101) }),
    );
    const errors = f.nom().errors();
    expect(errors.some((error) => error.kind === 'formatError')).toBe(true);
  });

  it('does not report a zod error for an empty optional value', () => {
    const f = TestBed.runInInjectionContext(() => buildSignalForm(UtilisateurDtoEntity, { id: 1 }));
    const errors = f.nom().errors();
    expect(errors.some((error) => error.kind === 'formatError')).toBe(false);
  });

  it('is usable with an externally owned model signal', () => {
    const model = signal(buildModel(UtilisateurDtoEntity, { id: 42 }));
    const f = TestBed.runInInjectionContext(() => form(model, buildSchema(UtilisateurDtoEntity)));
    expect(f.id().value()).toBe(42);

    f.id().value.set(43);
    expect(model().id).toBe(43);
  });
});

describe('buildSignalForm with a custom schema', () => {
  it('applies a custom schema function on top of the entity schema', () => {
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm(UtilisateurDtoEntity, { id: 1, nom: 'Jean' }, undefined, (p) => {
        validate(p.nom, ({ value }) =>
          value() === 'Jean' ? { kind: 'nomInterdit', message: 'Nom interdit' } : null,
        );
      }),
    );
    expect(f.nom().errors().some((error) => error.kind === 'nomInterdit')).toBe(true);
  });

  it('keeps the validators deduced from the entity', () => {
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm(UtilisateurDtoEntity, { nom: 'a'.repeat(101) }, undefined, (p) => {
        required(p.nom);
      }),
    );
    // Validateur custom.
    expect(f.nom().errors().some((error) => error.kind === 'required')).toBe(false);
    // Validateurs de l'entité toujours présents.
    expect(f.nom().errors().some((error) => error.kind === 'formatError')).toBe(true);
    expect(f.id().errors().some((error) => error.kind === 'required')).toBe(true);
  });

  it('accepts a cached schema and a cross-field validation', () => {
    const customSchema = schema<EntityToModel<typeof UtilisateurDtoEntity>>((p) => {
      validate(p.nom, ({ value, valueOf }) =>
        valueOf(p.id) === 1 && !value() ? { kind: 'nomRequis', message: 'Nom requis' } : null,
      );
    });
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm(UtilisateurDtoEntity, { id: 1 }, undefined, customSchema),
    );
    expect(f.nom().errors().some((error) => error.kind === 'nomRequis')).toBe(true);
  });

  it('works alongside the form options', () => {
    const injector = TestBed.inject(Injector);
    const f = buildSignalForm(UtilisateurDtoEntity, { id: 1 }, { injector }, (p) => {
      validate(p.id, () => ({ kind: 'idInterdit', message: 'Id interdit' }));
    });
    expect(f.id().errors().some((error) => error.kind === 'idInterdit')).toBe(true);
  });
});

describe('buildSignalForm with array entity', () => {
  it('builds a field tree of an array', () => {
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm([UtilisateurDtoEntity], [{ id: 2 }, { id: 3 }]),
    );
    expect(f().value()).toHaveLength(2);
    expect(f[0].id().value()).toBe(2);
    expect(f[1].id().value()).toBe(3);
  });

  it('applies a custom schema at the root of the array', () => {
    const f = TestBed.runInInjectionContext(() =>
      buildSignalForm([UtilisateurDtoEntity], [{ id: 2 }], undefined, (p) => {
        validate(p, ({ value }) =>
          value().length < 2 ? { kind: 'tropPeuDElements', message: 'Au moins 2 éléments' } : null,
        );
        applyEach(p, (item) => {
          validate(item.nom, () => ({ kind: 'nomInterdit', message: 'Nom interdit' }));
        });
      }),
    );
    expect(f().errors().some((error) => error.kind === 'tropPeuDElements')).toBe(true);
    expect(f[0].nom().errors().some((error) => error.kind === 'nomInterdit')).toBe(true);
    // Validateurs de l'entité toujours présents sur chaque élément.
    expect(f[0].id().errors().some((error) => error.kind === 'required')).toBe(false);
  });
});
