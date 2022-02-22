function transpile(code) {
    const funcs = [];
    const funcNames = new Set();
    const mainStmts = [];

    for (var i of code) {
        if (i instanceof Stmt) {
            if (i instanceof RetStmt) {
                throw [
                    `Structure Error: Line ${i.line}`,
                    'Return statement outside of function'
                ];
            }

            mainStmts.push(i);
        } else if (i instanceof FuncDecl) {
            const name = i.name;
            if (PRELUDE_FUNCS_NAME.has(name)) {
                throw [
                    `Structure Error: Line ${i.line}`,
                    `Function name cannot be the same as native functions: ${name}`
                ];
            } else if (funcNames.has(name)) {
                throw [
                    `Structure Error: Line ${i.line}`,
                    `Duplication function name: ${name}`
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

    funcs.forEach(e => {
        const stmts = e.stmts;
        if (stmts.length === 0 || !(stmts[stmts.length - 1] instanceof RetStmt)) {
            stmts.push(new RetStmt(dummyLine(), getNull(-1)));
        }
    });

    return funcs;
}
