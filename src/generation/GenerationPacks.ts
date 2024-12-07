import DefaultGenerationPack from "./packs/DefaultGenerationPack";
import { GenerationPack } from "./GenerationPack";

export class GenerationPacks {
  private static readonly packs = new Map<string, GenerationPack>();

  static initialize(): void {
    this.packs.set(
      new DefaultGenerationPack().name,
      new DefaultGenerationPack(),
    );
  }

  static registerPack(pack: GenerationPack): void {
    this.packs.set(pack.name, pack);
  }

  static getPack(name: string): GenerationPack | undefined {
    return this.packs.get(name);
  }

  static getPacks(): ReadonlyMap<string, GenerationPack> {
    return this.packs;
  }
}
