class CodeGenContext {

    constructor() {
        this.stack = []; // scope stack
        this.code = [];
    }

    push(scope) {
        this.stack.push(scope);
    }

    pop() {
        return this.stack.pop();
    }
};

function transpile(code) {
    const funcs = [];
    const funcNames = new Set();
    const mainStmts = [];

    for (var i of code) {
        if (i instanceof Stmt) {
            mainStmts.push(i);
        } else if (i instanceof FuncDecl) {
            const name = i.name;
            if (PRELUDE_FUNCS_NAME.has(name)) {
                throw [
                    `Structure Error: Line ${i.line.line}`,
                    `Function name conflicts with native function: ${name}`
                ];
            } else if (funcNames.has(name)) {
                throw [
                    `Structure Error: Line ${i.line.line}`,
                    `Duplicate function name: ${name}`
                ];
            }

            funcNames.add(name);
            funcs.push(i);
        }
    }

    const mainFunc = new FuncDecl(
        dummyLine(),
        '$main',
        [],
        mainStmts
    );
    funcs.push(mainFunc);

    // console.log(funcs);
    const packaged = funcs.map(e => {
        const context = new CodeGenContext();
        e.codeGen(context);
        
        return {
            name: e.name,
            params: e.params,
            code: context.code
        };
    });
    console.log(packaged)

    return packaged;
}
