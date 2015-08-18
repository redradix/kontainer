
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Todo', function(t){
    t.increments('id').primary();
    t.string('text', 255).notNullable();
    t.boolean('completed').notNullable().defaultTo(false);
    t.dateTime('createdAt').notNullable().defaultTo(new Date());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Todo');
};
