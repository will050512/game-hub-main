import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const evidenceDir = join(process.cwd(), '.sisyphus', 'evidence')

if (!existsSync(evidenceDir)) {
  mkdirSync(evidenceDir, { recursive: true })
  console.log(`✅ Created evidence directory: ${evidenceDir}`)
}

console.log('🚀 Running CI Local - Full Smoke Suite\n')

const smokeTests = [
  'shell-traversal',
  'adapter-resolution',
  'wrapper-resilience',
  'save-recovery',
  'asset-fallback'
]

let allPassed = true

for (const testName of smokeTests) {
  console.log(`\n▶️  Running: ${testName}`)
  console.log('─'.repeat(60))
  
  try {
    execSync(`npx playwright test tests/smoke/${testName}.spec.ts`, {
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    })
    console.log(`✅ PASSED: ${testName}`)
  } catch (error) {
    console.error(`❌ FAILED: ${testName}`)
    allPassed = false
  }
}

console.log('\n' + '═'.repeat(60))
if (allPassed) {
  console.log('✅ All smoke tests passed!')
  process.exit(0)
} else {
  console.log('❌ Some smoke tests failed. Check output above.')
  process.exit(1)
}
