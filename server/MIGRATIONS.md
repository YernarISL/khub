# Sequelize migrations workflow

This project uses Sequelize CLI migrations for schema changes.

## Current setup

- Config file: `config/config.js`
- Migrations folder: `migrations`
- Baseline migration: `migrations/20260416000100-baseline-schema.js`
- Runtime schema auto-alter is disabled in `index.js`

## Commands

Run from `server` folder:

- `npm run migrate` - apply new migrations
- `npm run migrate:undo` - rollback last migration
- `npm run migrate:status` - show migration state
- `npm run migrate:create -- <migration-name>` - generate an empty migration file name

## Development flow

1. Update Sequelize models in `models/models.js`.
2. Create a migration file in `migrations`.
3. Implement `up` and `down` in the migration.
4. Run `npm run migrate`.
5. Verify schema in PostgreSQL.
6. If needed, rollback with `npm run migrate:undo`.

## Example: add a nullable column

```js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('materials', 'sourceUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('materials', 'sourceUrl');
  },
};
```

## Notes for PostgreSQL ENUM changes

- Prefer additive enum changes.
- Avoid destructive enum changes in hot paths.
- For complex enum refactors, create explicit SQL steps and test rollback path.
