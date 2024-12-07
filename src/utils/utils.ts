import clc from "cli-color";
import { GenerationPacks } from "../generation/GenerationPacks";
import cliui from "cliui";
import { execSync } from "child_process";
import consola from "consola";
import { Configuration, PackagerType } from "../configuration/Configuration";

const ui = cliui({ width: 80 });

export function printHelp(command?: string) {
  // Define command help data structure
  const commands: Record<
    string,
    {
      title: string;
      usage: string;
      description: string;
      args?: string;
      subcommands?: string;
    }
  > = {
    generate: {
      title: "Generate Command",
      usage: "accessibledn generate [pack]",
      description: "Create a new AccessibleDN project with specified pack",
      args: "[pack] - Optional pack name (defaults to 'default')",
    },
    packs: {
      title: "Packs Command",
      usage: "accessibledn packs list",
      description: "List and manage generation packs",
      subcommands: "list - Show available packs",
    },
    run: {
      title: "Run Command",
      usage: "accessibledn run",
      description: "Run the AccessibleDN project",
    },
    dev: {
      title: "Dev Command",
      usage: "accessibledn dev",
      description: "Run the AccessibleDN project in development mode",
    },
    build: {
      title: "Build Command",
      usage: "accessibledn build",
      description: "Build the AccessibleDN project for production",
    },
    configure: {
      title: "Configure Command",
      usage: "accessibledn configure",
      description: "Configure the AccessibleDN project",
      subcommands:
        "git - Initialize Git repository\ndeps - Fix project dependencies\ninit - Initialize project configuration",
    },
  };

  // Handle specific command help
  if (command && command in commands) {
    const cmd = commands[command];
    console.log(`
${clc.yellow(cmd.title)}
${clc.blue("  Usage")}${" ".repeat(14)}${cmd.usage}
${clc.blue("  Description")}${" ".repeat(10)}${cmd.description}${
      cmd.args ? `\n${clc.blue("  Arguments")}${" ".repeat(12)}${cmd.args}` : ""
    }${
      cmd.subcommands
        ? `\n${clc.blue("  Subcommands")}${" ".repeat(10)}${cmd.subcommands}`
        : ""
    }
`);
    process.exit(0);
  }

  // Define general help sections
  const generalHelp = [
    {
      title: "✨ AccessibleDN CLI",
      content:
        clc.cyan("✨ AccessibleDN CLI") +
        "\n" +
        clc.blackBright("━".repeat(30)),
    },
    {
      title: "Available Commands",
      content: [
        ["generate [pack]", "Create a new AccessibleDN project"],
        ["packs", "Packs Management"],
        ["help [command]", "Display help (for specific command)"],
        ["version", "Output the version number"],
        ["run", "Runs the AccessibleDN project"],
        ["dev", "Runs the AccessibleDN project in development mode"],
        ["configure", "Configuration Management"],
        ["build", "Build the AccessibleDN project for production"],
      ]
        .map(
          ([cmd, desc]) =>
            `${clc.blue("  " + cmd)}${" ".repeat(20 - cmd.length)}${desc}`,
        )
        .join("\n"),
    },
    {
      title: "Options",
      content: [
        ["-v, --version", "Output the version number"],
        ["-h, --help", "Display this help message"],
      ]
        .map(
          ([opt, desc]) =>
            `${clc.blue("  " + opt)}${" ".repeat(20 - opt.length)}${desc}`,
        )
        .join("\n"),
    },
    {
      title: "Examples",
      content: [
        "accessibledn generate",
        "accessibledn generate my-pack",
        "accessibledn help generate",
        "accessibledn packs list",
        "accessibledn run",
      ]
        .map((ex) => clc.blue("  $ " + ex))
        .join("\n"),
    },
  ];

  // Print general help
  console.log(
    generalHelp
      .map((section) => `\n${clc.yellow(section.title)}\n${section.content}`)
      .join("\n"),
  );

  console.log(
    "\n" +
      clc.yellow(
        "For more information, visit: https://github.com/accessibledn/cli",
      ) +
      "\n",
  );
  process.exit(0);
}

export function printPacksList() {
  const packs = GenerationPacks.getPacks();

  ui.div({
    text: clc.cyan("✨ Generation Packs Gallery"),
    padding: [1, 0, 0, 0],
  });

  ui.div({
    text: clc.blackBright("━".repeat(30)),
    padding: [0, 0, 1, 0],
  });

  if (packs.size === 0) {
    ui.div({
      text: clc.yellow("👀 No packs found yet"),
      padding: [0, 0, 1, 0],
    });

    ui.div({
      text: clc.yellow(
        "💡 Generation Packs are provided by the development team of AccessibleDN, find them using 'accessibledn packs list'",
      ),
      padding: [0, 0, 1, 0],
    });
  } else {
    ui.div({
      text: [...packs.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name]) => clc.green(`⚡️ ${name}`))
        .join("\n"),
      padding: [0, 0, 1, 0],
    });
  }

  console.log(ui.toString());
}

export function executeCommand(
  command: string,
  silent?: boolean,
  outputSilent?: boolean,
) {
  try {
    if (!outputSilent) console.info(clc.blackBright(`$ ${command}`));
    execSync(command, {
      stdio: silent ? "ignore" : "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    consola.error(clc.red(`💥 Command failed: ${command}`), error);
    process.exit(1);
  }
}

export function findPackager(): PackagerType {
  const config = Configuration.getInstance();
  return (
    (config?.get("packager") as PackagerType | undefined) || PackagerType.YARN
  );
}

export function getPackagerCommand(): string {
  const packager = findPackager();
  return packager === PackagerType.YARN ? "yarn" : "npm";
}

export function executePackagerScript(script: string, silent?: boolean): void {
  const packager = findPackager();
  if (packager === PackagerType.YARN) {
    executeCommand(`yarn ${script} ${silent ? "--silent" : ""}`);
  } else {
    executeCommand(`npm run ${script} ${silent ? "--silent" : ""}`);
  }
}
