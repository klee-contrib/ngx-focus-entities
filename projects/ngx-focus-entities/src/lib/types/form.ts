import {
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry } from './entity';
/**
 * @description Transforme une entity en formulaire angular
 * */
export type EntityToForm<E> = FormGroup<{
  -readonly [P in keyof E]: E[P] extends FieldEntry<infer DT, infer FT>
    ? FormControl<FT | undefined>
    : E[P] extends ObjectEntry<infer OE>
    ? EntityToForm<OE>
    : E[P] extends ListEntry<infer LE>
    ? FormArray<EntityToForm<LE>>
    : E[P] extends RecursiveListEntry
    ? FormArray<EntityToForm<E>>
    : never;
}>;
