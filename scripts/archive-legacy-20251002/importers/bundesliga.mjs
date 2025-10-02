/**
 * Bundesliga Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class BundesligaImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('bundesliga');
    if (!config) {
      throw new Error('Bundesliga competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new BundesligaImporter();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 Bundesliga import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Bundesliga import failed: ${error.message}`);
      process.exit(1);
    });
}

export default BundesligaImporter;