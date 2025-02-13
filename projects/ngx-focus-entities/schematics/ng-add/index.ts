import { Rule } from '@angular-devkit/schematics';
import {
  addDependency
} from '@schematics/angular/utility';
import { Schema } from './schema';
export function ngAdd(_options: Schema): Rule {
  return addDependency('ngx-focus-entities', require("../../package.json").version);
}
