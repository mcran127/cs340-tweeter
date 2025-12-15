export class DataPage<T> {
  values: T[];
  hasMorePages: boolean;
  nextKey?: string;

  constructor(values: T[], nextKey?: string) {
    this.values = values;
    this.nextKey = nextKey;
    this.hasMorePages = nextKey !== undefined;
  }
}
