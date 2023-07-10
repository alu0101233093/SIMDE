export interface ActivityState {
    code: string;
}

const initialState: ActivityState = { code: "" };

export function ActivityReducers(state = initialState, action) {
    switch (action.type) {
      case "ACTIVITYCODE":
        return { ...state, code: action.value};
      default:
        return state;
    }
  }