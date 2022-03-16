import * as Editor from './editor';

const EXE_FREQ = 50;
global.currVM = null;

export const [NULL, LIST, STR, BOOL, INT, REAL] = [
    'null', 'List', 'string', 'boolean', 'integer', 'real'
].map(e => (val = null) => new DonkeyObject(e, val));

// used for testing/debugging only
function sanityError(msg) {
    return [
        `Internal Error: ${msg}`,
        'Report to David cuz hes dumb enough to mess up a simple runtime'
    ];
}

/*
    Denotes what's conventionally a heap allocated object but
    that's basically every value in this runtime implementation
    cuz weeeeeeeeeeeeeeeeeeeeeeeee.
*/
export class DonkeyObject {

    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    /*
        Primitives (real, boolean, int, string) are passed by value
        while other ones are passed by reference. This is simulated
        by just duplicating an instance of a primitive. Primitive
        types have lower case type names (as lazy as that is).

        Note that when defining a primitive type, make sure its
        value is passed-by-value in javascript.
    */
    copy() {
        const char = this.type.charAt(0);
        if (char === char.toUpperCase()) {
            return this;
        }
        return new DonkeyObject(this.type, this.value);
    }

    assertType(s, msg) {
        if (s === 'number') {
            if (this.type !== 'integer' && this.type !== 'real') {
                throw new VMError(`Type Error`, msg);
            }

            return;
        }

        if (s !== this.type) throw new VMError(`Type Error`, msg);
    }

    bool() {
        this.assertType(
            'boolean',
            `Type ${this.type} cannot be interpreted as a boolean`
        );
        return this.value;
    }

    map(func) {
        return new DonkeyObject(this.type, func(this.value));
    }
}

class AbstractFunction {

    constructor(params) {
        this.params = params;
    }

    invoke(vm, exps) {
        throw 'not implemented';
    }
}

class CodeFunction extends AbstractFunction {

    constructor(params, code) {
        super(params);
        this.code = code;
    }

    invoke(vm, exps) {
        const frame = new FunctionFrame(this.code);

        // sanity check
        if (exps.length !== this.params.length) {
            throw sanityError('Bad parameter length during invocation');
        }

        for (var i = 0; i < exps.length; i++) {
            frame.locals[this.params[i]] = exps[i];
        }

        vm.funcFrames.push(frame);
    }
}

export class NativeFunction extends AbstractFunction {

    constructor(params, wrapped) {
        super(params);
        this.wrapped = wrapped;
    }

    invoke(vm, exps, line) {
        this.wrapped(vm, exps, line);
    }
}

class FunctionFrame {

    constructor(code) {
        this.pc = 0;
        this.locals = {};
        this.code = code; // cuz im lazy yaaaaaaaaay
    }

    execute(runtime) {
        const op = this.code[this.pc];
        this.pc++;
        op.execute(runtime, this);
    }
}

export class DonkeyRuntime {

    constructor(funcs, debugMode, handles) {
        this.funcFrames = [];
        this.stack = [];
        this.mainEnv = {};
        this.debugMode = debugMode;
        this.handles = handles;

        this.funcs = {};
        for (var i of funcs) {
            this.funcs[i.name] = new CodeFunction(i.params, i.code);
        }
    }

    runMain(main='$main') {
        if (global.currVM !== null) {
            console.log('Another runtime is running!');
            return;
        }

        const frame = new FunctionFrame(this.funcs[main].code);
        this.mainEnv = frame.locals;

        this.funcFrames.push(frame);

        global.currVM = setInterval(() => {
            for (var i = 0; i < EXE_FREQ && this.funcFrames.length > 0; i++) {
                try {
                    this.currFrame().execute(this);
                } catch (error) {
                    if (error instanceof VMError) {
                        this.handles.error(error.formatMsg(this));
                        return;
                    } else {
                        this.handles.error([
                            'Unexpected Internal Error',
                            'Check log and report to author'
                        ]);
                        throw error;
                    }
                }
            }

            if (this.funcFrames.length === 0) {
                this.handles.exit();
            }
        }, 1);
    }

    currFrame() {
        return this.funcFrames[this.funcFrames.length - 1];
    }

    push(val) {
        this.stack.push(val.copy());
    }

    pop() {
        if (this.stack.length === 0) {
            throw sanityError('Runtime Empty Stack');
        }

        return this.stack.pop().copy();
    }
}

export class VMError {

    constructor(type, msg) {
        this.type = type;
        this.msg = msg;
    }

    formatMsg(vm) {
        const currFrame = vm.currFrame();
        /*
            ptr - 1 to get the innstruction that was just executed as the
            ptr is incremented before executing an instruction
        */
        const prevIdx = currFrame.pc - 1;
        return [
            `${this.type}: Line ${currFrame.code[prevIdx].line.line}`,
            this.msg
        ];
    }
}
