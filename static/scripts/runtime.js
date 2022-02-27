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

    constructor(funcs) {
        this.funcFrames = [];
        this.stack = [];
        this.funcs = funcs;
        this.mainEnv = {};
    }

    runMain(main='$main') {
        const func = this.getFunc(main);
        const frame = new FunctionFrame(func.code);

        while (this.funcFrames.length !== 0) {
            this.funcFrames[this.funcFrames.length - 1].execute(this);
        }
    }

    getFunc(name) {
        if (!(name in this.funcs)) {
            //TODO: native func loading
            throw `Function ${name} is undefined`;
        }

        return this.funcs[name];
    }
}

function loadRuntime(funcs) {
    const runtime = new DonkeyRuntime(funcs);


}
