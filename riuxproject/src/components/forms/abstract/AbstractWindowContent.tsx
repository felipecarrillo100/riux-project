import * as React from 'react';

export interface AbstractWindowContentProps {
  parent?: JSX.Element;
  dataInit?: any;
}

export const WindowContentCloseParent = (props: AbstractWindowContentProps) => {
  const parent = props.parent as any;
  if (parent && parent.close) {
    parent.close();
  }
};

export const WindowContentSetTitle = (props: AbstractWindowContentProps, title: string) => {
  const parent = props.parent as any;
  if (parent && parent.setTitle) {
    parent.setTitle(title);
  }
};

class AbstractWindowContent<
  T extends AbstractWindowContentProps,
  S extends any
> extends React.Component<T, S> {
  constructor(props: any) {
    super(props);
    this.closeParent = this.closeParent.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  protected closeParent() {
    const myParent = this.props.parent as any;
    if (myParent && typeof myParent.close === 'function') {
      myParent.close();
    }
  }

  protected setParentTitle(title: string) {
    const myParent = this.props.parent as any;
    if (myParent && typeof myParent.setTitle === 'function') {
      myParent.setTitle(title);
    }
  }

  protected onCancel() {
    this.closeParent();
  }

  public canClose() {
    return new Promise<boolean>((resolve) => {
      // console.log("Can close was called!!")
      resolve(true);
    });
  }

  render() {
    return (
      <div>
        <label>This is an empty window, you need to implement the render</label>
      </div>
    );
  }
}

export default AbstractWindowContent;
