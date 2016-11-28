var keystone = require('keystone');
var transform = require('model-transform');
var Types = keystone.Field.Types;

var Admin = new keystone.List('Admin');

Admin.add({
  name: { type: String, initial: true },
  email: { type: Types.Email, initial: true },
  password: { type: Types.Password, initial: true },
});

// Provide access to Keystone
Admin.schema.virtual('canAccessKeystone').get(function() {
  return true;
});

transform.toJSON(Admin);

Admin.defaultColumns = 'hash, name, email, isAdmin';
Admin.register();
