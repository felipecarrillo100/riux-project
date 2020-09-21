import { Menu } from 'react-contexify';

class MenuCustom extends Menu {
  public showProgramatically(options: any, props: any) {
    let defaultOptions = {} as any;
    if (options && options.event) {
      defaultOptions = options.event;
    } else {
      defaultOptions = {
        altKey: false,
        bubbles: true,
        button: 2,
        buttons: 0,
        cancelBubble: false,
        cancelable: true,
        clientX: options.x,
        clientY: options.y,
        composed: true,
        ctrlKey: false,
        currentTarget: document,
        defaultPrevented: true,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        stopPropagation: () => {},
        type: 'mycontextmenuevent',
      } as any;
    }

    const { x, y } = this.getMousePosition(defaultOptions);

    setTimeout(() => {
      this.setState(
        {
          nativeEvent: defaultOptions,
          propsFromTrigger: props,
          visible: true,
          x,
          y,
        },
        this.setMenuPosition
      );
    }, 1);
  }
}

export default MenuCustom;
