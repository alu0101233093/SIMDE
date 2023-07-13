interface Group {
  actualPhase: number
  files: Record<string,string>
  participants: Record<string,string>
  score: number
}

interface Activity {
  tittle: string
  evaluation: string
  groups: Record<string, Group>
  private: boolean
  tasks: Record<string, string>
  machine: string
  minNumParticipants: number
  maxNumParticipants: number
}

export interface ActivityState {
    code: string;
    data: Activity
}

const initialState: ActivityState = { code: "", data: {
  tittle: "",
  evaluation: "",
  groups: {},
  private: false,
  tasks: {},
  machine: "",
  minNumParticipants: 0,
  maxNumParticipants: 0,
}};

export function ActivityReducers(state = initialState, action) {
    switch (action.type) {
      case "ACTIVITYCODE":
        return { ...state, code: action.value};
      case "ACTIVIYDATA":
        return { ...state, data: action.value};
      default:
        return state;
    }
  }