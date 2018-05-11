import sanitise from './index';

describe('sanitise', () => {
  it('is a function', () => {
    expect(typeof sanitise).toBe('function');
  });

  describe('when used without any opts', () => {
    const obj = {
      property1: 'value1',
      property2: {
        withEmail: 'hello@example.com',
      },
    };

    it('returns object without changes', () => {
      const sanitised = sanitise(obj);
      expect(sanitised).toEqual({
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
    let sanitised;
    beforeAll(() => {
      sanitised = sanitise(obj, {
        keys: ['password', 'email'],
      });
    });

    it('replaces the values for those keys with [redacted]', () => {
      expect(sanitised).toEqual({
        property1: 'value1',
        password: '[redacted]',
        email: '[redacted]',
      });
    });

    it('does not mutate the input obj', () => {
      expect(sanitised).not.toEqual(obj);
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
    let sanitised;
    beforeAll(() => {
      sanitised = sanitise(obj, {
        keys: ['password', 'email'],
      });
    });

    it('allows us to mask strings & keys keys', () => {
      expect(sanitised).toEqual({
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
        sanitise(
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
        sanitise(
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
});
