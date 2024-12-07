import { readFileSync, writeFileSync } from "fs";
import { dump, load } from "js-yaml";
import { join } from "path";
import { consola } from "consola";
import clc from "cli-color";

export enum PackagerType {
  NPM = "npm",
  YARN = "yarn",
}

interface ConfigurationOptions {
  packager?: PackagerType;
}

export class Configuration {
  private static readonly CONFIG_FILE = ".accessibledrc.yml";
  private static instance: Configuration;
  private config: ConfigurationOptions;

  private constructor() {
    this.config = {};
  }

  public static getInstance(): Configuration | undefined {
    if (!Configuration.instance) {
      return undefined;
    }
    return Configuration.instance;
  }

  public static initialize(): Configuration {
    let config = Configuration.getInstance();
    if (!config) {
      config = new Configuration();
    }

    const configPath = join(process.cwd(), this.CONFIG_FILE);

    try {
      const fileContents = readFileSync(configPath, "utf8");
      const loadedConfig = load(fileContents) as ConfigurationOptions;
      config.set(loadedConfig);
    } catch (error) {
      config.save();
    }

    return config;
  }

  public save(): void {
    const configPath = join(process.cwd(), Configuration.CONFIG_FILE);

    try {
      if (Object.keys(this.config).length === 0) {
        writeFileSync(configPath, "", "utf8");
      } else {
        writeFileSync(configPath, dump(this.config, { indent: 2 }), "utf8");
      }
      consola.success(clc.green("✅ Configuration saved successfully"));
    } catch (error) {
      consola.error(clc.red("💥 Failed to save configuration:"), error);
      throw error;
    }
  }

  public get<K extends keyof ConfigurationOptions>(
    key?: K,
  ): ConfigurationOptions[K] | ConfigurationOptions {
    return key ? this.config[key] : this.config;
  }

  public set(options: Partial<ConfigurationOptions>): void {
    this.config = {
      ...this.config,
      ...options,
    };
    this.save();
  }

  public delete<K extends keyof ConfigurationOptions>(key: K): void {
    delete this.config[key];
    this.save();
  }

  public clear(): void {
    this.config = {};
    this.save();
  }
}
