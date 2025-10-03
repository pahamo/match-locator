/**
 * Championship Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class ChampionshipImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('championship');
    if (!config) {
      throw new Error('Championship competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new ChampionshipImporter();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 Championship import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Championship import failed: ${error.message}`);
      process.exit(1);
    });
}

export default ChampionshipImporter;