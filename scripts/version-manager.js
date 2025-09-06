#!/usr/bin/env node
/**
 * Version Management Utility for Football Listings
 * 
 * This script provides manual version management capabilities
 * and utilities to work with the automated versioning system.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PACKAGE_JSON = path.join(process.cwd(), 'config', 'package.json');
const INDEX_HTML = path.join(process.cwd(), 'src', 'index.html');
const CHANGELOG_HTML = path.join(process.cwd(), 'src', 'changelog.html');

class VersionManager {
    constructor() {
        this.currentVersion = this.getCurrentVersion();
    }

    getCurrentVersion() {
        try {
            const packageData = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
            return packageData.version || '1.0.0';
        } catch (error) {
            console.error('Error reading package.json:', error.message);
            return '1.0.0';
        }
    }

    parseVersion(version) {
        const parts = version.split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }

    formatVersion(major, minor, patch) {
        return `${major}.${minor}.${patch}`;
    }

    bumpVersion(type) {
        const current = this.parseVersion(this.currentVersion);
        let newVersion;

        switch (type) {
            case 'major':
                newVersion = this.formatVersion(current.major + 1, 0, 0);
                break;
            case 'minor':
                newVersion = this.formatVersion(current.major, current.minor + 1, 0);
                break;
            case 'patch':
                newVersion = this.formatVersion(current.major, current.minor, current.patch + 1);
                break;
            default:
                throw new Error('Invalid version type. Use: major, minor, or patch');
        }

        return newVersion;
    }

    updatePackageJson(newVersion) {
        try {
            const packageData = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
            packageData.version = newVersion;
            fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageData, null, 2) + '\n');
            console.log(`✓ Updated package.json to version ${newVersion}`);
        } catch (error) {
            console.error('Error updating package.json:', error.message);
            throw error;
        }
    }

    updateIndexHtml(newVersion) {
        try {
            let content = fs.readFileSync(INDEX_HTML, 'utf8');
            content = content.replace(/v\d+\.\d+\.\d+/g, `v${newVersion}`);
            fs.writeFileSync(INDEX_HTML, content);
            console.log(`✓ Updated index.html version badge to v${newVersion}`);
        } catch (error) {
            console.error('Error updating index.html:', error.message);
            throw error;
        }
    }

    commitVersionChange(newVersion, type) {
        try {
            execSync('git add config/package.json src/index.html', { stdio: 'inherit' });
            execSync(`git commit -m "chore: bump version to ${newVersion} (${type})"`, { stdio: 'inherit' });
            console.log(`✓ Committed version bump to ${newVersion}`);
        } catch (error) {
            console.error('Error committing changes:', error.message);
            throw error;
        }
    }

    showCurrentVersion() {
        console.log(`Current version: ${this.currentVersion}`);
    }

    showNextVersions() {
        const current = this.parseVersion(this.currentVersion);
        console.log('\nNext possible versions:');
        console.log(`  Patch: ${this.bumpVersion('patch')} (bug fixes, minor tweaks)`);
        console.log(`  Minor: ${this.bumpVersion('minor')} (new features, significant updates)`);
        console.log(`  Major: ${this.bumpVersion('major')} (breaking changes, major milestones)`);
    }

    checkGitStatus() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (status.trim()) {
                console.log('\n⚠️  Warning: You have uncommitted changes:');
                console.log(status);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking git status:', error.message);
            return false;
        }
    }

    showCommitMessageGuide() {
        console.log('\n📋 Commit Message Guide for Automated Versioning:');
        console.log('');
        console.log('🔢 Version Bumping:');
        console.log('  feat: ...        → Minor version bump (new features)');
        console.log('  fix: ...         → Patch version bump (bug fixes)');
        console.log('  BREAKING: ...    → Major version bump (breaking changes)');
        console.log('  docs: ...        → Patch version bump (documentation)');
        console.log('  style: ...       → Patch version bump (UI improvements)');
        console.log('  refactor: ...    → Patch version bump (code refactoring)');
        console.log('  perf: ...        → Patch version bump (performance)');
        console.log('  test: ...        → Patch version bump (testing)');
        console.log('  build: ...       → Patch version bump (build system)');
        console.log('  ci: ...          → Patch version bump (CI/CD)');
        console.log('  chore: ...       → Patch version bump (maintenance)');
        console.log('');
        console.log('📝 Examples:');
        console.log('  git commit -m "feat: add dark mode toggle"');
        console.log('  git commit -m "fix: resolve timezone display bug"');
        console.log('  git commit -m "BREAKING: remove deprecated API endpoints"');
        console.log('');
        console.log('ℹ️  Regular commits without prefixes won\'t trigger version bumps.');
    }

    run(args) {
        const command = args[0];

        switch (command) {
            case 'current':
            case 'status':
                this.showCurrentVersion();
                this.showNextVersions();
                break;

            case 'bump':
                const bumpType = args[1];
                if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
                    console.error('Usage: npm run version bump <major|minor|patch>');
                    process.exit(1);
                }

                if (!this.checkGitStatus()) {
                    console.log('\nPlease commit your changes before bumping the version.');
                    process.exit(1);
                }

                const newVersion = this.bumpVersion(bumpType);
                console.log(`Bumping version from ${this.currentVersion} to ${newVersion} (${bumpType})`);
                
                this.updatePackageJson(newVersion);
                this.updateIndexHtml(newVersion);
                this.commitVersionChange(newVersion, bumpType);
                
                console.log('\n✨ Version bump complete!');
                console.log(`The git post-commit hook will automatically update the changelog.`);
                break;

            case 'guide':
            case 'help':
                this.showCommitMessageGuide();
                break;

            case 'check':
                console.log('🔍 Version System Status:');
                this.showCurrentVersion();
                
                // Check if files exist
                const files = {
                    'package.json': fs.existsSync(PACKAGE_JSON),
                    'index.html': fs.existsSync(INDEX_HTML),
                    'changelog.html': fs.existsSync(CHANGELOG_HTML),
                    'post-commit hook': fs.existsSync(path.join(process.cwd(), '.git', 'hooks', 'post-commit'))
                };

                console.log('\n📁 File Status:');
                Object.entries(files).forEach(([file, exists]) => {
                    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
                });

                // Check git hook permissions
                const hookPath = path.join(process.cwd(), '.git', 'hooks', 'post-commit');
                if (fs.existsSync(hookPath)) {
                    const stats = fs.statSync(hookPath);
                    const isExecutable = stats.mode & parseInt('111', 8);
                    console.log(`  ${isExecutable ? '✓' : '✗'} post-commit hook executable`);
                }

                break;

            default:
                console.log('Football Listings Version Manager\n');
                console.log('Usage:');
                console.log('  npm run version current    - Show current version');
                console.log('  npm run version bump <type> - Bump version (major|minor|patch)');
                console.log('  npm run version guide      - Show commit message guide');
                console.log('  npm run version check      - Check version system status');
                console.log('');
                console.log('Examples:');
                console.log('  npm run version bump patch  - 1.5.0 → 1.5.1');
                console.log('  npm run version bump minor  - 1.5.0 → 1.6.0');
                console.log('  npm run version bump major  - 1.5.0 → 2.0.0');
        }
    }
}

// Run the version manager
const args = process.argv.slice(2);
const manager = new VersionManager();
manager.run(args);