interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private entries = new Map<string, CacheEntry<T>>();

  constructor(private ttl: number) {}

  get(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T) {
    const expiresAt = Date.now() + this.ttl;
    this.entries.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  expire(key: string) {
    const entry = this.entries.get(key);
    if (entry) {
      this.entries.set(key, {
        value: entry.value,
        expiresAt: Date.now(),
      });
    }
  }

  clear() {
    this.entries.clear();
  }

  size() {
    return this.entries.size;
  }
}

export default SimpleCache;
