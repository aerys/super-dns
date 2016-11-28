var keystone = require('keystone');
var transform = require('model-transform');
var Types = keystone.Field.Types;

var DynamicDNS = new keystone.List('DynamicDNS', {
  map: {name: 'hostname'},
  singular: 'Dynamic DNS',
  plural: 'Dynamic DNS',
  defaultColumns: 'hostname, ip'
});

DynamicDNS.add({
  hostname: { type: Types.Text, required: true, initial: true },
  ip: { type: Types.Text, required: true, initial: true },
  ttl: { type: Types.Number, default: 1800 }
});

transform.toJSON(DynamicDNS);

DynamicDNS.register();
