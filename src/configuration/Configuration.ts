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
  private basedir: string;

  private constructor(basedir?: string) {
    this.config = {};
    this.basedir = basedir || process.cwd();
  }

  public static getInstance(): Configuration | undefined {
    if (!Configuration.instance) {
      return undefined;
    }
    return Configuration.instance;
  }

  public static initialize(basedir?: string): Configuration {
    let config = Configuration.getInstance();
    if (!config) {
      config = new Configuration(basedir);
      Configuration.instance = config;
    }

    const configPath = join(config.basedir, this.CONFIG_FILE);

    try {
      const fileContents = readFileSync(configPath, "utf8");
      const loadedConfig = load(fileContents) as ConfigurationOptions;
      config.set(loadedConfig);
    } catch (error) {
      config.save();
    }

    return config;
  }

  public save(): Configuration {
    const configPath = join(this.basedir, Configuration.CONFIG_FILE);

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
    return this;
  }

  public get<K extends keyof ConfigurationOptions>(
    key?: K,
  ): ConfigurationOptions[K] | ConfigurationOptions {
    return key ? this.config[key] : this.config;
  }

  public set(options: Partial<ConfigurationOptions>): Configuration {
    this.config = {
      ...this.config,
      ...options,
    };
    this.save();
    return this;
  }

  public delete<K extends keyof ConfigurationOptions>(key: K): Configuration {
    delete this.config[key];
    this.save();
    return this;
  }

  public clear(): Configuration {
    this.config = {};
    this.save();
    return this;
  }
}
