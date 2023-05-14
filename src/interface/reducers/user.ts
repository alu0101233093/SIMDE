export interface UserState {
    userEmail: string;
    logged: boolean;
}

const initialState: UserState = { userEmail: "", logged: false };

export function UserReducers(state = initialState, action) {
    switch (action.type) {
      case "LOGEDIN":
        return { ...state, userEmail: action.value, logged: true };
        case "LOGEDOUT":
            return { ...state, userEmail: "", logged: false };
      default:
        return state;
    }
  }