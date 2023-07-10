import { combineReducers } from 'redux'
import { MachineReducers } from './machine'
import { UiReducers } from './ui'
import { UserReducers } from './user'
import { ActivityReducers } from './activity'

export default combineReducers({
    Machine: MachineReducers,
    Ui: UiReducers,
    User: UserReducers,
    Activity: ActivityReducers
})
