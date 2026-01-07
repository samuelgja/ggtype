/* eslint-disable sonarjs/no-os-command-from-path */
import {
  spawn,
  type ChildProcess,
} from 'node:child_process'
import { fileURLToPath } from 'node:url'
// eslint-disable-next-line unicorn/import-style
import { dirname, join } from 'node:path'

const PORT = 3000
let serverProcess: ChildProcess | null = null

const waitForServer = async (
  maxAttempts = 30,
): Promise<void> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `http://localhost:${PORT}/http`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      )
      if (response.ok || response.status !== 404) {
        return
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(
    `Server did not start within ${maxAttempts * 500}ms`,
  )
}

const killProcessStrictly = async (
  process: ChildProcess,
  timeoutMs = 2000,
): Promise<void> => {
  if (process.killed || !process.pid) {
    return
  }

  // Try graceful shutdown first
  process.kill('SIGTERM')

  // Wait for process to exit with timeout
  const exitPromise = new Promise<void>((resolve) => {
    if (!process.pid) {
      resolve()
      return
    }

    const checkExit = () => {
      if (process.killed || !process.pid) {
        resolve()
      }
    }

    process.once('exit', checkExit)
    process.once('close', checkExit)

    // Fallback check
    setTimeout(() => {
      if (!process.killed && process.pid) {
        resolve()
      }
    }, timeoutMs)
  })

  await Promise.race([
    exitPromise,
    new Promise<void>((resolve) =>
      setTimeout(resolve, timeoutMs),
    ),
  ])

  // Force kill if still running
  if (!process.killed && process.pid) {
    try {
      process.kill('SIGKILL')
      // Give it a moment to die
      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      )
    } catch {
      // Process may already be dead, ignore
    }
  }
}

export async function setup(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const projectRoot = join(__dirname, '..')
  const serverPath = join(projectRoot, 'e2e', 'server.ts')

  await teardown()

  serverProcess = spawn('bun', ['run', serverPath], {
    stdio: 'inherit',
    cwd: projectRoot,
  })

  serverProcess.on('error', (error) => {
    throw new Error(
      `Failed to start server: ${error.message}`,
    )
  })

  await waitForServer()
}

export async function teardown(): Promise<void> {
  if (!serverProcess) {
    return
  }

  const processToKill = serverProcess
  serverProcess = null

  // Try to gracefully shutdown via /close endpoint with timeout
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      1000,
    )

    await fetch(`http://localhost:${PORT}/close`, {
      signal: controller.signal,
    }).catch(() => {
      // Server may already be closed or not responding, continue to kill
    })

    clearTimeout(timeoutId)
  } catch {
    // Server may already be closed, continue to kill process
  }

  // Force kill the process strictly
  await killProcessStrictly(processToKill)
}
