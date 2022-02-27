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
        this.mainEnv = {};

        this.funcs = {};
        for (var i of funcs) {
            this.funcs[i.name] = {
                params: i.params,
                code: i.code
            };
        }
    }

    runMain(main='$main') {
        const func = this.funcs[main];
        const frame = new FunctionFrame(func.code);
        this.funcFrames.push(frame);

        while (this.funcFrames.length !== 0) {
            this.curr().execute(this);
        }
    }

    curr() {
        return this.funcFrames[this.funcFrames.length - 1];
    }
}

function loadRuntime(funcs) {
    return new DonkeyRuntime(funcs);
}
