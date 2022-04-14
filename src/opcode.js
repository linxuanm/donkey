import * as Prelude from './prelude';
import * as Runtime from './runtime';

function loadVar(name, vm, frame, line) {
    if (name in frame.locals) {
        return frame.locals[name];
    } else if (name in vm.mainEnv) {
        return vm.mainEnv[name];
    } else {
        throw new Runtime.VMError(
            'Name Error',
            `Variable '${name}' is undefined`
        );
    }
}

export class OpCode {

    constructor(line) {
        this.line = line;
    }

    execute(vm, frame) {
        throw 'not implemented';
    }
}

export class CodeBreakPoint extends OpCode {

    constructor(line) {
        super(line);
    }

    execute(vm, frame) {
        vm.pause(this.line);
    }
}

export class CodeJump extends OpCode {

    constructor(line, target) {
        super(line);
        this.target = target;
    }

    execute(vm, frame) {
        frame.pc = this.target;
    }
}

export class CodeJumpIf extends OpCode {

    constructor(line, target) {
        super(line);
        this.target = target;
    }

    execute(vm, frame) {
        const top = vm.pop();
        if (top.bool(this.line)) frame.pc = this.target;
    }
}

export class CodeLoadVar extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }

    execute(vm, frame) {
        vm.push(loadVar(this.name, vm, frame, this.line));
    }
}

/*
    Pops and stores the stack top; prioritizing the global '$main'
    scope if the name is already defined there. If var is not declared
    in the global scope then just shove it in local.

    Yea ik weird design but IB also didn't specify the scoping/referencing
    rules for global variables so imma improvise.
*/
export class CodeStoreVar extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }

    execute(vm, frame) {
        if (this.name in vm.mainEnv) {
            vm.mainEnv[this.name] = vm.pop();
        } else {
            frame.locals[this.name] = vm.pop();
        }
    }
}

export class CodeInvoke extends OpCode {

    constructor(line, name, nParams, isMethod=false) {
        super(line);
        this.name = name;
        this.nParams = nParams;
        this.isMethod = isMethod;
    }

    execute(vm, frame) {
        const exps = [];
        for (var i = 0; i < this.nParams; i++) {
            exps.push(vm.pop());
        }
        exps.reverse();

        let func;
        if (this.isMethod) {
            const methods = Prelude.METHODS[exps[0].type] || {};
            if (!(this.name in methods)) {
                throw new Runtime.VMError(
                    'Name Error',
                    `Type '${exps[0].type}' does not have method '${this.name}'`
                );
            }
            func = methods[this.name];
        } else if (this.name in vm.funcs) {
            func = vm.funcs[this.name];
        } else if (this.name in Prelude.NATIVE_FUNCS) {
            func = Prelude.NATIVE_FUNCS[this.name];
        } else {
            throw new Runtime.VMError(
                'Name Error',
                `Function '${this.name}' is not defined`
            );
        }

        if (func.params.length !== this.nParams) {
            throw new Runtime.VMError(
                'Invocation Error',
                `Function '${this.name}' called with ${this.nParams} \
                parameters but expected ${func.params.length}`
            );
        }

        func.invoke(vm, exps);
    }
}

export class CodeUnOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }

    execute(vm, frame) {
        const val = vm.pop();

        if (!(this.op in Prelude.UN_OP)) {
            throw sanityError(`Unimplemented Unary Operator '${this.op}'`);
        }
        vm.push(Prelude.UN_OP[this.op](val, this.line));
    }
}

export class CodeBinOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }

    execute(vm, frame) {
        const b = vm.pop();
        const a = vm.pop();
        const hash = a.type + ' ' + b.type;

        if (!(this.op in Prelude.BIN_OP)) {
            throw sanityError(`Unimplemented Binary Operator '${this.op}'`);
        }

        const operator = Prelude.BIN_OP[this.op];
        if (!operator.verify(a.type, b.type)) {
            throw new Runtime.VMError(
                'Type Error',
                `Operator '${this.op}' is undefined for \
                type '${a.type}' and '${b.type}'`
            );
        }

        vm.push(operator.calc(a, b, this.line));
    }
}

export class CodeRet extends OpCode {

    constructor(line) {
        super(line);
    }

    execute(vm, frame) {
        vm.funcFrames.pop();
    }
}

export class CodeConsList extends OpCode {
    
    constructor(line, nParams) {
        super(line);
        this.nParams = nParams;
    }

    execute(vm, frame) {
        const list = [];
        for (var i = 0; i < this.nParams; i++) {
            list.push(vm.pop());
        }
        list.reverse();
        vm.push(Runtime.LIST(list));
    }
}

export class CodeLoadLit extends OpCode {

    constructor(line, val) {
        super(line);
        this.val = val;
    }

    execute(vm, frame) {
        vm.push(this.val);
    }
}

export class CodePop extends OpCode {

    constructor(line) {
        super(line);
    }

    execute(vm, frame) {
        vm.pop();
    }
}

/*
    Tests if the given value is less than or equal to the stack
    top and pushes the result on to the stack. DOES NOT pop the
    reference element off the stack.

    Actually just a temporary hacky OpCode cuz im not sure if the
    IB pseudocode for loop should be able to iterate decrementally
    cuz the IB specification says fuckall on the subject just
    like every other subject.
*/
export class CodeForTest extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }

    execute(vm, frame) {
        const top = vm.pop();
        vm.push(top);

        const ref = loadVar(this.name, vm, frame, this.line);
        if (!Prelude.BIN_OP['<='].verify(ref.type, top.type)) {
            throw new Runtime.VMError(
                'Type Error',
                `For loop requires numeric bounds, but has acculator \
                of type ${ref.type} and target value of type ${top.type}`
            );
        }
        vm.push(Prelude.BIN_OP['<='].calc(ref, top));
    }
}
