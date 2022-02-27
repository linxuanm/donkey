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
        if (top.bool()) frame.pc = this.target;
    }
}

class CodeLoadVar extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }

    execute(vm, frame) {
        if (this.name in frame.locals) {
            vm.push(frame.locals[this.name]);
        } else if (this.name in vm.mainEnv) {
            vm.push(vm.mainEnv[this.name]);
        } else {
            throw [
                `Name Error: Line ${this.line.line}`,
                `Variable '${this.name}' is undefined`
            ];
        }
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
        let func;
        if (this.isMethod) {

        } else if (this.name in vm.funcs) {
            func = vm.funcs[this.name];
        } else if (this.name in NATIVE_FUNCS) {
            func = NATIVE_FUNCS[this.name];
        }
    }
}

class CodeUnOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }
}

class CodeBinOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }
}

class CodeRet extends OpCode {

    constructor(line) {
        super(line);
    }
}

class CodeConsList extends OpCode {
    
    constructor(line, nParams) {
        super(line);
        this.nParams = nParams;
    }
}

class CodeLoadLit extends OpCode {

    constructor(line, val) {
        super(line);
        this.val = val;
    }
}

class CodePop extends OpCode {

    constructor(line) {
        super(line);
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
}
