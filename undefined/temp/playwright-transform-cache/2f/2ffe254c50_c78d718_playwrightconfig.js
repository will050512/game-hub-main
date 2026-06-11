import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  /* Configure projects for major browsers */
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome']
    }
  }],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZpbmVDb25maWciLCJkZXZpY2VzIiwidGVzdERpciIsImZ1bGx5UGFyYWxsZWwiLCJmb3JiaWRPbmx5IiwicHJvY2VzcyIsImVudiIsIkNJIiwicmV0cmllcyIsIndvcmtlcnMiLCJ1bmRlZmluZWQiLCJyZXBvcnRlciIsInVzZSIsImJhc2VVUkwiLCJ0cmFjZSIsInNjcmVlbnNob3QiLCJwcm9qZWN0cyIsIm5hbWUiLCJ3ZWJTZXJ2ZXIiLCJjb21tYW5kIiwidXJsIiwicmV1c2VFeGlzdGluZ1NlcnZlciIsInRpbWVvdXQiXSwic291cmNlcyI6WyJwbGF5d3JpZ2h0LmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVDb25maWcsIGRldmljZXMgfSBmcm9tICdAcGxheXdyaWdodC90ZXN0J1xuXG4vKipcbiAqIFJlYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGZyb20gZmlsZS5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3Rkb3RsYS9kb3RlbnZcbiAqL1xuLy8gcmVxdWlyZSgnZG90ZW52JykuY29uZmlnKCk7XG5cbi8qKlxuICogU2VlIGh0dHBzOi8vcGxheXdyaWdodC5kZXYvZG9jcy90ZXN0LWNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHRlc3REaXI6ICcuL3Rlc3RzJyxcbiAgLyogUnVuIHRlc3RzIGluIGZpbGVzIGluIHBhcmFsbGVsICovXG4gIGZ1bGx5UGFyYWxsZWw6IHRydWUsXG4gIC8qIEZhaWwgdGhlIGJ1aWxkIG9uIENJIGlmIHlvdSBhY2NpZGVudGFsbHkgbGVmdCB0ZXN0Lm9ubHkgaW4gdGhlIHNvdXJjZSBjb2RlLiAqL1xuICBmb3JiaWRPbmx5OiAhIXByb2Nlc3MuZW52LkNJLFxuICAvKiBSZXRyeSBvbiBDSSBvbmx5ICovXG4gIHJldHJpZXM6IHByb2Nlc3MuZW52LkNJID8gMiA6IDAsXG4gIC8qIE9wdCBvdXQgb2YgcGFyYWxsZWwgdGVzdHMgb24gQ0kuICovXG4gIHdvcmtlcnM6IHByb2Nlc3MuZW52LkNJID8gMSA6IHVuZGVmaW5lZCxcbiAgLyogUmVwb3J0ZXIgdG8gdXNlLiBTZWUgaHR0cHM6Ly9wbGF5d3JpZ2h0LmRldi9kb2NzL3Rlc3QtcmVwb3J0ZXJzICovXG4gIHJlcG9ydGVyOiAnaHRtbCcsXG4gIC8qIFNoYXJlZCBzZXR0aW5ncyBmb3IgYWxsIHRoZSBwcm9qZWN0cyBiZWxvdy4gU2VlIGh0dHBzOi8vcGxheXdyaWdodC5kZXYvZG9jcy9hcGkvY2xhc3MtdGVzdG9wdGlvbnMuICovXG4gIHVzZToge1xuICAgIC8qIEJhc2UgVVJMIHRvIHVzZSBpbiBhY3Rpb25zIGxpa2UgYGF3YWl0IHBhZ2UuZ290bygnLycpYC4gKi9cbiAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdDo1MTczJyxcbiAgICAvKiBDb2xsZWN0IHRyYWNlIHdoZW4gcmV0cnlpbmcgdGhlIGZhaWxlZCB0ZXN0LiBTZWUgaHR0cHM6Ly9wbGF5d3JpZ2h0LmRldi9kb2NzL3RyYWNlLXZpZXdlciAqL1xuICAgIHRyYWNlOiAnb24tZmlyc3QtcmV0cnknLFxuICAgIHNjcmVlbnNob3Q6ICdvbmx5LW9uLWZhaWx1cmUnLFxuICB9LFxuXG4gIC8qIENvbmZpZ3VyZSBwcm9qZWN0cyBmb3IgbWFqb3IgYnJvd3NlcnMgKi9cbiAgcHJvamVjdHM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnY2hyb21pdW0nLFxuICAgICAgdXNlOiB7IC4uLmRldmljZXNbJ0Rlc2t0b3AgQ2hyb21lJ10gfSxcbiAgICB9LFxuICBdLFxuXG4gIC8qIFJ1biB5b3VyIGxvY2FsIGRldiBzZXJ2ZXIgYmVmb3JlIHN0YXJ0aW5nIHRoZSB0ZXN0cyAqL1xuICB3ZWJTZXJ2ZXI6IHtcbiAgICBjb21tYW5kOiAnbnBtIHJ1biBkZXYnLFxuICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MycsXG4gICAgcmV1c2VFeGlzdGluZ1NlcnZlcjogIXByb2Nlc3MuZW52LkNJLFxuICAgIHRpbWVvdXQ6IDEyMCAqIDEwMDAsXG4gIH0sXG59KVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxZQUFZLEVBQUVDLE9BQU8sUUFBUSxrQkFBa0I7O0FBRXhEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZUFBZUQsWUFBWSxDQUFDO0VBQzFCRSxPQUFPLEVBQUUsU0FBUztFQUNsQjtFQUNBQyxhQUFhLEVBQUUsSUFBSTtFQUNuQjtFQUNBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsRUFBRTtFQUM1QjtFQUNBQyxPQUFPLEVBQUVILE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUM7RUFDL0I7RUFDQUUsT0FBTyxFQUFFSixPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsRUFBRSxHQUFHLENBQUMsR0FBR0csU0FBUztFQUN2QztFQUNBQyxRQUFRLEVBQUUsTUFBTTtFQUNoQjtFQUNBQyxHQUFHLEVBQUU7SUFDSDtJQUNBQyxPQUFPLEVBQUUsdUJBQXVCO0lBQ2hDO0lBQ0FDLEtBQUssRUFBRSxnQkFBZ0I7SUFDdkJDLFVBQVUsRUFBRTtFQUNkLENBQUM7RUFFRDtFQUNBQyxRQUFRLEVBQUUsQ0FDUjtJQUNFQyxJQUFJLEVBQUUsVUFBVTtJQUNoQkwsR0FBRyxFQUFFO01BQUUsR0FBR1gsT0FBTyxDQUFDLGdCQUFnQjtJQUFFO0VBQ3RDLENBQUMsQ0FDRjtFQUVEO0VBQ0FpQixTQUFTLEVBQUU7SUFDVEMsT0FBTyxFQUFFLGFBQWE7SUFDdEJDLEdBQUcsRUFBRSx1QkFBdUI7SUFDNUJDLG1CQUFtQixFQUFFLENBQUNoQixPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsRUFBRTtJQUNwQ2UsT0FBTyxFQUFFLEdBQUcsR0FBRztFQUNqQjtBQUNGLENBQUMsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==