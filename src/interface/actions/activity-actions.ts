export const ACTIVITYCODE = 'ACTIVITYCODE';
export const ACTIVIYDATA = 'ACTIVIYDATA';

export function activityCodeUpdate(code) {
    return {
        type: ACTIVITYCODE,
        value: code
    };
}

export function activityDataUpdate(data) {
    return {
        type: ACTIVIYDATA,
        value: data
    };
}