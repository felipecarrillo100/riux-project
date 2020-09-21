import * as React from 'react';
import SampleForm1 from './sample/SampleForm1';
import SampleForm2 from './sample/SampleForm2';
import FormProvider from "./FormProvider";
import LanyerManagerWindow from "./mapcontrols/layermanagerwindow/LayerManagerWindow";
import EditAndSelectWindow from "./mapcontrols/editandselectwindow/EditAndSelectWindow";
import ConfirmationForm from "./modals/ConfirmationForm";


export enum BasicFormRecords {
  SampleForm1 = 'SampleForm1',
  SampleForm2 = 'SampleForm2',
  LayerManager = 'LayerManager',
  EditAndMeasureTools = 'EditAndMeasureTools',
  ModalConfirm = 'ModalConfirm',
}

class BasicForms {
  public static RegisterForms() {
    FormProvider.registerForm({
      name: BasicFormRecords.SampleForm1,
      form: <SampleForm1 />,
    });
    FormProvider.registerForm({
      name: BasicFormRecords.SampleForm2,
      form: <SampleForm2 />,
    });
    FormProvider.registerForm({
      name: BasicFormRecords.LayerManager,
      form: <LanyerManagerWindow />,
    });
    FormProvider.registerForm({
      name: BasicFormRecords.EditAndMeasureTools,
      form: <EditAndSelectWindow />,
    });

    FormProvider.registerForm({
      name: BasicFormRecords.ModalConfirm,
      form: <ConfirmationForm />,
    });
  }
}

export default BasicForms

