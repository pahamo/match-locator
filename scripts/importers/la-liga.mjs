/**
 * La Liga Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class LaLigaImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('la-liga');
    if (!config) {
      throw new Error('La Liga competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new LaLigaImporter();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 La Liga import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ La Liga import failed: ${error.message}`);
      process.exit(1);
    });
}

export default LaLigaImporter;