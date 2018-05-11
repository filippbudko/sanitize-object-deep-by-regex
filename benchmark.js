const { Suite } = require('benchmark');
const suite = new Suite();

const alt = require('./dist/alt').default;
const index = require('./dist/index').default;

const input = {
  property1: 'value1',
  password: 'p4ssw0rd',
  email: 'hello@example.com',
  deep: {
    nested: {
      array: [
        {
          email: 'hello@example.com',
          pAssword: 'p4ssw0rd',
          values: ['value1'],
        },
      ],
    },
    password: 'p4ssw0rd',
    headers: {
      Authorization: 'hello',
    },
  },
};
const keys = ['password'];
const regex = [
  /(^|\.)password$/i,
  /(^|\.)email$/i,
  /(^|\.)headers\.authorization$/i,
];

// add tests
suite
  .add('index', () => {
    index(input, { keys, regex });
  })
  .add('alt', () => {
    alt(input, { keys, regex });
  })
  // add listeners
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ async: true });

// logs:
// => RegExp#test x 4,161,532 +-0.99% (59 cycles)
// => String#indexOf x 6,139,623 +-1.00% (131 cycles)
// => Fastest is String#indexOf
