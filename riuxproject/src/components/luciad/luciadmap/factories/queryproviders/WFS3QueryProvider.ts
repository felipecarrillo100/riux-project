import { QueryProvider } from '@luciad/ria/view/feature/QueryProvider';

export const TypicalWmsScaleRanges = [
  1.0 / 4.0e6,
  1.0 / 2.0e6,
  1.0 / 1.0e6,
  1.0 / 5.0e5,
  1.0 / 2.5e5,
  1.0 / 1.5e7,
  1.0 / 7.0e4,
  1.0 / 3.5e4,
  1.0 / 1.5e4,
  1.0 / 8.0e3,
  1.0 / 4.0e3,
  1.0 / 2.0e3,
  1.0 / 1.0e3,
  1.0 / 5.0e2,
];

const FILTER_NO_RESTRICTIONS: any = null;

export const TypicalWMSScaleQueries = [] as any;
for (let i = 0; i < TypicalWmsScaleRanges.length; ++i) {
  TypicalWMSScaleQueries.push({ filter: FILTER_NO_RESTRICTIONS });
}
TypicalWMSScaleQueries.push({ filter: FILTER_NO_RESTRICTIONS });

interface WFS3QueryProviderOptions {
  scaleRanges?: any;
  queries?: any;
  limit?: number | undefined;
}

class WFS3QueryProvider extends QueryProvider {
  private static setLimit(inScaleRanges: any[], limit: number | undefined) {
    const scaleRanges = [] as any;
    for (const range of inScaleRanges) {
      const newRange = { filter: range.filter, limit };
      scaleRanges.push(newRange);
    }
    return scaleRanges;
  }

  private limit: number | undefined;
  private scaleRanges: undefined;
  private queries: { name: string; range: any; value: any }[];

  constructor(options: WFS3QueryProviderOptions) {
    super();
    options = options ? options : {};
    this.limit = options.limit ? options.limit : undefined;
    this.scaleRanges = options.scaleRanges
      ? options.scaleRanges
      : TypicalWmsScaleRanges;
    this.queries = options.queries
      ? WFS3QueryProvider.setLimit(options.queries, this.limit)
      : WFS3QueryProvider.setLimit(TypicalWMSScaleQueries, this.limit);
  }

  getQueryForLevel(level: number): any {
    return this.queries[level];
  }

  getQueryLevelScales(): number[] {
    return this.scaleRanges as any;
  }
}

export default WFS3QueryProvider;
