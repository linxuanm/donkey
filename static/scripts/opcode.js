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
}

class OpCode {

    constructor(line) {
        this.line = line;
    }

    execute(vm) {
        throw 'not implemented';
    }
}

class CodeJump extends OpCode {

    constructor(line, target) {
        super(line);
        this.target = target;
    }
}

class CodeJumpIf extends OpCode {

    constructor(line, target) {
        super(line);
        this.target = target;
    }
}

class CodeLoadVar extends OpCode {

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
class CodeStoreVar extends OpCode {

    constructor(line, name) {
        super(line);
        this.name = name;
    }
}

class CodeInvoke extends OpCode {

    constructor(line, name, nParams, isMethod=false) {
        super(line);
        this.name = name;
        this.nParams = nParams;
        this.isMethod = isMethod;
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
        this.line = line;
    }
}
