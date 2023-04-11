import { Stmt, FuncDecl, dummyLine, RetStmt, getNull } from './parser';
import * as Prelude from './prelude';

class CodeGenContext {

    constructor(debugMode) {
        this.stack = []; // scope stack
        this.code = [];
        this.debug = debugMode;
    }

    push(scope) {
        this.stack.push(scope);
    }

    pop() {
        return this.stack.pop();
    }
};

export function transpile(code, debugMode) {
    const funcs = [];
    const funcNames = new Set();
    const mainStmts = [];

    for (var i of code) {
        if (i instanceof Stmt) {
            mainStmts.push(i);
        } else if (i instanceof FuncDecl) {
            const name = i.name;
            if (Prelude.PRELUDE_FUNCS_NAME.has(name)) {
                throw [
                    `Line ${i.line.line}: Structure Error`,
                    `Function name conflicts with native function: ${name}`
                ];
            } else if (funcNames.has(name)) {
                throw [
                    `Line ${i.line.line}: Structure Error`,
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

    const packaged = funcs.map(e => {
        const context = new CodeGenContext(debugMode);
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
