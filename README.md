# causality-error

Go-like `errors.Is` utility for JavaScript/TypeScript.

## Installation

```bash
# npm
npm install causality-error

# yarn
yarn add causality-error

# pnpm
pnpm add causality-error
```

## Usage

```typescript
import { is } from 'causality-error';

// Example 1: Check if an error is an instance of a specific constructor
try {
  JSON.parse('invalid json');
} catch (err) {
  if (is(err, SyntaxError)) {
    console.log('Caught a SyntaxError');
  }
}

// Example 2: Check for a specific error instance
const specificError = new Error('specific error');
const wrappedError = new Error('wrapper', { cause: specificError });

if (is(wrappedError, specificError)) {
  console.log('Found the specific error in the cause chain');
}

// Example 3: Check using a predicate function
const fsError = Object.assign(new Error('file not found'), { code: 'ENOENT' });
const wrappedFsError = new Error('operation failed', { cause: fsError });

if (is(wrappedFsError, e => (e as any).code === 'ENOENT')) {
  console.log('Found a file not found error');
}

// Example 4: Works with AggregateError
const aggregateError = new AggregateError(
  [new TypeError('bad type'), new RangeError('bad range')],
  'multiple errors'
);

if (is(aggregateError, RangeError)) {
  console.log('Found a RangeError in the aggregate error');
}
```

## API

### `is(err, target)`

Checks if `err` matches `target` anywhere in its cause chain.

#### Parameters

- `err: unknown` - The error to check
- `target: unknown | ErrorCtor | ErrorPredicate` - The target to match against, which can be:
  - An error instance (checks for exact match)
  - An error constructor (checks using `instanceof`)
  - A predicate function (checks using the function)

#### Returns

- `boolean` - `true` if the error matches the target, `false` otherwise

## License

MIT
