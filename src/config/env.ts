import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the project root. In CI the values come from GitHub Actions secrets instead.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Copy .env.example to .env and fill it in (locally) or configure the repository secret (CI).',
    );
  }
  return value;
}

export const env = {
  baseUrl: process.env.BASE_URL || 'https://university.engenious.io',
  /** Credentials are read lazily so the config can load even without them, for example with `--list`. */
  get userEmail(): string {
    return required('USER_EMAIL');
  },
  get userPassword(): string {
    return required('USER_PASSWORD');
  },
};
