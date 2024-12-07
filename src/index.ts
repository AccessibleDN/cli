#! /usr/bin/env node

import setupProgram from "./setupProgram";

(async () => {
  const program = await setupProgram();
  program.parse(process.argv);
})();
