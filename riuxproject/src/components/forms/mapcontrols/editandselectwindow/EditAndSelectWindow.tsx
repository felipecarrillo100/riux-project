import * as React from 'react';
import AbstractWindowContent, {
    AbstractWindowContentProps,
} from '../../abstract/AbstractWindowContent';
import EditAndMeasureRedux from "../../../luciad/luciadmap/controls/editandmeasure/EditAndMeasureRedux";
import {EditAndMeasureIconProvider} from "../../../luciad/luciadmap/controls/editandmeasure/EditAndMeasureIconProvider";

class EditAndSelectWindow extends AbstractWindowContent<AbstractWindowContentProps, any> {
    constructor(props: any) {
        super(props);
        this.setParentTitle('Edit & Measure');
    }

    render(): any {
        return (
            <div style={{padding: 10}}>
                <EditAndMeasureRedux  iconProvider={EditAndMeasureIconProvider}/>
            </div>
        );
    }
}

export default EditAndSelectWindow;
