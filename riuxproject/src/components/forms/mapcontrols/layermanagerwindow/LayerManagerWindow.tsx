import * as React from 'react';
import AbstractWindowContent, {
  AbstractWindowContentProps,
} from '../../abstract/AbstractWindowContent';
import LayerControlRedux from "../../../luciad/luciadmap/controls/layercontrol/LayerControlRedux";

class LanyerManagerWindow extends AbstractWindowContent<AbstractWindowContentProps, any> {
  constructor(props: any) {
    super(props);
    this.setParentTitle('Layer Manager');
  }

  render(): any {
    return (
    <div style={{width: 360, height: 240, padding: 4, paddingBottom: 5}}>
      <LayerControlRedux  />
    </div>
    );
  }
}

export default LanyerManagerWindow;
