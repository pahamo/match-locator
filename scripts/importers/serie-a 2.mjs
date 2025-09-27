/**
 * Serie A Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class SerieAImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('serie-a');
    if (!config) {
      throw new Error('Serie A competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new SerieAImporter();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 Serie A import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Serie A import failed: ${error.message}`);
      process.exit(1);
    });
}

export default SerieAImporter;