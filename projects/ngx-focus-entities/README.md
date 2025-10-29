# NgxFocusEntities

Library for generating reactive Angular forms from a `Focus4` representation generated with [TopModel](https://github.com/klee-contrib/topmodel).

Add ngx-focus-entities with command line :

```bash
ng add ngx-focus-entities
```

## Domain

It is possible to create a domain using the `domain` method. You can define the following:

- `schema`: a Zod schema for validation. This schema will be used to validate the field value.
- `validators`: a list of `ValidatorFn` validators. These validators will be added to the `FormControl` created with the `buildForm` method.
- `asyncValidators`: a list of asynchronous `AsyncValidatorFn` validators. These validators will be added to the `FormControl` created with the `buildForm` method.
- `htmlType`: a `typescript` type that can be used in `<input>` tags.
- `component`: a custom Angular component to use for the field.
- `loadComponent`: a function to load a component asynchronously.

## Build Form

The `buildForm(entity: MyExampleClassEntity, value?: MyExampleClass)` method allows you to create typed `Angular` forms that contain the validators defined in the domains, as well as the `required` validator if the field is mandatory. The method can take a second parameter, an object containing an initial value for the `FormGroup`, which will be reflected in the object's creation.

## Usage

If we consider the following model (generated with [TopModel](https://github.com/klee-contrib/topmodel)):

```ts
import { entity, e } from '@focus4/entities';
import z from 'zod';
import { domain } from 'ngx-focus-entities';

const DO_ID = domain({
  schema: z.number().int().positive(),
});

const DO_LABEL_100 = domain({
  schema: z.string().max(100),
  validators: [Validators.maxLength(100)],
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
type UserFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  name: FormControl<string | undefined>;
  parents: FormArray<UserFormGroup>;
  addresses: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profile: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

const form: UserFormGroup = buildForm(UserDtoEntity);
```
