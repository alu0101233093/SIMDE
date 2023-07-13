import { Machine } from '../Common/Machine';
import { Opcodes } from '../Common/Opcodes';
import { Code } from '../Common/Code';
import { Parser } from '../Common/Parser';

import { Queue } from '../Collections/Queue';
import { Instruction } from '../Common/Instruction';
import { FunctionalUnit, FunctionalUnitType, FUNCTIONALUNITTYPESQUANTITY } from '../Common/FunctionalUnit';
import { SequentialStatus } from './SequentialEnums';
import { Datum } from '../Common/Memory';

export class Sequential extends Machine {

    private _code: Code;
    private _currentInstruction : Instruction;
    private _currentInstCycle : number;

    constructor() {
        super();

        this._code = null;
        this._currentInstruction = null;
        this._currentInstCycle = 0;
    }

    init(reset: boolean) {
        super.init(reset);
        this._code = null;
        this._currentInstruction = null;
        this._currentInstCycle = 0;
    }

    private getLatencyForOperation() : number {
        switch (this._currentInstruction.opcode) {
            case Opcodes.ADD:
            case Opcodes.ADDI:
            case Opcodes.SUB:
            case Opcodes.SLLV:
            case Opcodes.SRLV:
            case Opcodes.AND:
            case Opcodes.OR:
            case Opcodes.NOR:
            case Opcodes.XOR:
                return this._functionalUnitLatencies[FunctionalUnitType.INTEGERSUM];
            case Opcodes.MULT:
                return this._functionalUnitLatencies[FunctionalUnitType.INTEGERMULTIPLY];
            case Opcodes.ADDF:
            case Opcodes.SUBF:
                return this._functionalUnitLatencies[FunctionalUnitType.FLOATINGSUM];
            case Opcodes.MULTF:
                return this._functionalUnitLatencies[FunctionalUnitType.FLOATINGMULTIPLY];
            case Opcodes.SF:
            case Opcodes.SW:
            case Opcodes.LW:
            case Opcodes.LF:
                return this._functionalUnitLatencies[FunctionalUnitType.MEMORY];
            case Opcodes.BEQ:
            case Opcodes.BGT:
            case Opcodes.BNE:
                return this._functionalUnitLatencies[FunctionalUnitType.JUMP];
            default:
                return 1;
        }
    }

    private runOperation() {
        //console.log("Executing: " + this._currentInstruction.toString());
        switch (this._currentInstruction.opcode) {
            case Opcodes.ADD:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) + this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.AND:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) & this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.OR:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) | this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.SUB:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) - this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.XOR: 
                this._gpr.setContent(this._currentInstruction.getOperand(0), ~ (this._gpr.getContent(this._currentInstruction.getOperand(1)) ^ this._gpr.getContent(this._currentInstruction.getOperand(2))), true);
                this.pc++;
                break;
            case Opcodes.NOR: 
                this._gpr.setContent(this._currentInstruction.getOperand(0), ~ (this._gpr.getContent(this._currentInstruction.getOperand(1)) | this._gpr.getContent(this._currentInstruction.getOperand(2))), true);
                this.pc++;
                break;
            case Opcodes.SLLV:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) << this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.SRLV:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) >> this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.MULT:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) * this._gpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.ADDI:
                this._gpr.setContent(this._currentInstruction.getOperand(0), this._gpr.getContent(this._currentInstruction.getOperand(1)) + this._currentInstruction.getOperand(2), true);
                this.pc++;
                break;
            case Opcodes.ADDF:
                this._fpr.setContent(this._currentInstruction.getOperand(0), this._fpr.getContent(this._currentInstruction.getOperand(1)) + this._fpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.SUBF:
                this._fpr.setContent(this._currentInstruction.getOperand(0), this._fpr.getContent(this._currentInstruction.getOperand(1)) - this._fpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.MULTF:
                this._fpr.setContent(this._currentInstruction.getOperand(0), this._fpr.getContent(this._currentInstruction.getOperand(1)) * this._fpr.getContent(this._currentInstruction.getOperand(2)), true);
                this.pc++;
                break;
            case Opcodes.SW:
                this._memory.setDatum(this._gpr.getContent(this._currentInstruction.getOperand(2)) + this._currentInstruction.getOperand(1), this._gpr.getContent(this._currentInstruction.getOperand(0)));
                this.pc++;
                break;
            case Opcodes.SF:
                this._memory.setDatum(this._gpr.getContent(this._currentInstruction.getOperand(2)) + this._currentInstruction.getOperand(1), this._fpr.getContent(this._currentInstruction.getOperand(0)));
                this.pc++;
                break;
            case Opcodes.LW:
                let datumInteger: Datum = this._memory.getDatum(this._gpr.getContent(this._currentInstruction.getOperand(2)) + this._currentInstruction.getOperand(1));
                this._gpr.setContent(this._currentInstruction.getOperand(0), datumInteger.datum, true);
                this.pc++;
                break;
            case Opcodes.LF:
                let datumFloat: Datum = this._memory.getDatum(this._gpr.getContent(this._currentInstruction.getOperand(2)) + this._currentInstruction.getOperand(1));
                this._fpr.setContent(this._currentInstruction.getOperand(0), datumFloat.datum, true);
                this.pc++;
                break;
            case Opcodes.BEQ:
                if (this._gpr.getContent(this._currentInstruction.getOperand(0)) === this._gpr.getContent(this._currentInstruction.getOperand(1))) {
                    this.pc = this.code.getBasicBlockInstruction(this._currentInstruction.getOperand(2));
                }
                else {
                    this.pc++;
                } 
                break;
            case Opcodes.BGT:
                if (this._gpr.getContent(this._currentInstruction.getOperand(0)) >= this._gpr.getContent(this._currentInstruction.getOperand(1))) {
                    this.pc = this.code.getBasicBlockInstruction(this._currentInstruction.getOperand(2));
                } 
                else {
                    this.pc++;
                } 
                break;
            case Opcodes.BNE:
                if (this._gpr.getContent(this._currentInstruction.getOperand(0)) !== this._gpr.getContent(this._currentInstruction.getOperand(1))) {
                    this.pc = this.code.getBasicBlockInstruction(this._currentInstruction.getOperand(2));
                } 
                else {
                    this.pc++;
                } 
                break;
            default:
                break;
        }
        this._gpr.setContent(0, 0, true);
    }
    
    tic(): SequentialStatus {
        //console.log("PC " + this.pc);
        //console.log("CYCLE " + this.status.cycle);
        // Instrucción no cargada
        if (this._currentInstCycle == 0) {
            this._currentInstruction = this.code.instructions[this.pc];
        }
        this._currentInstCycle++;
        if (this._currentInstCycle === this.getLatencyForOperation()) {
            this.runOperation();
            // Vuelvo a poner el contador de ciclos de instrucción a 0 para que cargue la siguiente instrucción al hacer "tic"
            this._currentInstCycle = 0;
        }

        this._gpr.tic();
        this._fpr.tic();

        this.status.cycle++;
        // Llegamos a la última línea de código
        if (this.pc === this.code.lines)
            return SequentialStatus.SEQ_ENDEXE;
        return SequentialStatus.SEQ__OK;
    }

    public get code(): Code {
        return this._code;
    }

    public set code(value: Code) {
        this._code = value;
    }
    
    public setFunctionalUnitNumber(index: number, quantity: number) {
        this.functionalUnitNumbers[index] = 1;
    }

}
