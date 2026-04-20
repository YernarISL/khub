'use strict';

/**
 * Baseline migration for existing schema.
 * This migration intentionally does not change database structure.
 * It only records a starting point in SequelizeMeta.
 */
export default {
  async up() {
    return Promise.resolve();
  },

  async down() {
    return Promise.resolve();
  },
};
