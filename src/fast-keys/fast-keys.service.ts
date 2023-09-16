import { uid } from 'uid/secure';

class FastKeysService {
  private static instance: FastKeysService | null = null;
  private keys: Map<string, Date> = new Map();

  private constructor() {}

  public static getInstance() {
    if (FastKeysService.instance) return FastKeysService.instance;
    return (FastKeysService.instance = new FastKeysService());
  }

  public generateKey(): string {
    const newKey: string = uid(6);
    return this.addKeyToMap(newKey);
  }

  public checkIfExisting(key: string): boolean {
    return !!this.keys.get(key);
  }

  public consumeKey(key: string): true {
    const deleteResult: boolean = this.keys.delete(key);
    if (!deleteResult)
      throw new Error(
        'This will be a domain error while deleting a key in consumeKey',
      );
    return true;
  }

  //todo to private below:
  public addKeyToMap(key: string): string {
    this.keys.set(key, new Date());
    const checkIfAdded: Date | undefined = this.keys.get(key);
    if (!checkIfAdded)
      throw new Error(
        'This will be a domain error while adding a fast key to map!',
      );
    return key;
  }
}

export default FastKeysService;
