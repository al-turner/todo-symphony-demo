import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright'

const rootDir = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const proofDir = path.join(rootDir, 'codex-proof')
const videoDir = path.join(proofDir, 'video')
const screenshotPath = path.join(proofDir, 'screenshot.png')
const walkthroughPath = path.join(proofDir, 'walkthrough.webm')
const appUrl = 'http://127.0.0.1:4173'

await mkdir(videoDir, { recursive: true })
await rm(screenshotPath, { force: true })
await rm(walkthroughPath, { force: true })

const server = spawn(
  'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      CI: '1',
    },
  },
)

server.stdout.on('data', (chunk) => process.stdout.write(chunk))
server.stderr.on('data', (chunk) => process.stderr.write(chunk))

let browser

try {
  await waitForServer(appUrl)

  browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1280, height: 960 },
    recordVideo: { dir: videoDir },
  })
  const page = await context.newPage()

  await page.goto(appUrl, { waitUntil: 'networkidle' })
  await page
    .getByRole('textbox', { name: /new todo/i })
    .fill('Open todo')
  await page.getByRole('button', { name: /add todo/i }).click()
  await page.getByRole('textbox', { name: /new todo/i }).fill('Completed todo')
  await page.getByRole('button', { name: /add todo/i }).click()
  await page.getByRole('checkbox', { name: 'Completed todo' }).check()
  await page.screenshot({ path: screenshotPath, fullPage: true })

  await context.close()
  await moveLatestVideo(videoDir, walkthroughPath)
} finally {
  if (browser) {
    await browser.close()
  }

  await stopServer(server)
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Keep polling until Vite is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function stopServer(childProcess) {
  if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
    return
  }

  childProcess.kill('SIGTERM')

  await new Promise((resolve) => {
    childProcess.once('exit', resolve)
  })
}

async function moveLatestVideo(sourceDir, targetPath) {
  const files = await readdir(sourceDir)
  const candidate = files
    .filter((file) => file.endsWith('.webm'))
    .map((file) => path.join(sourceDir, file))
    .sort()
    .at(-1)

  if (!candidate) {
    throw new Error(`No Playwright video found in ${sourceDir}`)
  }

  await rename(candidate, targetPath)
}
