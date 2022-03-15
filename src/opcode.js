function loadVar(name, vm, frame, line) {
    if (name in frame.locals) {
        return frame.locals[name];
    } else if (name in vm.mainEnv) {
        return vm.mainEnv[name];
    } else {
        throw [
            `Name Error: Line ${line.line}`,
            `Variable '${name}' is undefined`
        ];
    }
}

class OpCode {

    constructor(line) {
        this.line = line;
    }

    execute(vm, frame) {
        throw 'not implemented';
    }
}

class CodeJump extends OpCode {

    constructor(line, target) {
        super(line);
        this.target = target;
    }

    execute(vm, frame) {
        frame.pc = this.target;
    }
}

class CodeJumpIf extends OpCode {

    constructor(line, target) {
        super(line);
        this.target = target;
    }

    execute(vm, frame) {
        const top = vm.pop();
        if (top.bool(this.line)) frame.pc = this.target;
    }
}

class CodeLoadVar extends OpCode {

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
class CodeStoreVar extends OpCode {

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

class CodeInvoke extends OpCode {

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
            const methods = METHODS[exps[0].type] || {};
            if (!(this.name in methods)) {
                throw [
                    `Name Error: Line ${this.line.line}`,
                    `Type '${exps[0].type}' does not have method '${this.name}'`
                ];
            }
            func = methods[this.name];
        } else if (this.name in vm.funcs) {
            func = vm.funcs[this.name];
        } else if (this.name in NATIVE_FUNCS) {
            func = NATIVE_FUNCS[this.name];
        } else {
            throw [
                `Name Error: Line ${this.line.line}`,
                `Function '${this.name}' is not defined`
            ];
        }

        if (func.params.length !== this.nParams) {
            throw [
                `Invocation Error: Line ${this.line.line}`,
                `Function '${this.name}' called with ${this.nParams} \
                parameters but expected ${func.params.length}`
            ];
        }

        func.invoke(vm, exps, this.line);
    }
}

class CodeUnOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }

    execute(vm, frame) {
        const val = vm.pop();

        if (!(this.op in UN_OP)) {
            throw sanityError(`Unimplemented Unary Operator '${this.op}'`);
        }
        vm.push(UN_OP[this.op](val, this.line));
    }
}

class CodeBinOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }

    execute(vm, frame) {
        const b = vm.pop();
        const a = vm.pop();
        const hash = a.type + ' ' + b.type;

        if (!(this.op in BIN_OP)) {
            throw sanityError(`Unimplemented Binary Operator '${this.op}'`);
        }

        const operator = BIN_OP[this.op];
        if (!operator.verify(a.type, b.type)) {
            throw [
                `Type Error: Line ${this.line.line}`,
                `Operator '${this.op}' is undefined for \
                type '${a.type}' and '${b.type}'`
            ];
        }

        vm.push(operator.calc(a, b, this.line));
    }
}

class CodeRet extends OpCode {

    constructor(line) {
        super(line);
    }

    execute(vm, frame) {
        vm.funcFrames.pop();
    }
}

class CodeConsList extends OpCode {
    
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
        vm.push(LIST(list));
    }
}

class CodeLoadLit extends OpCode {

    constructor(line, val) {
        super(line);
        this.val = val;
    }

    execute(vm, frame) {
        vm.push(this.val);
    }
}

class CodePop extends OpCode {

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
class CodeForTest extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }

    execute(vm, frame) {
        const top = vm.pop();
        vm.push(top);

        const ref = loadVar(this.name, vm, frame, this.line);
        if (!BIN_OP['<='].verify(ref.type, top.type)) {
            throw [
                `Type Error: Line ${this.line.line}`,
                `For loop requires numeric bounds, but has acculator \
                of type ${ref.type} and target value of type ${top.type}`
            ];
        }
        vm.push(BIN_OP['<='].calc(ref, top));
    }
}
