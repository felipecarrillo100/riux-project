import { AppEvents } from './events';

interface IStringMap<T> {
  [key: string]: T;
}

type IAnyFunction = (...args: any[]) => any;

export type InterfaceActionUnion<
    A extends IStringMap<IAnyFunction>
    > = ReturnType<A[keyof A]>;

export const makeAction = <T extends AppEvents, P>(type: T) => (payload: P) => {
  return {
    type,
    payload,
  };
};

export const XMakeAction = <X, T extends X, P>(type: T) => (payload: P) => {
  return {
    type,
    payload,
  };
};
