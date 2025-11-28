# Changelog

All notable changes to this project will be documented in this file.

## [21.0.0] - 2025-11-28

### Added

- Support for Angular 21
- Migration to Vitest for testing
- Integration with `@focus4/entities` library (v12.6.0)
- Support for Zod v4.1.12

### Changed

- **BREAKING**: Migrated from custom entity types to `@focus4/entities` library
  - Removed internal entity type definitions
  - Now uses `entity` and `e` from `@focus4/entities` for entity definitions
  - Updated domain builder to work with `@focus4/entities` types
- **BREAKING**: Updated Angular peer dependencies to `^21.0.0`
- **BREAKING**: Updated `@focus4/entities` peer dependency to version `12`
- Updated build configuration for Angular 21
- Updated TypeScript configuration
- Improved test setup with Vitest

### Fixed

- Fixed schematics configuration
- Fixed path for cobertura-coverage.xml in CI/CD

### Documentation

- Updated README with new usage examples using `@focus4/entities`
- Updated French documentation (README_fr.md)
- Updated installation and usage instructions

### Technical Details

- Removed `entity.ts` file (now using `@focus4/entities`)
- Updated `domain-builder.ts` to work with new entity structure
- Updated `form-builder.ts` to handle new entity types
- Refactored type definitions in `types/domain.ts` and `types/form.ts`
- Updated CI/CD workflow configuration
