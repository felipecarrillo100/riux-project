import {
  connect, DefaultRootState,
  DispatchProp,
  InferableComponentEnhancer, InferableComponentEnhancerWithProps,
  MapDispatchToPropsNonObject, MapDispatchToPropsParam,
  MapStateToPropsParam, MergeProps, Options, ResolveThunks
} from "react-redux";


export const connectForm = <S,T>(a: (state: any)=>S, b: (dispatch:any)=>T) => (c: any) => {
  return connect<S, T>( a, b, null, {forwardRef: true})(c);
}
