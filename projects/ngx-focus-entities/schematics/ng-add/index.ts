import { Rule } from '@angular-devkit/schematics';
import { addDependency, ExistingBehavior } from '@schematics/angular/utility';
import { Schema } from './schema';
export function ngAdd(_options: Schema): Rule {
  return (tree, context) => {
    addDependency('ngx-focus-entities', require('../../package.json').version, {
      existing: ExistingBehavior.Skip,
    })(tree, context);
    addDependency('zod', '^4', {
      existing: ExistingBehavior.Skip,
    })(tree, context);
    addDependency('@focus4/entities', '^12', {
      existing: ExistingBehavior.Skip,
    })(tree, context);
  };
}
