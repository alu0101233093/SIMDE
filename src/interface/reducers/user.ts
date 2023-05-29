export interface UserState {
    userID: string;
    logged: boolean;
}

const initialState: UserState = { userID: "", logged: false };

export function UserReducers(state = initialState, action) {
    switch (action.type) {
      case "LOGEDIN":
        return { ...state, userID: action.value, logged: true };
      case "LOGEDOUT":
        return { ...state, userID: "", logged: false };
      default:
        return state;
    }
  }