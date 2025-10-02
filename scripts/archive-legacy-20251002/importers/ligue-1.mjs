/**
 * Ligue 1 Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class Ligue1Importer extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('ligue-1');
    if (!config) {
      throw new Error('Ligue 1 competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new Ligue1Importer();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 Ligue 1 import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Ligue 1 import failed: ${error.message}`);
      process.exit(1);
    });
}

export default Ligue1Importer;