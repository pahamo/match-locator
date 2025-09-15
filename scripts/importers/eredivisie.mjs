/**
 * Eredivisie Importer
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class EredivisieImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('eredivisie');
    if (!config) {
      throw new Error('Eredivisie competition config not found');
    }
    super(config);
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new EredivisieImporter();
  importer.importAll()
    .then(result => {
      console.log(`\n🎉 Eredivisie import completed!`);
      console.log(`Teams: ${result.teams}, Fixtures: ${result.fixtures}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ Eredivisie import failed: ${error.message}`);
      process.exit(1);
    });
}

export default EredivisieImporter;