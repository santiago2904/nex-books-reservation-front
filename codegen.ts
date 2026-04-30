import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: process.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
  documents: ['src/**/*.graphql', 'src/**/*.{ts,tsx}'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      presetConfig: { gqlTagName: 'gql', fragmentMasking: false },
    },
  },
  ignoreNoDocuments: true,
}

export default config
