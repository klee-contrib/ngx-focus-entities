import { Rule } from '@angular-devkit/schematics';
import { addDependency } from '@schematics/angular/utility';
import { Schema } from './schema';
export function ngAdd(_options: Schema): Rule[] {
  return [
    addDependency('ngx-focus-entities', require('../../package.json').version),
    addDependency('zod', '^4'),
    addDependency('@focus4/entities', '^12'),
  ];
}
