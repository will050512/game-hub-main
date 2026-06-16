import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      setupFiles: ['src/__tests__/setup.ts'],
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, 'tests/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.spec.ts',
          '**/*.test.ts',
          '**/types/**',
        ],
      },
    },
  })
)
