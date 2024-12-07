export abstract class GenerationPack {
  abstract readonly name: string;
  abstract generate(...args: any[]): Promise<void>;
}
