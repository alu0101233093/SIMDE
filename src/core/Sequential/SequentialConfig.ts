export class FunctionalUnitConfig {
    number: number;
    latency: number;
}

export class SequentialConfig {
    integerSum?: FunctionalUnitConfig;
    integerMult?: FunctionalUnitConfig;
    floatingSum?: FunctionalUnitConfig;
    floatingMult?: FunctionalUnitConfig;
    memory: FunctionalUnitConfig;
    cacheFailureLatency: number;
    jumpLatency: number;
}
