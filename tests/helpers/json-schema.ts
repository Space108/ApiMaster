import Ajv, { type ErrorObject } from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) return 'unknown schema error';
  return errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('\n');
}

export function assertMatchesSchema(data: unknown, schema: object, label = 'body'): void {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    throw new Error(`${label} does not match JSON Schema:\n${formatErrors(validate.errors)}`);
  }
}
