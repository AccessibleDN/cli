export abstract class GenerationPack {
  abstract readonly name: string;
  abstract generate(): Promise<void>;
}
