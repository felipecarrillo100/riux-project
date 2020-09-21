export type TAnyFunction = (...args: any[]) => void;

const throttle = (callback: TAnyFunction, wait: number) => {
    if (wait <= 0) {
        return callback;
    }

    let throttled = false;
    let scheduled = false;
    let latestThis: any;
    let latestArguments: any;
    return function () {
        latestThis = this;
        // eslint-disable-next-line prefer-rest-params
        latestArguments = arguments;

        if (!throttled) {
            // eslint-disable-next-line prefer-rest-params
            callback.apply(this, arguments);
            throttled = true;
        } else if (!scheduled) {
            setTimeout(()=>{
                callback.apply(latestThis, latestArguments);
                throttled = false;
                scheduled = false;
            }, wait);
            scheduled = true;
        }
    };
};

export default throttle;
