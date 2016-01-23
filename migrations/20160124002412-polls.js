exports.up = function (r, connection) {
  return r.tableCreate('polls').run(connection);
};

exports.down = function (r, connection) {
  return r.tableDrop('polls').run(connection);
};
