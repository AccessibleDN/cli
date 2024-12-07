import { Command } from "commander";
import { readFile } from "fs/promises";
import { join } from "path";
import { GenerationPacks } from "./generation/GenerationPacks";
import { consola } from "consola";
import clc from "cli-color";
import {
  executeCommand,
  printHelp,
  printPacksList,
  findPackager,
  executePackagerScript,
} from "./utils/utils";
import { Configuration } from "./configuration/Configuration";

const program = new Command();

const initializeProgram = async (): Promise<Command> => {
  await GenerationPacks.initialize();

  // Root command setup
  program
    .name("accessibledn")
    .description("Modern CLI for AccessibleDN projects")
    .helpOption(false)
    .option("-h, --help", "Display help information")
    .argument("[command]", "The command to display help for")
    .action(printHelp);

  // Help command
  program
    .command("help")
    .argument("[command]", "The command to display help for")
    .description("Display help information")
    .action(printHelp);

  // Version command
  const { version } = JSON.parse(
    await readFile(join(__dirname, "../package.json"), "utf-8"),
  );

  program
    .command("version")
    .alias("v")
    .description("Output the version number")
    .action(() => {
      console.log(`AccessibleDN CLI v${version}`);
    });

  // Generate command
  program
    .command("generate")
    .alias("g")
    .helpOption(false)
    .argument("[pack]", "The pack to generate")
    .description(
      clc.green("✨ Create a new AccessibleDN project with a generation pack"),
    )
    .action(async (pack = "default") => {
      try {
        const selectedPack = GenerationPacks.getPack(pack);
        if (!selectedPack) {
          consola.warn(
            clc.yellow(
              `🚫 Pack "${pack}" not found - falling back to default pack`,
            ),
          );
          const defaultPack = GenerationPacks.getPack("default");
          await defaultPack?.generate();
          return;
        }
        await selectedPack.generate();
      } catch (err) {
        consola.error(clc.red("💥 Generation failed:"), err);
        process.exit(1);
      }
    });

  // Packs command group
  const packsCommand = program
    .command("packs")
    .alias("p")
    .description(clc.blue("📦 Manage generation packs"));

  packsCommand
    .command("list")
    .alias("ls")
    .description(clc.blue("🔍 Browse available generation packs"))
    .action(printPacksList);

  // Development commands
  program
    .command("dev")
    .alias("run")
    .helpOption(false)
    .description(
      clc.green("🚀 Run an AccessibleDN project in development mode"),
    )
    .action(() => {
      consola.start(
        clc.green("🚀 Starting AccessibleDN project in development mode"),
      );
      executePackagerScript("dev");
    });

  program
    .command("build")
    .description(clc.green("🔨 Build the AccessibleDN project for production"))
    .action(() => {
      consola.start(clc.green("🔨 Building AccessibleDN project"));
      executePackagerScript("build");
    });

  // Configuration command group
  const configureProgram = program
    .command("configure")
    .alias("config")
    .description(clc.green("🔧 Configure the AccessibleDN project"));

  configureProgram
    .command("git")
    .description(clc.green("📝 Initialize Git repository"))
    .action(async () => {
      consola.start(clc.green("📝 Initializing Git repository"));
      await executeCommand("git init", true, false);
    });

  configureProgram
    .command("deps")
    .alias("fix-dependencies")
    .description(clc.green("📦 Fix project dependencies"))
    .action(() => {
      consola.start(clc.green("📦 Fixing project dependencies"));
      executePackagerScript("install");
    });

  configureProgram
    .command("init")
    .description(clc.green("⚙️ Initialize project configuration"))
    .action(() => {
      consola.start(clc.green("⚙️ Initializing project configuration"));
      Configuration.initialize();
    });

  return program;
};

export default initializeProgram;
