import { GenerationPack } from "../GenerationPack";
import simpleGit, { SimpleGit } from "simple-git";
import consola from "consola";
import cliui from "cliui";
import { input, confirm } from "@inquirer/prompts";
import { execSync } from "child_process";

export default class DefaultGenerationPack extends GenerationPack {
  readonly name = "default";

  private readonly ui = cliui({ width: 80 });
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

  async generate(): Promise<void> {
    // Initialize UI early to avoid layout shifts
    this.displayWelcomeMessage();

    // Get config in parallel with git check
    const [projectConfig, isGitInstalled] = await Promise.all([
      this.getProjectConfiguration(),
      Promise.resolve(this.checkGitInstalled()),
    ]);

    if (projectConfig.shouldInitGit && !isGitInstalled) {
      consola.error(
        "Git is not installed! Please install Git to continue with repository setup.",
      );
      return;
    }

    await this.initializeProject({
      ...projectConfig,
      shouldInitGit: projectConfig.shouldInitGit && isGitInstalled,
    });

    this.displaySuccessMessage();
  }

  private displayWelcomeMessage(): void {
    this.ui.div({
      text: "🔥 Let's create something awesome with AccessibleDN!",
      padding: [1, 0, 1, 0],
    });
  }

  private async getProjectConfiguration() {
    // Run prompts in parallel for faster response
    const [projectName, shouldInitGit] = await Promise.all([
      input({
        message: "Drop a cool name for your project:",
        default: "accessible-dn-project",
      }),
      confirm({
        message: "Want to set up Git? (It's lit! 🔥)",
        default: true,
      }),
    ]);

    return { projectName, shouldInitGit };
  }

  private async initializeProject({
    projectName,
    shouldInitGit,
  }: {
    projectName: string;
    shouldInitGit: boolean;
  }): Promise<void> {
    if (!shouldInitGit) {
      consola.info("No Git? No prob! Skipping that part... 👌");
      return;
    }

    consola.info("Setting up your Git repo... 🚀");

    try {
      this.initGit();
      await this.git!.clone(
        "https://github.com/accessibledn/accessibledn.git",
        projectName,
        ["--depth", "1"], // Shallow clone for faster download
      );
    } catch (error) {
      consola.error("Oof! Couldn't set up the repo:", error);
      throw error;
    }
  }

  private displaySuccessMessage(): void {
    // Prepare all UI elements at once to reduce iterations
    const messages = [
      {
        text: "✨ Project initialized successfully! Let's build something amazing!",
        padding: [1, 0, 1, 0],
      },
      {
        text: "🚀 Ready to Rock? Here's Your Setup Guide:",
        padding: [1, 0, 0, 2],
      },
      {
        text: "📂 First up, jump into your project folder:",
        padding: [1, 0, 0, 2],
      },
      {
        text: "   cd <project-name>",
        padding: [0, 0, 0, 2],
      },
      {
        text: "📦 Time to grab those awesome dependencies:",
        padding: [1, 0, 0, 2],
      },
      {
        text: "   yarn install",
        padding: [0, 0, 0, 2],
      },
      {
        text: "🔥 Fire up your development environment:",
        padding: [1, 0, 0, 2],
      },
      {
        text: "   yarn dev",
        padding: [0, 0, 1, 2],
      },
    ];

    // Single batch update for UI
    messages.forEach((msg) => this.ui.div(msg));
    console.log(this.ui.toString());
  }
}
