
var fixture = [
  { text: 'Learn about DI', completed: false },
  { text: 'Tidy my application folder structure!', completed: false }
];

exports.up = function(knex, Promise) {
  return knex('Todo').insert(fixture);
};

exports.down = function(knex, Promise) {
  return knex('Todo').del();
};
