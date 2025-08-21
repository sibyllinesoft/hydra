#!/usr/bin/env node
import { main } from '../install.js';

main().catch(err => {
  console.error('[HYDRA-INSTALLER] Fatal error:', err);
  process.exitCode = 1;
});
