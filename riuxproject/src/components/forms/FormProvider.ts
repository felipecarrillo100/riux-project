interface FormRecord {
  name: string;
  form: JSX.Element;
}

class FormProvider {
  private static formRegister: FormRecord[] = [];

  // Registers a form,  if the form already exists it is replaced.
  public static registerForm(formRecord: FormRecord) {
    const index = FormProvider.findFormIndexByName(name);
    if (index === -1) {
      FormProvider.formRegister.push(formRecord);
      return true;
    } else {
      if (FormProvider.unregisterForm(formRecord.name)) {
        if (FormProvider.registerForm(formRecord)) {
          return true;
        }
      }
    }
    return false;
  }
  public static unregisterForm(name: string) {
    const index = FormProvider.findFormIndexByName(name);
    if (index > -1) {
      FormProvider.formRegister.splice(index, 1);
      return true;
    }
    return false;
  }
  public static retrieveForm(name: string) {
    const form = FormProvider.findFormByName(name);
    return form ? form.form : null;
  }

  private static findFormIndexByName(name: string) {
    return FormProvider.formRegister.findIndex((item) => item.name === name);
  }
  private static findFormByName(name: string) {
    return FormProvider.formRegister.find((item) => item.name === name);
  }
}

export default FormProvider;
