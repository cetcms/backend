#!/usr/bin/env tsx

/**
 * Reset script that executes a series of commands in order:
 * 1. Push database schema with force reset
 * 2. Seed the database with initial data
 * 3. Push permissions to admin role
 * 4. Push permissions to company role
 */

import { spawn } from 'child_process';

const commands = [
  'pnpm db:push --force-reset',
  'pnpm script:scan-permissions',
  'pnpm db:seed',
  'pnpm script:push-permissions-to-role',
  'pnpm script:push-permissions-to-role --type company --role OWNER',
  'pnpm script:seed-mock',
  'pnpm generate',
  'pnpm lint',
];

function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\nExecuting: ${command}\n`);

    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command completed successfully: ${command}\n`);
        resolve();
      } else {
        console.error(`❌ Command failed with exit code ${code}: ${command}`);
        reject(new Error(`Command failed: ${command}`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Failed to start command: ${command}`, error);
      reject(error);
    });
  });
}

async function main() {
  console.log('🚀 Starting reset process...\n');

  try {
    for (const command of commands) {
      await executeCommand(command);
    }

    console.log('🎉 All reset commands completed successfully!');
  } catch (error) {
    console.error('💥 Reset process failed:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
