import { combineReducers } from 'redux'
import { MachineReducers } from './machine'
import { UiReducers } from './ui'
import { UserReducers } from './user'

export default combineReducers({
    Machine: MachineReducers,
    Ui: UiReducers,
    User: UserReducers
})
