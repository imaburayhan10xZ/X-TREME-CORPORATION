const obj1 = { auth: { getSession: () => 'obj1-session' }, from: function(table) { return this.name + '-' + table; }, name: 'obj1' };
const obj2 = { auth: { getSession: () => 'obj2-session' }, from: function(table) { return this.name + '-' + table; }, name: 'obj2' };

let current = obj1;
const proxy = new Proxy({}, {
  get: (target, prop) => {
    const val = current[prop];
    if (typeof val === 'function') return val.bind(current);
    return val;
  }
});

console.log(proxy.auth.getSession());
console.log(proxy.from('users'));
current = obj2;
console.log(proxy.auth.getSession());
console.log(proxy.from('users'));
