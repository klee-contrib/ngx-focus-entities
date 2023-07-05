# NgxFocusEntities

Library for generating reactive Angular forms from a `Focus4` representation generated with [TopModel](https://github.com/klee-contrib/topmodel).

## Domain

It is possible to create a domain using the `domain` method. You can define the following:

- `validators`: a list of `ValidatorFn` validators. These validators will be added to the `FormControl` created with the `buildForm` method.
- `asyncValidators`: a list of asynchronous `AsyncValidatorFn` validators. These validators will be added to the `FormControl` created with the `buildForm` method.
- `htmlType`: a `typescript` type that can be used in `<input>` tags.
- `type`: a `ts` type used for typing the domains. Possible values are `'boolean' | 'number' | 'object' | 'string'`.

## Build Form

The `buildForm(entity: MyExampleClassEntity, value?: MyExampleClass)` method allows you to create typed `Angular` forms that contain the validators defined in the domains, as well as the `required` validator if the field is mandatory. The method can take a second parameter, an object containing an initial value for the `FormGroup`, which will be reflected in the object's creation.

## Usage

If we consider the following model (generated with [TopModel](https://github.com/klee-contrib/topmodel)):

```ts
export interface UserDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
  parents: RecursiveListEntry;
  addresses: ListEntry<AddressDtoEntityType>;
  profile: ObjectEntry<ProfileDtoEntityType>;
}

export interface ProfileDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
}

export interface AddressDtoEntityType {
  id: FieldEntry2<typeof DO_ID, number>;
}

export const ProfileDtoEntity: ProfileDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: false,
    label: 'profile.profile.id',
  },
};

export const AddressDtoEntity: AddressDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: false,
    label: 'address.address.id',
  },
};

export const UserDtoEntity: UserDtoEntityType = {
  id: {
    type: 'field',
    name: 'id',
    domain: DO_ID,
    isRequired: true,
    label: 'user.user.id',
  },
  parents: {
    type: 'recursive-list',
  },
  profile: {
    type: 'object',
    entity: ProfileDtoEntity,
  },
  addresses: {
    type: 'list',
    entity: AddressDtoEntity,
  },
};
```

with the domain

```ts
const DO_ID = domain({
  htmlType: 'number',
  type: 'number',
});
```

Then it is possible to use the `buildForm` function, which will return correctly typed and populated Angular `FormGroup` objects:

```ts
type UserFormGroup = FormGroup<{
  id: FormControl<number | undefined>;
  parents: FormArray<UserFormGroup>;
  addresses: FormArray<FormGroup<{ id: FormControl<number | undefined> }>>;
  profile: FormGroup<{ id: FormControl<number | undefined> }>;
}>;

const form: UserFormGroup = buildForm(UserDtoEntity);
```
