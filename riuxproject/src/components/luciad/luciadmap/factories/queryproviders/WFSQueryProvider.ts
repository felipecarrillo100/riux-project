import { QueryProvider } from '@luciad/ria/view/feature/QueryProvider';

export const TypicalWfsScaleRanges = [
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

export const TypicalWFSScaleQueries = [] as any;
for (let i = 0; i < TypicalWfsScaleRanges.length; ++i) {
  TypicalWFSScaleQueries.push({ filter: FILTER_NO_RESTRICTIONS });
}
TypicalWFSScaleQueries.push({ filter: FILTER_NO_RESTRICTIONS });

interface WMSQueryProviderOptions {
  scaleRanges?: any;
  queries?: any;
  maxFeatures?: any;
}

class WFSQueryProvider extends QueryProvider {
  private static setMaxFeatures(inScaleRanges: any[], maxFeatures: number) {
    const scaleRanges = [] as any;
    for (const range of inScaleRanges) {
      const newRange = { filter: range.filter, maxFeatures };
      scaleRanges.push(newRange);
    }
    return scaleRanges;
  }

  private maxFeatures: number;
  private scaleRanges: undefined;
  private queries: { name: string; range: any; value: any }[];

  constructor(options: WMSQueryProviderOptions) {
    super();
    options = options ? options : {};
    this.maxFeatures = options.maxFeatures ? options.maxFeatures : 500;
    this.scaleRanges = options.scaleRanges
      ? options.scaleRanges
      : TypicalWfsScaleRanges;
    this.queries = options.queries
      ? WFSQueryProvider.setMaxFeatures(options.queries, this.maxFeatures)
      : WFSQueryProvider.setMaxFeatures(
          TypicalWFSScaleQueries,
          this.maxFeatures
        );
  }

  getQueryForLevel(level: number): any {
    return this.queries[level];
  }

  getQueryLevelScales(): number[] {
    return this.scaleRanges as any;
  }
}

export default WFSQueryProvider;
