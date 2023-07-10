export const ACTIVITYCODE = 'ACTIVITYCODE';

export function activityCodeUpdate(code) {
    return {
        type: ACTIVITYCODE,
        value: code
    };
}