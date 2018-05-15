import sanitize from './index';

describe('sanitize', () => {
  it('is a function', () => {
    expect(typeof sanitize).toBe('function');
  });

  describe('when used without any opts', () => {
    const obj = {
      property1: 'value1',
      property2: {
        withEmail: 'hello@example.com',
      },
    };

    it('returns object without changes', () => {
      const sanitized = sanitize(obj);
      expect(sanitized).toEqual({
        property1: 'value1',
        property2: {
          withEmail: 'hello@example.com',
        },
      });
    });
  });

  describe('when using keys option', () => {
    const obj = {
      property1: 'value1',
      password: 'p4ssw0rd',
      email: 'hello@example.com',
    };
    let sanitized;
    beforeAll(() => {
      sanitized = sanitize(obj, {
        keys: ['password', 'email'],
      });
    });

    it('replaces the values for those keys with [redacted]', () => {
      expect(sanitized).toEqual({
        property1: 'value1',
        password: '[redacted]',
        email: '[redacted]',
      });
    });

    it('does not mutate the input obj', () => {
      expect(sanitized).not.toEqual(obj);
      expect(obj.password).toEqual('p4ssw0rd');
    });
  });

  describe('when using deeply nested object', () => {
    const obj = {
      property1: 'value1',
      password: 'p4ssw0rd',
      email: 'hello@example.com',
      deep: {
        nested: {
          array: [
            {
              email: 'hello@example.com',
              password: 'p4ssw0rd',
              values: ['value1'],
            },
          ],
        },
      },
    };
    let sanitized;
    beforeAll(() => {
      sanitized = sanitize(obj, {
        keys: ['password', 'email'],
      });
    });

    it('allows us to mask strings & keys keys', () => {
      expect(sanitized).toEqual({
        property1: 'value1',
        password: '[redacted]',
        email: '[redacted]',
        deep: {
          nested: {
            array: [
              {
                password: '[redacted]',
                email: '[redacted]',
                values: ['value1'],
              },
            ],
          },
        },
      });
    });
  });

  describe('when using regex option', () => {
    it('it can use regex to replace values', () => {
      expect(
        sanitize(
          {
            property1: 'value1',
            password: 'p4ssw0rd',
            email: 'hello@example.com',
          },
          {
            regex: [/^email$/i, /^password$/i],
          },
        ),
      ).toEqual({
        property1: 'value1',
        password: '[redacted]',
        email: '[redacted]',
      });
    });

    it('it can use regex to replace deeply', () => {
      expect(
        sanitize(
          {
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
              headers: {
                Authorization: 'hello',
              },
            },
          },
          {
            regex: [
              //
              /(^|\.)password$/i,
              /(^|\.)email$/i,
              /(^|\.)headers\.authorization$/i,
            ],
          },
        ),
      ).toEqual({
        property1: 'value1',
        password: '[redacted]',
        email: '[redacted]',
        deep: {
          nested: {
            array: [
              {
                email: '[redacted]',
                pAssword: '[redacted]',
                values: ['value1'],
              },
            ],
          },
          headers: {
            Authorization: '[redacted]',
          },
        },
      });
    });
  });

  describe('when having an object with circular reference', () => {
    const arrRef = [
      'circle',
      {
        password: 'p4ssw0rd',
      },
    ];
    const circularArray = [];
    circularArray.push({
      password: 'p4ssw0rd',
    });
    circularArray.push(circularArray);
    const obj: any = {
      password: 'p4ssw0rd',
      arrRef,
      arrRefDuplicate: arrRef,
      circularArray,
    };
    obj.circular = obj;

    it('does not crash', () => {
      sanitize(obj, {
        keys: ['password'],
      });
    });

    it('builds a new circular object', () => {
      const res = sanitize(obj, {
        keys: ['password'],
      });

      expect(res).toBe(res.circular);

      expect(res.arrRef).toEqual(['circle', { password: '[redacted]' }]);
      expect(res.arrRef).toBe(res.arrRefDuplicate);

      expect(res.circularArray).toBe(res.circularArray[1]);
    });
  });
});
