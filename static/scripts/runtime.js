class FunctionFrame {

    constructor(code) {
        this.pc = 0;
        this.locals = {};
        this.code = code; // cuz im lazy yaaaaaaaaay
    }

    execute(runtime) {
        const op = this.code[this.pc];
        this.pc++;
        op.execute(runtime);
    }
}

class DonkeyRuntime {

    constructor() {
        this.funcFrames = [];
        this.stack = [];
        this.funcs = {};
        this.mainEnv = {};
    }
}
