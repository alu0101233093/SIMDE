export const LOGEDIN = 'LOGEDIN';
export const LOGEDOUT = 'LOGEDOUT';
export const GETTER = 'GETTER';

export function userLoggedIn(userID) {
    return {
        type: LOGEDIN,
        value: userID
    };
}

export function userLoggedOut() {
    return {
        type: LOGEDOUT
    };
}