import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface JSONLike {
  [key: string]: any;
}

import { Feature } from '@luciad/ria/model/feature/Feature';

import FeatureBalloonItem from './internal/FeatureBalloonItem';

interface Props {
  feature: Feature;
}

class FeatureRenderer extends React.Component<Props> {
  public static createFeatureHtmlNode(feature: Feature) {
    const newDiv = document.createElement('div');
    ReactDOM.render(
      <FeatureRenderer feature={feature} />,
      newDiv as HTMLElement
    );
    return newDiv;
  }

  public render() {
    const items = [] as any;
    let myProperties;
    if (Array.isArray(this.props.feature.properties)) {
      myProperties = this.props.feature.properties;
    } else {
      myProperties = [this.props.feature.properties];
    }

    for (const propertiesSet of myProperties) {
      const obj = propertiesSet as JSONLike;
      let index = 0;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          index++;
          items.push(
            <li key={index}>
              <FeatureBalloonItem propertyName={key} property={obj[key]} />
            </li>
          );
        }
      }
    }

    // Style expected : style={{padding: 0, listStyleType: "none"}}
    return (
      <React.Fragment>
        <h1>Feature Properties</h1>
        <ul>{items}</ul>
      </React.Fragment>
    );
  }
}

export default FeatureRenderer;
