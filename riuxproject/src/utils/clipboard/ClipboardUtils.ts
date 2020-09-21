class ClipboardUtils {
    private static MyPrivateClipboard: string;

    public static copyTextToClipboard(text: string, onSuccess?:any, onFailure?:any) {
        function fallbackCopyTextToClipboard (t: string) {
            const textArea = document.createElement("textarea");
            textArea.value = t;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                const msg = successful ? 'successful' : 'unsuccessful';
                const message =  'Copying text command was ' + msg;
                // tslint:disable-next-line:no-console
                console.log('Fallback: ' + message);
                if (onSuccess) {
                    onSuccess(message);
                }
            } catch (err) {
                const message = 'Oops, unable to copy: ' + err;
                // tslint:disable-next-line:no-console
                console.error('Fallback: ', message);
                if (onFailure) {
                    onFailure(message);
                }
            }
            document.body.removeChild(textArea);
        }
        // main
        ClipboardUtils.MyPrivateClipboard = text;
        const nav = navigator as any;
        if (!nav.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        nav.clipboard.writeText(text).then(() => {
            const message = "Copying to clipboard was successful!";
            // tslint:disable-next-line:no-console
            console.log('Async: ' + message);
            if (onSuccess) {
                onSuccess(message);
            }
        }, (err: any) => {
            const message = "Could not copy text: " + err;
            // tslint:disable-next-line:no-console
            console.error('Async: '+ message);
            if (onFailure) {
                onFailure(message);
            }
        });
    }

    public static getTextFromClipboard() {
        return new Promise<string>((resolve, reject) => {
            const WINDOW = navigator as any;
            if(WINDOW && WINDOW.clipboard&& WINDOW.clipboard.readText) {
                const whenText = WINDOW.clipboard.readText();
                whenText.then((text:any)=>{
                    resolve(text);
                }, (e:any)=>{
                    resolve(ClipboardUtils.MyPrivateClipboard);
                });
            } else {
                resolve(ClipboardUtils.MyPrivateClipboard);
            }
        })
    }
}

export default ClipboardUtils
