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

export async function setup(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const projectRoot = join(__dirname, '..')
  const serverPath = join(projectRoot, 'e2e', 'server.ts')

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
  if (serverProcess) {
    try {
      await fetch(`http://localhost:${PORT}/close`)
      // Give the server a moment to close gracefully
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      )
    } catch {
      // Server may already be closed, ignore errors
    }

    if (serverProcess.killed === false) {
      serverProcess.kill()
    }
    serverProcess = null
  }
}
