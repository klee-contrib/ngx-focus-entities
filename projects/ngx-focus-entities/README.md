# NgxFocusEntities

Library for generating reactive Angular forms from a `Focus4` representation generated with [TopModel](https://github.com/klee-contrib/topmodel).

## Installation

Add ngx-focus-entities with command line :

```bash
ng add ngx-focus-entities
```

## Update

```bash
ng update ngx-focus-entities
```

## Requirements

- Angular >= 22
- @focus4/entities >= 12
- zod >= 4 < 5

## Domain

It is possible to create a domain using the `domain` method. You can define the following:

- `schema`: a Zod schema for validation. This schema will be used to validate the field value.
- `validators`: a list of `ValidatorFn` validators. These validators will be added to the `FormControl` created with the `buildForm` method.
- `asyncValidators`: a list of asynchronous `AsyncValidatorFn` validators. These validators will be added to the `FormControl` created with the `buildForm` method.
- `htmlType`: a TypeScript type that can be used in `<input>` tags (e.g., 'text', 'email', 'number', 'date', etc.).
- `inputComponent`: a custom Angular component to use for the input field.
- `loadInputComponent`: a function to load an input component asynchronously.
- `displayComponent`: a custom Angular component to use for displaying the field.
- `loadDisplayComponent`: a function to load a display component asynchronously.
- `signalRules`: additional signal form rules (`@angular/forms/signals`) applied to the field when building a signal form with `buildSignalForm`/`buildSchema`. This is a `Schema` or schema function that lets you declare native signal-form rules at the domain level (`min`, `max`, `pattern`, `validate`, `disabled`, etc.), on top of the `zod` schema. It is the signal-forms counterpart of `validators`.

## Build Form

The `buildForm(entity: MyExampleClassEntity, value?: MyExampleClass)` method allows you to create typed `Angular` forms that contain the validators defined in the domains, as well as the `required` validator if the field is mandatory. The method can take a second parameter, an object containing an initial value for the `FormGroup`, which will be reflected in the object's creation.

## Usage

If we consider the following model (generated with [TopModel](https://github.com/klee-contrib/topmodel)):

```ts
import { entity, e } from '@focus4/entities';
import { Validators } from '@angular/forms';
import z from 'zod';
import { domain } from 'ngx-focus-entities';

const DO_ID = domain({
  schema: z.number().int().positive(),
});

const DO_LABEL_100 = domain({
  schema: z.string().max(100),
  validators: [Validators.maxLength(100)],
  htmlType: 'text',
});

export const ProfileDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('profile.profile.id').defaultValue(10)),
});

export const AddressDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('address.address.id')),
});

export const UserDtoEntity = entity({
  id: e.field(DO_ID, (b) => b.label('user.user.id')),
  name: e.field(DO_LABEL_100, (b) => b.label('user.user.name').optional()),
  parents: e.recursiveList(),
  profile: e.object(ProfileDtoEntity),
  addresses: e.list(AddressDtoEntity),
});
```

Then it is possible to use the `buildForm` function, which will return correctly typed and populated Angular `FormGroup` objects:

```ts
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { buildForm } from 'ngx-focus-entities';

type UserFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  name: FormControl<string | undefined>;
  parents: FormArray<UserFormGroup>;
  addresses: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profile: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

// Create an empty form
const form: UserFormGroup = buildForm(UserDtoEntity);

// Create a form with initial values
const formWithValues: UserFormGroup = buildForm(UserDtoEntity, {
  id: 1,
  name: 'John Doe',
  parents: [],
  addresses: [{ id: 1 }],
  profile: { id: 10 },
});
```

## Signal Forms

In addition to the reactive `FormGroup`/`FormArray` produced by `buildForm`, the library can
instantiate [Angular Signal Forms](https://angular.dev/guide/forms/signals) (`@angular/forms/signals`)
from the same Focus4 entities and domains.

Three utilities are provided:

- `buildModel(entity, value?)`: builds the raw data object (the "model") from an entity, applying the
  domains' default values. Every key is present and no field is `undefined` (an empty field is
  `null`), which is required for the `FieldTree` to expose every sub-field.
- `buildSchema(entity)`: builds a signal form `Schema` from an entity. For each field it binds the
  `required` validator (when the field is mandatory), the domain's `zod` schema validation, and the
  domain's optional `signalRules`. Nested objects, lists, and recursive lists are handled
  recursively (via `apply`/`applyEach`).
- `buildSignalForm(entity, value?, options?)`: combines `buildModel` and `buildSchema` into a single
  call to `form`, and returns a `FieldTree`. Must be called within an injection context, or provide
  an `injector` through the `options`.

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { buildModel, buildSchema, buildSignalForm } from 'ngx-focus-entities';
import { UserDtoEntity } from './user';

@Component({
  /* ... */
})
export class UserComponent {
  // One-liner: builds the model, the schema and the form.
  protected readonly userForm = buildSignalForm(UserDtoEntity, {
    id: 1,
    name: 'John Doe',
    addresses: [{ id: 1 }],
    profile: { id: 10 },
  });

  // Or bring your own writable model signal:
  private readonly model = signal(buildModel(UserDtoEntity, { id: 1 }));
  protected readonly otherForm = form(this.model, buildSchema(UserDtoEntity));
}
```

```html
<input [control]="userForm.name" />
@if (userForm.name().invalid()) {
  <span>{{ userForm.name().errors()[0].message }}</span>
}
```

## Features

- Automatic generation of reactive Angular forms (`FormGroup`) **and** signal forms (`FieldTree`) from Focus4 entities
- Zod schema validation support
- Custom component support (input and display components)
- Complete TypeScript types with automatic inference
- Support for nested objects, lists, and recursive lists
- Required field validation
- Synchronous and asynchronous validators (reactive forms) and native signal form rules
- Compatible with Angular 22
