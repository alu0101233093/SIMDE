import { ExecutionStatus } from '../main-consts';
import { store } from '../store';
import {
    nextFunctionalUnitCycle,
    nextReserveStationCycle,
    nextReorderBufferCycle,
    batchActions,
    colorCell,
    superescalarLoad
} from '../interface/actions';

import { FunctionalUnitType } from '../core/Common/FunctionalUnit';

import { pushHistory, takeHistory, resetHistory } from '../interface/actions/history';
import { MAX_HISTORY_SIZE } from '../interface/reducers/machine';

import { t } from 'i18next';
import { Code } from '../core/Common/Code';
import { SequentialStatus } from '../core/Sequential/SequentialEnums';
import { displayBatchResults } from '../interface/actions/modals';

import { MachineIntegration } from './machine-integration';
import { Sequential } from '../core/Sequential/Sequential';

export class SequentialIntegration extends MachineIntegration {
    // Global objects for binding React to the View
    sequential = new Sequential();
    codeLoaded = false;
    interval = null;
    backStep = 0;
    stopCondition = ExecutionStatus.EXECUTABLE;
    finishedExecution = false;
    executing = false;
    replications = 0;
    cacheFailPercentage = 0;
    cacheFailLatency = 0;

    /*
    * This call all the components to update the state
    * if there is a step param, the components will use
    * their history to set the appropiate content
    */
    dispatchAllSequentialActions = (step?: number) => {
        
    }

    sequExe = (reset: boolean = true) => {
    }

    stepForward = () => {
        if (!this.sequential.code) {
            return;
        }

        let machineStatus = this.sequential.tic();
        this.dispatchAllSequentialActions();
        return machineStatus;
    }

    loadCode = (code: Code) => {
        this.sequential.code = code;
        this.resetMachine();
        // There is no need to update the code with the rest,
        // it should remain the same during all the program execution
        store.dispatch(superescalarLoad(code.instructions));
    }

    play = () => {

        if (!this.sequential.code) {
            return;
        }

        this.stopCondition = ExecutionStatus.EXECUTABLE;
        this.backStep = 0;
        this.executing = true;
        let speed = this.calculateSpeed();

        if (this.finishedExecution) {
            this.finishedExecution = false;
            let code = Object.assign(new Code(), this.sequential.code);
            this.sequExe();
            this.sequential.code = code;

            // Load memory content
            if (this.contentIntegration) {
                this.setFpr(this.contentIntegration.FPRContent);
                this.setGpr(this.contentIntegration.GPRContent);
                this.setMemory(this.contentIntegration.MEMContent);
            }
        }

        if (speed) {
            this.executionLoop(speed);
        } else {
            // tslint:disable-next-line:no-empty
            while (this.sequential.tic() !== SequentialStatus.SEQ_ENDEXE) { } // Creamos acciones para secuencial???
            this.dispatchAllSequentialActions();
            this.finishedExecution = true;
            alert(t('execution.finished'));
        }
    }

    makeBatchExecution = () => {
        if (!this.sequential.code) {
            return;
        }

        const results = [];
        for (let i = 0; i < this.replications; i++) {
            let code = Object.assign(new Code(), this.sequential.code);
            this.sequExe();
            this.sequential.code = code;
            this.sequential.memory.failProbability = this.cacheFailPercentage;
            this.sequential.memoryFailLatency = this.cacheFailLatency;

            // Load memory content
            if (this.contentIntegration) {
                this.setFpr(this.contentIntegration.FPRContent);
                this.setGpr(this.contentIntegration.GPRContent);
                this.setMemory(this.contentIntegration.MEMContent);
            }

            // tslint:disable-next-line:no-empty
            while (this.sequential.tic() !== SequentialStatus.SEQ_ENDEXE) { }
            results.push(this.sequential.status.cycle);
        }

        const statistics = this.calculateBatchStatistics(results);
        this.clearBatchStateEffects();
        store.dispatch(displayBatchResults(statistics));
    }

    pause = () => {
        this.stopCondition = ExecutionStatus.PAUSE;
        this.executing = false;
    }

    stop = () => {
        if (!this.sequential.code) {
            return;
        }
        // In normal execution I have to avoid the asynchrnous way of
        // js entering in the interval, the only way I have is to using a semaphore
        this.stopCondition = ExecutionStatus.STOP;

        if (!this.executing) {
            this.executing = false;
            this.resetMachine();
        }
    }

