#!/usr/bin/env node

/**
 * Match Locator Codebase Cleanup Script
 *
 * Automated cleanup tool for maintaining code quality and removing technical debt.
 * Supports dry-run mode for safe preview of changes.
 *
 * Usage:
 *   npm run cleanup           # Full cleanup
 *   npm run cleanup:dry       # Preview changes only
 *   node scripts/cleanup.js --dry-run --verbose
 *
 * Features:
 * - Remove empty folders and system files
 * - Update dependencies to latest minor versions
 * - Format code with Prettier
 * - Run ESLint auto-fix
 * - Clean build artifacts
 * - Generate cleanup report
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const CONFIG = {
  // Files and folders to clean
  systemFiles: ['.DS_Store', 'Thumbs.db', '.tmp', '*.log'],
  buildArtifacts: ['build', 'dist', '.cache', 'coverage'],
  emptyFolders: true,

  // Dependencies
  updateDependencies: true,
  updateToMinor: true, // Only update to latest minor versions for safety

  // Code formatting
  runPrettier: true,
  runESLint: true,

  // Technical debt fixes
  extractMagicNumbers: true,
  addReactMemo: false, // Manual review recommended
  fixImports: true,

  // Reporting
  generateReport: true,
  verbose: false
};

class CleanupScript {
  constructor(options = {}) {
    this.isDryRun = options.dryRun || false;
    this.isVerbose = options.verbose || false;
    this.projectRoot = process.cwd();
    this.report = {
      startTime: new Date(),
      actions: [],
      errors: [],
      filesChanged: 0,
      foldersRemoved: 0,
      dependenciesUpdated: 0
    };

    this.log('🧹 Match Locator Cleanup Script Started');
    this.log(`Mode: ${this.isDryRun ? 'DRY RUN (preview only)' : 'LIVE EXECUTION'}`);
    this.log(`Project: ${this.projectRoot}\n`);
  }

  log(message, force = false) {
    if (this.isVerbose || force) {
      console.log(message);
    }
  }

  addAction(action, details = '') {
    this.report.actions.push({
      action,
      details,
      timestamp: new Date(),
      dryRun: this.isDryRun
    });
    this.log(`${this.isDryRun ? '[DRY RUN] ' : ''}${action}: ${details}`);
  }

  addError(error, context = '') {
    this.report.errors.push({
      error: error.message,
      context,
      timestamp: new Date()
    });
    console.error(`❌ Error ${context}: ${error.message}`);
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async isDirectory(dirPath) {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async isEmpty(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      return files.length === 0;
    } catch {
      return false;
    }
  }

  async removeSystemFiles() {
    this.log('\n📁 Removing system files and artifacts...');

    const findSystemFiles = async (dir, depth = 0) => {
      if (depth > 10) return []; // Prevent infinite recursion

      const files = [];
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Skip node_modules and .git
          if (entry.name === 'node_modules' || entry.name === '.git') {
            continue;
          }

          if (entry.isFile()) {
            // Check if it's a system file
            const isSystemFile = CONFIG.systemFiles.some(pattern => {
              if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return regex.test(entry.name);
              }
              return entry.name === pattern;
            });

            if (isSystemFile) {
              files.push(fullPath);
            }
          } else if (entry.isDirectory()) {
            // Recursively search subdirectories
            const subFiles = await findSystemFiles(fullPath, depth + 1);
            files.push(...subFiles);
          }
        }
      } catch (error) {
        this.addError(error, `scanning directory ${dir}`);
      }

      return files;
    };

    try {
      const systemFiles = await findSystemFiles(this.projectRoot);

      for (const file of systemFiles) {
        if (!this.isDryRun) {
          await fs.unlink(file);
        }
        this.addAction('Remove system file', path.relative(this.projectRoot, file));
        this.report.filesChanged++;
      }

      this.log(`Found and ${this.isDryRun ? 'would remove' : 'removed'} ${systemFiles.length} system files`);
    } catch (error) {
      this.addError(error, 'removing system files');
    }
  }

  async removeEmptyFolders() {
    this.log('\n📂 Removing empty folders...');

    const findEmptyFolders = async (dir, depth = 0) => {
      if (depth > 10) return []; // Prevent infinite recursion

      const emptyFolders = [];
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const fullPath = path.join(dir, entry.name);

            // Skip important directories
            if (['node_modules', '.git', 'src', 'public', 'docs'].includes(entry.name)) {
              continue;
            }

            // Recursively check subdirectories first
            const subEmptyFolders = await findEmptyFolders(fullPath, depth + 1);
            emptyFolders.push(...subEmptyFolders);

            // Check if this directory is now empty
            if (await this.isEmpty(fullPath)) {
              emptyFolders.push(fullPath);
            }
          }
        }
      } catch (error) {
        this.addError(error, `scanning directory ${dir}`);
      }

      return emptyFolders;
    };

    try {
      const emptyFolders = await findEmptyFolders(this.projectRoot);

      for (const folder of emptyFolders) {
        if (!this.isDryRun) {
          await fs.rmdir(folder);
        }
        this.addAction('Remove empty folder', path.relative(this.projectRoot, folder));
        this.report.foldersRemoved++;
      }

      this.log(`Found and ${this.isDryRun ? 'would remove' : 'removed'} ${emptyFolders.length} empty folders`);
    } catch (error) {
      this.addError(error, 'removing empty folders');
    }
  }

  async cleanBuildArtifacts() {
    this.log('\n🗑️  Cleaning build artifacts...');

    for (const artifact of CONFIG.buildArtifacts) {
      const artifactPath = path.join(this.projectRoot, artifact);

      if (await this.fileExists(artifactPath)) {
        if (!this.isDryRun) {
          if (await this.isDirectory(artifactPath)) {
            execSync(`rm -rf "${artifactPath}"`, { cwd: this.projectRoot });
          } else {
            await fs.unlink(artifactPath);
          }
        }
        this.addAction('Remove build artifact', artifact);
        this.report.filesChanged++;
      }
    }
  }

  async updateDependencies() {
    if (!CONFIG.updateDependencies) return;

    this.log('\n📦 Updating dependencies...');

    try {
      // Check if package.json exists
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (!(await this.fileExists(packageJsonPath))) {
        this.log('No package.json found, skipping dependency updates');
        return;
      }

      if (!this.isDryRun) {
        // Remove node_modules and package-lock.json for clean install
        const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
        const lockfilePath = path.join(this.projectRoot, 'package-lock.json');

        if (await this.fileExists(nodeModulesPath)) {
          execSync('rm -rf node_modules', { cwd: this.projectRoot });
          this.addAction('Remove node_modules', 'for clean reinstall');
        }

        if (await this.fileExists(lockfilePath)) {
          await fs.unlink(lockfilePath);
          this.addAction('Remove package-lock.json', 'for fresh dependency resolution');
        }

        // Install dependencies
        this.log('Installing dependencies...');
        execSync('npm install', { cwd: this.projectRoot, stdio: 'inherit' });
        this.addAction('Install dependencies', 'npm install completed');

        // Update to latest minor versions (safer than major updates)
        if (CONFIG.updateToMinor) {
          this.log('Updating to latest minor versions...');
          execSync('npm update', { cwd: this.projectRoot, stdio: 'inherit' });
          this.addAction('Update dependencies', 'npm update completed');
          this.report.dependenciesUpdated++;
        }
      } else {
        this.addAction('Would update dependencies', 'npm install && npm update');
      }
    } catch (error) {
      this.addError(error, 'updating dependencies');
    }
  }

  async formatCode() {
    if (!CONFIG.runPrettier) return;

    this.log('\n🎨 Formatting code with Prettier...');

    try {
      const prettierCmd = 'npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"';

      if (!this.isDryRun) {
        execSync(prettierCmd, { cwd: this.projectRoot, stdio: 'inherit' });
        this.addAction('Format code', 'Prettier formatting applied');
      } else {
        this.addAction('Would format code', prettierCmd);
      }
    } catch (error) {
      this.addError(error, 'running Prettier');
    }
  }

  async lintCode() {
    if (!CONFIG.runESLint) return;

    this.log('\n🔍 Running ESLint auto-fix...');

    try {
      const eslintCmd = 'npx eslint "src/**/*.{js,jsx,ts,tsx}" --fix';

      if (!this.isDryRun) {
        execSync(eslintCmd, { cwd: this.projectRoot, stdio: 'inherit' });
        this.addAction('Auto-fix linting issues', 'ESLint auto-fix applied');
      } else {
        this.addAction('Would auto-fix linting issues', eslintCmd);
      }
    } catch (error) {
      // ESLint may exit with non-zero code even on successful fixes
      this.log('ESLint completed with some issues (this is normal)');
      this.addAction('Auto-fix linting issues', 'ESLint completed with warnings');
    }
  }

  async fixTechnicalDebt() {
    this.log('\n🔧 Applying automated technical debt fixes...');

    // Fix 1: Extract magic number for test fixture filtering
    if (CONFIG.extractMagicNumbers) {
      await this.extractTestFixtureConstant();
    }

    // Fix 2: Convert full React imports to named imports
    if (CONFIG.fixImports) {
      await this.fixReactImports();
    }
  }

  async extractTestFixtureConstant() {
    this.log('Extracting TEST_FIXTURE_MAX_ID constant...');

    try {
      // Read service files that contain the magic number
      const filesToUpdate = [
        'src/services/supabase.ts',
        'src/services/supabase-simple.ts'
      ];

      for (const file of filesToUpdate) {
        const filePath = path.join(this.projectRoot, file);
        if (!(await this.fileExists(filePath))) continue;

        const content = await fs.readFile(filePath, 'utf-8');

        // Check if the magic number exists
        if (content.includes('f.id > 30')) {
          let updatedContent = content;

          // Add constant at the top of the file (after imports)
          const constantDeclaration = '\n// Test fixture filtering constant\nconst TEST_FIXTURE_MAX_ID = 30;\n';

          // Find where to insert the constant (after the last import)
          const importRegex = /^import.*from.*['"];$/gm;
          const imports = content.match(importRegex);

          if (imports) {
            const lastImport = imports[imports.length - 1];
            const lastImportIndex = content.indexOf(lastImport) + lastImport.length;

            updatedContent = content.slice(0, lastImportIndex) +
                           constantDeclaration +
                           content.slice(lastImportIndex);
          } else {
            // No imports found, add at the beginning
            updatedContent = constantDeclaration + content;
          }

          // Replace the magic number with the constant
          updatedContent = updatedContent.replace(/f\.id > 30/g, 'f.id > TEST_FIXTURE_MAX_ID');

          if (!this.isDryRun) {
            await fs.writeFile(filePath, updatedContent, 'utf-8');
          }

          this.addAction('Extract magic number', `${file} - replaced hardcoded 30 with TEST_FIXTURE_MAX_ID`);
          this.report.filesChanged++;
        }
      }
    } catch (error) {
      this.addError(error, 'extracting magic numbers');
    }
  }

  async fixReactImports() {
    this.log('Converting full React imports to named imports...');

    try {
      const findFilesWithReactImports = async (dir) => {
        const files = [];
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.name === 'node_modules') continue;

            if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
              const content = await fs.readFile(fullPath, 'utf-8');
              if (content.includes('import * as React from') || content.includes('import React, * as React from')) {
                files.push(fullPath);
              }
            } else if (entry.isDirectory()) {
              const subFiles = await findFilesWithReactImports(fullPath);
              files.push(...subFiles);
            }
          }
        } catch (error) {
          this.addError(error, `scanning ${dir} for React imports`);
        }

        return files;
      };

      const srcDir = path.join(this.projectRoot, 'src');
      if (!(await this.fileExists(srcDir))) return;

      const filesWithFullImports = await findFilesWithReactImports(srcDir);

      for (const file of filesWithFullImports) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          let updatedContent = content;

          // Simple transformation for common patterns
          // This is a basic implementation - in production, you'd want more sophisticated AST parsing
          updatedContent = updatedContent.replace(
            /import \* as React from ['"]react['"];?/g,
            "import React, { useState, useEffect, useMemo, useCallback } from 'react';"
          );

          if (updatedContent !== content) {
            if (!this.isDryRun) {
              await fs.writeFile(file, updatedContent, 'utf-8');
            }

            this.addAction('Fix React imports', path.relative(this.projectRoot, file));
            this.report.filesChanged++;
          }
        } catch (error) {
          this.addError(error, `updating React imports in ${file}`);
        }
      }

      this.log(`Fixed React imports in ${filesWithFullImports.length} files`);
    } catch (error) {
      this.addError(error, 'fixing React imports');
    }
  }

  async generateReport() {
    if (!CONFIG.generateReport) return;

    this.log('\n📊 Generating cleanup report...');

    const endTime = new Date();
    const duration = Math.round((endTime - this.report.startTime) / 1000);

    const reportData = {
      ...this.report,
      endTime,
      duration: `${duration} seconds`,
      summary: {
        totalActions: this.report.actions.length,
        filesChanged: this.report.filesChanged,
        foldersRemoved: this.report.foldersRemoved,
        dependenciesUpdated: this.report.dependenciesUpdated,
        errorsEncountered: this.report.errors.length
      },
      system: {
        platform: os.platform(),
        nodeVersion: process.version,
        projectRoot: this.projectRoot
      }
    };

    const reportPath = path.join(this.projectRoot, 'cleanup-report.json');

    if (!this.isDryRun) {
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
      this.addAction('Generate report', 'cleanup-report.json created');
    }

    // Console summary
    console.log('\n' + '='.repeat(50));
    console.log('🧹 CLEANUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`Mode: ${this.isDryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Actions taken: ${reportData.summary.totalActions}`);
    console.log(`Files changed: ${reportData.summary.filesChanged}`);
    console.log(`Folders removed: ${reportData.summary.foldersRemoved}`);
    console.log(`Dependencies updated: ${reportData.summary.dependenciesUpdated}`);
    console.log(`Errors: ${reportData.summary.errorsEncountered}`);

    if (this.report.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.report.errors.forEach(error => {
        console.log(`  - ${error.context}: ${error.error}`);
      });
    }

    if (!this.isDryRun) {
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }

    console.log('='.repeat(50));
  }

  async run() {
    try {
      await this.removeSystemFiles();
      await this.removeEmptyFolders();
      await this.cleanBuildArtifacts();
      await this.updateDependencies();
      await this.formatCode();
      await this.lintCode();
      await this.fixTechnicalDebt();
      await this.generateReport();

      this.log('\n✅ Cleanup completed successfully!', true);

      if (this.isDryRun) {
        console.log('\n💡 This was a dry run. To apply changes, run without --dry-run flag.');
      }

    } catch (error) {
      this.addError(error, 'main execution');
      console.error('\n❌ Cleanup failed with error:', error.message);
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  return {
    dryRun: args.includes('--dry-run') || args.includes('--dry'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
🧹 Match Locator Cleanup Script

Usage:
  node scripts/cleanup.js [options]
  npm run cleanup           # Full cleanup
  npm run cleanup:dry       # Preview changes only

Options:
  --dry-run, --dry         Preview changes without applying them
  --verbose, -v            Show detailed output
  --help, -h               Show this help message

Features:
  ✅ Remove system files (.DS_Store, Thumbs.db, etc.)
  ✅ Clean empty folders
  ✅ Remove build artifacts
  ✅ Update dependencies to latest minor versions
  ✅ Format code with Prettier
  ✅ Auto-fix ESLint issues
  ✅ Extract magic numbers to constants
  ✅ Fix React import patterns
  ✅ Generate detailed cleanup report

Safety:
  - Always use --dry-run first to preview changes
  - Creates backup report of all actions taken
  - Only updates to minor versions (not major)
  - Preserves important directories (src, docs, etc.)

Examples:
  node scripts/cleanup.js --dry-run --verbose
  node scripts/cleanup.js
  npm run cleanup:dry
`);
}

// Main execution
if (require.main === module) {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  const cleanup = new CleanupScript(options);
  cleanup.run();
}

module.exports = CleanupScript;