/**
 * Primeira Liga Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class PrimeiraLigaImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('primeira-liga');
    if (!config) {
      throw new Error('Primeira Liga competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new PrimeiraLigaImporter();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 Primeira Liga import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Primeira Liga import failed: ${error.message}`);
      process.exit(1);
    });
}

export default PrimeiraLigaImporter;