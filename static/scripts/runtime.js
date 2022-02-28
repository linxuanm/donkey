const EXE_FREQ = 20;
let currVM = null;

function NULL() {
    return new DonkeyObject('null', null);
}

function LIST(arr) {
    return new DonkeyObject('List', arr);
}

function STR(str) {
    return new DonkeyObject('string', str);
}

function BOOL(b) {
    return new DonkeyObject('boolean', b);
}

function INT(x) {
    return new DonkeyObject('integer', x);
}

function REAL(x) {
    return new DonkeyObject('real', x);
}

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
class DonkeyObject {

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

    assertType(s, msg, line) {
        if (s === 'number') {
            if (this.type !== 'integer' && this.type !== 'real') {
                throw [
                    `Type Error: Line ${line.line}`,
                    msg
                ];
            }

            return
        }
        if (s !== this.type) throw [
            `Type Error: Line ${line.line}`,
            msg
        ];
    }

    bool(line) {
        this.assertType(
            'boolean',
            `Type ${this.type} cannot be interpreted as a boolean`,
            line
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

class NativeFunction extends AbstractFunction {

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

class DonkeyRuntime {

    constructor(funcs) {
        this.funcFrames = [];
        this.stack = [];
        this.mainEnv = {};

        this.funcs = {};
        for (var i of funcs) {
            this.funcs[i.name] = new CodeFunction(i.params, i.code);
        }
    }

    runMain(main='$main') {
        if (currVM !== null) {
            console.log('Another runtime is running!');
            return;
        }

        const frame = new FunctionFrame(this.funcs[main].code);
        this.mainEnv = frame.locals;

        this.funcFrames.push(frame);

        currVM = setInterval(() => {
            try {
                for (var i = 0; i < EXE_FREQ && this.funcFrames.length > 0; i++) {
                    this.currFrame().execute(this);
                }

                if (this.funcFrames.length === 0) {
                    clearInterval(currVM);
                    currVM = null;
                    outputPrint('Program End', '#00CDAF', true);
                    stopCode();
                }
            } catch (error) {
                clearInterval(currVM);
                currVM = null;
                printError(error);
                stopCode();
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

function loadRuntime(funcs) {
    return new DonkeyRuntime(funcs);
}
