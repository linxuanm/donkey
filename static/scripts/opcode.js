class OpCode {

    constructor(line) {
        this.line = line;
    }

    execute(vm) {
        throw 'not implemented';
    }
}

class JumpIf extends OpCode {

    constructor(line) {
        super(line);
    }
}

class LoadVar extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }
}

/*
    Pops and stores the stack top; prioritizing the global '$main'
    scope if the name is already defined there. If var is not declared
    in the global scope then just shove it in local.

    Yea ik weird design but IB also didn't specify the scoping/referencing
    rules for global variables so imma improvise.
*/
class StoreVar extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }
}

class Invoke extends OpCode {

    constructor(line, name, nParams, isMethod=false, isNative=false) {
        super(line);
        this.name = name;
        this.nParams = nParams;
        this.isMethod = isMethod;
        this.isNative = isNative;
    }
}

class UnOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }
}

class BinOp extends OpCode {

    constructor(line, op) {
        super(line);
        this.op = op;
    }
}


