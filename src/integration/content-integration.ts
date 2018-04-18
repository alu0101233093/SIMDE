import { start } from 'repl';

export class ContentIntegration {

    public FPRContent: { [k: number]: number } = {};
    public GPRContent: { [k: number]: number } = {};
    public MEMContent: { [k: number]: number } = {};

    private currentContent: string = '';

    private _currentSelected;

    constructor(private input: string) {
        input = this.normalizeBreakLines(input);
        this.proccessContent(input.split('\n'));
    }

    normalizeBreakLines(input: string): string {
        return input.replace(/(?:\r\n|\r)/g, '\n');
    }

    proccessContent(lines: string[]) {
        this.currentContent = '';

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^#\w+/)) {
                this.parseContent(lines[i]);
            } else {
                this.parseLine(lines[i]);
            }
        }
    }

    parseContent(value: string) {
        switch (value) {
            case '#GPR':
                this.currentContent = 'GPRContent';
                break;
            case '#FPR':
                this.currentContent = 'FPRContent';
                break;
            case '#MEM':
                this.currentContent = 'MEMContent';
                break;
            default:
                throw new Error('Unexpected content type');
        }
    }

    parseLine(line: string) {
        const startPosition = +line.match(/\[(\d+)\]/)[1];
        let values: string[] | number[] = line.split(' ');
        values.shift();
        values.shift();
        values = values.map(v => +v);
        for (let i = 0; i < values.length; i++) {
            this[this.currentContent][startPosition + i] = values[i];
        }
    }
}