    stepBack = () => {
        // There is no time travelling for batch mode and initial mode
        if (this.sequential.status.cycle > 0 && this.backStep < MAX_HISTORY_SIZE &&
            (this.sequential.status.cycle - this.backStep > 0)) {
            this.backStep++;
            store.dispatch(takeHistory(this.backStep));
        }
    }

    setMemory = (data: { [k: number]: number }) => {
        if (this.sequential.status.cycle > 0) {
            return;
        }
        Object.keys(data).forEach(key => {
            this.sequential.memory.setDatum(+key, data[key]);
        });
    }

    setFpr = (data: { [k: number]: number }) => {
        if (this.sequential.status.cycle > 0) {
            return;
        }
        Object.keys(data).forEach(key => {
            this.sequential.fpr.setContent(+key, data[key], false);
        });
    }

    setGpr = (data: { [k: number]: number }) => {
        if (this.sequential.status.cycle > 0) {
            return;
        }
        Object.keys(data).forEach(key => {
            this.sequential.gpr.setContent(+key, data[key], false);
        });
    }

    executionLoop = (speed) => {
        if (!this.stopCondition) {
            setTimeout(() => {
                let machineStatus = this.stepForward();
                if (!(machineStatus === SequentialStatus.SEQ__BREAKPOINT || machineStatus === SequentialStatus.SEQ_ENDEXE)) {
                    this.executionLoop(speed);
                } else {
                    if (machineStatus === SequentialStatus.SEQ__BREAKPOINT) {
                        alert(t('execution.stopped'));
                    } else if (machineStatus === SequentialStatus.SEQ_ENDEXE) {
                        this.finishedExecution = true;
                        alert(t('execution.finished'));
                    }
                }
            }, speed);
        } else if (this.stopCondition === ExecutionStatus.STOP) {
            this.resetMachine();
        }
    }

    saveSeqConfig = (SeqConfig) => {
        // TODO: enforce this through a unique map so that we can overwrite the config directly

        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.INTEGERSUM,+SeqConfig["integerSumQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.INTEGERSUM,+SeqConfig["integerSumLatency"]);

        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.INTEGERMULTIPLY,+SeqConfig["integerMultQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.INTEGERMULTIPLY,+SeqConfig["integerMultLatency"]);

        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.FLOATINGSUM,+SeqConfig["floatingSumQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.FLOATINGSUM,+SeqConfig["floatingSumLatency"]);

        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.FLOATINGSUM,+SeqConfig["floatingSumQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.FLOATINGSUM,+SeqConfig["floatingSumLatency"]);

        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.FLOATINGMULTIPLY,+SeqConfig["floatingMultQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.FLOATINGMULTIPLY,+SeqConfig["floatingMultLatency"]);
        
        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.JUMP,+SeqConfig["jumpQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.JUMP,+SeqConfig["jumpLatency"]);
        
        this.sequential.setFunctionalUnitNumber(FunctionalUnitType.MEMORY,+SeqConfig["memoryQuantity"]);
        this.sequential.setFunctionalUnitLatency(FunctionalUnitType.MEMORY,+SeqConfig["memoryLatency"]);
        
        this.resetMachine();
    }

    setBatchMode = (replications: number, cacheFailLatency, cacheFailPercentage) => {
        this.replications = replications;
        this.cacheFailLatency = cacheFailLatency;
        this.cacheFailPercentage = cacheFailPercentage;
    }

    private resetMachine() {
        let code = Object.assign(new Code(), this.sequential.code);
        this.sequExe(true);
        this.sequential.code = code;

        // Reload memory content
        if (this.contentIntegration) {
            this.setFpr(this.contentIntegration.FPRContent);
            this.setGpr(this.contentIntegration.GPRContent);
            this.setMemory(this.contentIntegration.MEMContent);
        }
        this.dispatchAllSequentialActions();
        store.dispatch(resetHistory());
    }

    private calculateBatchStatistics(results: number[]) {
        const average = (results.reduce((a,b) => a + b) / results.length);
        return {
            replications:  this.replications,
            average: average.toFixed(2),
            standardDeviation: this.calculateStandardDeviation(average, results).toFixed(2),
            worst: Math.max(...results),
            best: Math.min(...results)
        };
    }

    private clearBatchStateEffects() {
        // Post launch machine clean
        this.sequential.memory.failProbability = 0;
        this.sequential.memoryFailLatency = 0;
        this.resetMachine();
    }
}

export default new SequentialIntegration();
