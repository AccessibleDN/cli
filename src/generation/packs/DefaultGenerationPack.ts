import { GenerationPack } from "../GenerationPack";
import simpleGit, { SimpleGit } from "simple-git";
import consola from "consola";
import cliui from "cliui";
import { input, confirm } from "@inquirer/prompts";
import { execSync } from "child_process";
import { Listr } from "listr2";
import { Configuration, PackagerType } from "../../configuration/Configuration";
import clc from "cli-color";
import path from "path";

export default class DefaultGenerationPack extends GenerationPack {
  readonly name = "default";

  private readonly ui = cliui({ width: 100 }); // Wider UI for better readability
  private git: SimpleGit | null = null;

  private checkGitInstalled(): boolean {
    try {
      execSync("git --version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  private initGit(): void {
    if (!this.git) {
      this.git = simpleGit(process.cwd());
    }
  }

  private async setupGitRepository(projectName: string): Promise<void> {
    try {
      this.initGit();
      await this.git!.init();
      consola.info(clc.cyan("🔄 Cloning repository..."));
      await this.git!.clone(
        "https://github.com/accessibledn/accessibledn.git",
        projectName,
        ["--depth", "1"],
      );
    } catch (error) {
      consola.error(clc.red("💥 Failed to initialize Git repository:"), error);
      throw error;
    }
  }

  private async configureProject(projectName: string): Promise<void> {
    Configuration.initialize(path.join(process.cwd(), projectName)).set({
      packager: PackagerType.YARN,
    });
  }

  async generate(...args: any[]): Promise<void> {
    try {
      // Initial setup and validation
      this.displayWelcomeMessage();
      const gitInstalled = this.checkGitInstalled();
      const projectConfig = await this.getProjectConfiguration();

      if (projectConfig.shouldInitGit && !gitInstalled) {
        consola.error(
          clc.red(
            "⚠️  Git is not installed! Please install Git to continue with repository setup.",
          ),
        );
        return;
      }

      // Define and run tasks with better styling
      const tasks = new Listr(
        [
          {
            title: clc.cyan("🏗️  Setting up project structure"),
            task: () => this.initializeProject(projectConfig),
          },
          {
            title: clc.cyan("⚙️  Configuring project settings"),
            task: async () => {
              await this.configureProject(projectConfig.projectName);
              await new Promise((resolve) => setTimeout(resolve, 500));
            },
          },
        ],
        {
          concurrent: false,
        },
      );

      await tasks.run();
      this.displaySuccessMessage(projectConfig.projectName);
    } catch (error) {
      consola.error(clc.red("💥 Project initialization failed:"), error);
      throw error;
    }
  }

  private displayWelcomeMessage(): void {
    this.ui.div({
      text: clc.bold.cyan(
        "🚀 Welcome to AccessibleDN - Let's Build Something Amazing!",
      ),
      padding: [2, 0, 2, 0],
    });

    this.ui.div({
      text: clc.white(
        "We're excited to help you create an awesome accessible project.",
      ),
      padding: [0, 0, 1, 2],
    });

    console.log(this.ui.toString());
  }

  private async getProjectConfiguration() {
    const projectName = await input({
      message: clc.cyan("📝 What would you like to name your project?"),
      default: "accessible-dn-project",
    });

    const shouldInitGit = await confirm({
      message: clc.cyan(
        "🔄 Would you like to initialize Git for version control?",
      ),
      default: true,
    });

    return { projectName, shouldInitGit };
  }

  private async initializeProject(config: {
    projectName: string;
    shouldInitGit: boolean;
  }): Promise<void> {
    const { projectName, shouldInitGit } = config;

    if (!shouldInitGit) {
      consola.info(clc.yellow("ℹ️  Skipping Git initialization as requested"));
      return;
    }

    await this.setupGitRepository(projectName);
  }

  private displaySuccessMessage(projectName: string): void {
    const messages = [
      {
        text: clc.bold.green("✨ Success! Your project is ready to rock! ✨"),
        padding: [2, 0, 1, 0],
      },
      {
        text: clc.cyan("🎯 Next Steps Guide:"),
        padding: [1, 0, 1, 2],
      },
      {
        text: clc.white("1️⃣  Navigate to your project directory:"),
        padding: [1, 0, 0, 4],
      },
      {
        text: clc.yellow(`   $ cd ${projectName}`),
        padding: [0, 0, 1, 6],
      },
      {
        text: clc.white("2️⃣  Install dependencies:"),
        padding: [0, 0, 0, 4],
      },
      {
        text: clc.yellow("   $ yarn install"),
        padding: [0, 0, 1, 6],
      },
      {
        text: clc.white("3️⃣  Start development server:"),
        padding: [0, 0, 0, 4],
      },
      {
        text: clc.yellow("   $ yarn dev"),
        padding: [0, 0, 1, 6],
      },
      {
        text: clc.cyan(
          "🌟 Happy coding! If you need help, check out our docs or reach out to the community.",
        ),
        padding: [1, 0, 2, 2],
      },
    ];

    messages.forEach((msg) => this.ui.div(msg));
    console.log(this.ui.toString());
  }
}
