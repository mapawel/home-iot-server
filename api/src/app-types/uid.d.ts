declare module 'api/src/app-types/uid' {
    function uid(length?: number): string;

    export {uid};
}

declare module 'uid/secure' {
    function uid(length?: number): string;

    export {uid};
}

declare module 'uid/single' {
    function uid(length?: number): string;

    export {uid};
}
