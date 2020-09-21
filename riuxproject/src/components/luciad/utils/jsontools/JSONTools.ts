// eslint-disable-next-line @typescript-eslint/no-var-requires
const lodash: any = require('./lodash.get');

const JSONTools = {
  getValue: (obj: any, prop: string, defValue?: any): any => {
    return lodash.get(obj, prop, defValue);
  },
};

export default JSONTools;
