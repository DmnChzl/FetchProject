interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private ttl: number) {}

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  getAll(): Array<T> {
    const now = Date.now();
    let values: Array<T> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      } else {
        values = [...values, entry.value];
      }
    }

    return values;
  }

  set(key: string, value: T) {
    const expiresAt = Date.now() + this.ttl;
    this.cache.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  expire(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.set(key, {
        value: entry.value,
        expiresAt: Date.now(),
      });
    }
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export default SimpleCache;
