const P = Parsimmon;

const ops = [
    ['*', 'div', 'mod', '/', '%'],
    ['+', '-'],
    ['==', '!=', '>=', '<=', '>', '<'],
    ['and'],
    ['or']
];
const keywords = [
    'if', 'else', 'then', 'do', 'for', 'while',
    'from', 'to', 'loop', 'input', 'output', 'end',
    'div', 'mod', 'true', 'false', 'return', 'break',
    'continue', 'not', 'and', 'or'
];

const _ = P.regexp(/( |\t)*/);
const __ = P.regexp(/( |\t)+/);;

const alphaNum = P.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
const iden = alphaNum.assert(
    s => !keywords.includes(s),
    `$Identifier name cannot be a keyword`
);
// separate in case variable names are set to 'capitalized only'
// yea weird IB standard ik
const funcName = alphaNum.assert(
    s => !keywords.includes(s),
    `$Identifier name cannot be a keyword`
);

const int = P.regexp(/-?[0-9]+/).map(parseInt);
const real = P.regexp(/[+-]?([0-9]+[.])?[0-9]+/).map(parseFloat);
const strLit = P.alt(
    P.regexp(/".*?"/),
    P.regexp(/'.*?'/)
).map(s => s.slice(1, -1));
const bool = P.regexp(/true|false/).map(e => e == 'true');

/*
    Normally I don't think its good js pattern to enforce abstract
    methods and stuff but the IB project requirement kinda stupidly
    enforces a UML and 'oH eVeRyThInG iS aBsTrAcT' so here goes.
*/
class Node {

    constructor(line) {
        this.line = line;
        this.irCount = 0;
    }

    codeGen(context) {
        throw 'not implemented';
    }
}

class Exp extends Node {
    // TODO: the stack top codegen thingy
}

class Stmt extends Node {
    // TODO: the code emit thingy
}

class LHS {

    preGen(context) {
        throw 'not implemented';
    }

    postGen(context) {
        throw 'not implemented';
    }
}

class LitExp extends Exp {

    constructor(line, valType, val) {
        super(line);
        this.valType = valType;
        this.val = val;
        this.irCount = 1;
    }

    codeGen(context) {
        const obj = new DonkeyObject(this.valType, this.val);
        context.code.push(new CodeLoadLit(this.line, obj));
    }
}

class ListExp extends Exp {

    constructor(line, arr) {
        super(line);
        this.val = arr;
        this.irCount = stmtLen(arr) + 1;
    }

    codeGen(context) {
        this.val.forEach(e => e.codeGen(context));
        context.code.push(new CodeConsList(this.line, this.val.length));
    }
}

class IdenExp extends Exp {

    constructor(line, name) {
        super(line);
        this.name = name;
        this.irCount = 1;
    }

    codeGen(context) {
        context.code.push(new CodeLoadVar(this.line, this.name));
    }    
}

class BinExp extends Exp {

    constructor(line, op, a, b) {
        super(line);
        this.op = op;
        this.a = a;
        this.b = b;
        this.irCount = a.irCount + b.irCount + 1;
    }

    codeGen(context) {
        this.a.codeGen(context);
        this.b.codeGen(context);

        context.code.push(new CodeBinOp(this.line, this.op));
    }  
}

class UniExp extends Exp {

    constructor(line, op, val) {
        super(line);
        this.op = op;
        this.val = val;
        this.irCount = val.irCount + 1;
    }

    codeGen(context) {
        this.val.codeGen(context);

        context.code.push(new CodeUnOp(this.line, this.op));
    }
}

class CallExp extends Exp {

    /*
        'isMethod' is just a hacky way to hide the object
        on which the method is invoked in the stack trace
        cuz APPARENTLY IB STUDENTS CAN'T UNDERSTAND "the
        first parameter is the instance object"
    */
    constructor(line, name, params, isMethod) {
        super(line);
        this.name = name;
        this.params = params;
        this.isMethod = isMethod;
        this.irCount = params.reduce((a, b) => a + b.irCount, 0) + 1;
    }

    codeGen(context) {
        this.params.forEach(e => e.codeGen(context));

        context.code.push(
            new CodeInvoke(
                this.line, this.name,
                this.params.length, this.isMethod
            )
        );
    }
}

class AsnStmt extends Stmt {

    constructor(line, lhs, exp) {
        super(line);
        this.lhs = lhs;
        this.exp = exp;
        this.irCount = lhs.irCount + exp.irCount;
    }

    codeGen(context) {
        this.lhs.preGen(context);
        this.exp.codeGen(context);
        this.lhs.postGen(context);
    }
}

class IfStmt extends Stmt {

    constructor(line, cond, ifs, elses) {
        super(line);
        this.cond = cond;
        this.ifs = ifs;
        this.elses = elses;

        this.ifLen = stmtLen(ifs);
        this.elseLen = stmtLen(elses);
        this.irCount = this.cond.irCount + this.ifLen + this.elseLen + 2;
    }

    codeGen(context) {
        // TODO: remove jmp if 'else' block is empty

        let incre = context.code.length;
        incre += this.cond.irCount;
        incre++;
        incre += this.elseLen;
        incre++;
        this.ifLabel = incre;
        incre += this.ifLen;
        this.endLabel = incre;

        this.cond.codeGen(context);
        context.code.push(new CodeJumpIf(dummyLine(), this.ifLabel));
        context.push(this);

        this.elses.forEach(e => e.codeGen(context));
        context.code.push(new CodeJump(dummyLine(), this.endLabel));

        this.ifs.forEach(e => e.codeGen(context));

        context.pop();
    }

    /*
        <exp code>
        <jumpIf to ifLabel>
        [<else code>]
        <jump to endLabel>

        ifLabel:
        [<if code>]

        endLabel:
    */
}

class WhileStmt extends Stmt {

    constructor(line, cond, stmts) {
        super(line);
        this.cond = cond;
        this.stmts = stmts;

        this.stmtLen = stmtLen(stmts);
        this.irCount = cond.irCount + this.stmtLen + 2;
    }

    codeGen(context) {
        let incre = context.code.length;
        incre++;

        this.repLabel = incre;
        this.incre += this.stmtLen;

        this.contLabel = incre;
        incre += this.cond.irCount;
        incre++;
        this.breakLabel = incre;

        context.code.push(new CodeJump(dummyLine(), this.contLabel));
        this.stmts.forEach(e => e.codeGen(context));

        this.cond.codeGen(context);
        context.code.push(new CodeJumpIf(dummyLine(), this.repLabel));
    }

    /*
        <jump to contLabel>
        
        repLabel:
        [<stmt code>]

        contLabel:
        <expCode>
        <jumpIf to repLabel>

        breakLabel:
    */
}

class ForStmt extends Stmt {

    constructor(line, iter, from, to, stmts) {
        super(line);
        this.iter = iter;
        this.from = from;
        this.to = to;
        this.stmts = stmts;

        this.stmtLen = stmtLen(stmts);
        this.irCount = from.irCount + to.irCount + this.stmtLen + 9;
    }

    codeGen(context) {
        let incre = context.code.length;
        incre += this.from.irCount;
        incre++;
        incre += this.to.irCount;
        incre++;

        this.repLabel = incre;
        incre += this.stmtLen;
        this.contLabel = incre;
        incre += 4; // init integer of 1 and add and assign

        this.initLabel = incre;
        incre++;
        incre++;

        this.breakLabel = incre;
        incre++;

        this.from.codeGen(context);
        context.code.push(new CodeStoreVar(dummyLine(), this.iter));
        this.to.codeGen(context);
        context.code.push(new CodeJump(dummyLine(), this.initLabel));

        context.push(this);
        this.stmts.forEach(e => e.codeGen(context));
        context.pop(this);

        context.code.push(new CodeLoadVar(dummyLine(), this.iter));
        const one = new DonkeyObject('integer', 1);
        context.code.push(new CodeLoadLit(dummyLine(), one));
        context.code.push(new CodeBinOp(dummyLine(), '+'));
        context.code.push(new CodeStoreVar(dummyLine(), this.iter));

        context.code.push(new CodeForTest(dummyLine(), this.iter));
        context.code.push(new CodeJumpIf(dummyLine(), this.repLabel));

        context.code.push(new CodePop(dummyLine()));
    }

    /*
        <init 'var' to 'from'>
        <load 'to'>
        <jump to initLabel>
        
        repLabel:
        [<stmt code>]

        contLabel:
        <increment 'var'>

        initLabel:
        <forTest 'var'>
        <jumpIf to repLabel>

        breakLabel:
        <pop 'to'>
    */
}

class BreakStmt extends Stmt {

    constructor(line) {
        super(line);
        this.irCount = 1;
    }

    codeGen(context) {
        const loop = findLoop(context.stack);
        if (loop === null) throw [
            `Code Structure Error: Line ${this.line.line}`, 
            'Break statement outside of loop'
        ];

        context.code.push(new CodeJump(this.line, loop.breakLabel));
    }
}

class ContStmt extends Stmt {

    constructor(line) {
        super(line);
        this.irCount = 1;
    }

    codeGen(context) {
        const loop = findLoop(context.stack);
        if (loop === null) throw [
            `Code Structure Error: Line ${this.line.line}`, 
            'Continue statement outside of loop'
        ];

        context.code.push(new CodeJump(this.line, loop.contLabel));
    }
}

class RetStmt extends Stmt {

    constructor(line, exp) {
        super(line);
        this.exp = exp;
        this.irCount = exp.irCount + 1;
    }

    codeGen(context) {
        const func = context.stack[0];
        if (func.name === '$main') throw [
            `Code Structure Error: Line ${this.line.line}`, 
            'Return statement outside of function'
        ];

        this.exp.codeGen(context);
        context.code.push(new CodeRet(this.line));
    }
}

class FuncCallStmt extends Stmt {

    constructor(funcExp) {
        super(funcExp.line);
        this.funcExp = funcExp;
        this.irCount = funcExp.irCount + 1; // extra pop
    }

    codeGen(context) {
        this.funcExp.codeGen(context);
        context.code.push(new CodePop(dummyLine()));
    }
}

class IdenLHS extends LHS {

    constructor(name) {
        super();
        this.name = name;
        this.irCount = 1;
    }

    preGen(context) {}

    postGen(context) {
        context.code.push(new CodeStoreVar(dummyLine(), this.name));
    }
}

class IdxLHS extends LHS {

    constructor(exp, idx) {
        super();
        this.exp = exp;
        this.idx = idx;
        this.irCount = exp.irCount + idx.irCount + 2;
    }

    preGen(context) {
        this.exp.codeGen(context);
        this.idx.codeGen(context);
    }

    postGen(context) {
        context.code.push(new CodeInvoke(dummyLine(), '$setIndex', 3, true));
        context.code.push(new CodePop(dummyLine()));
    }
}

class FuncDecl extends Node {

    constructor(line, name, params, stmts) {
        super(line);
        this.name = name;
        this.params = params;
        this.stmts = stmts;
        this.irCount = stmtLen(stmts);
    }

    codeGen(context) {
        context.push(this);
        this.stmts.forEach(e => e.codeGen(context));
        if (!(context.code[context.code.length - 1] instanceof CodeRet)) {
            context.code.push(new CodeLoadLit(dummyLine(), NULL()));
            context.code.push(new CodeRet(dummyLine()));
        }

        context.pop(this);
    }
}

function getNull(start) {
    return new LitExp(start, 'null', null);
}

// returns a dummy line that does not trigger a debugger break
function dummyLine() {
    return {offset: 0, line: -1, column: 0};
}

function parens(p, a, b) {
    return p.trim(P.optWhitespace).wrap(P.string(a), P.string(b));
}

function makeUniExp(op, parser) {
    return P.seqMap(
        op.skip(_).mark(),
        parser,
        (node, e) => new UniExp(node.start, node.value, e)
    );
}

function oneOfStr(arr) {
    return P.alt(...arr.map(e => P.string(e))).desc(arr);
}

function chainOp(ops, parser) {
    const further = P.seqObj(
        _,
        ['op', oneOfStr(ops).mark()],
        _,
        ['exp', parser]
    );

    return P.seqMap(parser, further.many(), (x, l) => {
        return [x, ...l].reduce(
            (a, b) => new BinExp(b.op.start, b.op.value, a, b.exp)
        );
    });
}

function opParser(precOps, parser) {
    for (var i of precOps) {
        parser = chainOp(i, parser);
    }

    return parser;
}

function end(s) {
    return P.string('end').skip(__).then(P.string(s));
}

function stmtLen(s) {
    return s.reduce((a, b) => a + b.irCount, 0);
}

function findLoop(stack) {
    for (var i = stack.length - 1; i >= 0; i--) {
        const curr = stack[i];
        if (curr instanceof WhileStmt || curr instanceof ForStmt) {
            return curr;
        }
    }

    return null;
}

const lang = P.createLanguage({
    LHS: r => {
        return r.Exp.assert(e => {
            const isIden = e instanceof IdenExp;
            const isIdx = e instanceof BinExp && e.op === 'index';
            
            return isIden || isIdx;
        }, 'Illegal left-hand-side of assignment').map(e => {
            if (e instanceof IdenExp) return new IdenLHS(e.name);
            else if (e instanceof BinExp) return new IdxLHS(e.a, e.b);
        });
    },
    Exp: r => {
        return opParser(ops, r.UniExp);
    },
    ExpSuffix: r => {
        const idxParser = _.then(parens(r.Exp, "[", "]").mark().map(e => {
            return {makeExp: a => new BinExp(e.start, 'index', a, e.value)}
        }));
        const invokeParser = _.then(P.seqObj(
            P.string("."),
            ['method', funcName.mark()],
            _,
            ['params', parens(r.ListExp, "(", ")")]
        )).map(e => {
            return {makeExp: a => new CallExp(
                e.method.start, e.method.value, [a, ...e.params], true
            )};
        });

        return P.sepBy(P.alt(
            idxParser, invokeParser
        ), _);
    },
    UniExp: r => {
        return P.alt(
            makeUniExp(P.string('not').skip(__),  r.UniExp),
            makeUniExp(P.string('-'), r.UniExp),
            makeUniExp(P.string('!'), r.UniExp),
            r.CompExp
        );
    },
    CompExp: r => {
        return P.seqMap(
            r.SimpExp,
            r.ExpSuffix,
            (exp, idxs) => {
                if (idxs.length === 0) {
                    return exp;
                }
                return [exp, ...idxs].reduce(
                    (a, b) => b.makeExp(a)
                );
            }
        );
    },
    ListExp: r => {
        return r.Exp.sepBy(P.string(",").trim(P.optWhitespace));
    },
    ListExpCont: r => {
        return r.Exp.sepBy(P.string(",").trim(_));
    },
    SimpExp: r => {
        return P.alt(
            P.seqMap(
                funcName.mark().skip(_),
                parens(r.ListExp, "(", ")"),
                (name, params) => new CallExp(name.start, name.value, params)
            ),
            int.mark().map(n => new LitExp(n.start, 'integer', n.value)),
            real.mark().map(n => new LitExp(n.start, 'real', n.value)),
            bool.mark().map(n => new LitExp(n.start, 'boolean', n.value)),
            strLit.mark().map(n => new LitExp(n.start, 'string', n.value)),
            iden.mark().map(n => new IdenExp(n.start, n.value)),
            parens(r.Exp, "(", ")"),
            parens(r.ListExp, '[', ']').mark().map(
                e => new ListExp(e.start, e.value)
            )
        );
    },
    Func: r => {
        const parser = P.seqObj(
            ['name', iden.mark()],
            _,
            ['params', parens(
                iden.sepBy(P.string(',').trim(P.optWhitespace)),
                '(', ')'
            )],
            ['stmts', r.LineDiv.then(r.Stmt).many()]
        );
        const whole = parser.chain(s => {
            return r.LineDiv.then(end(s.name.value)).map(e => {
                return new FuncDecl(
                    s.name.start, s.name.value, s.params, s.stmts
                );
            });
        });

        return whole;
    },
    Stmt: r => {
        return P.alt(
            r.OutStmt,
            r.InStmt,
            r.CtrlStmt,
            r.IfElseStmt,
            r.WhileStmt,
            r.ForStmt,
            r.AsnStmt,
            r.CallStmt
        );
    },
    CallStmt: r => {
        return r.Exp.assert(
            e => e instanceof CallExp,
            'Expression cannot be a statement'
        ).map(e => new FuncCallStmt(e));
    },
    CtrlStmt: r => {
        return P.alt(
            P.string('continue').mark().map(e => new ContStmt(e.start)),
            P.string('break').mark().map(e => new BreakStmt(e.start)),
            P.seqMap(
                P.string('return').mark(),
                __.then(r.Exp).atMost(1),
                (l, e) => new RetStmt(
                    l.start,
                    e.length === 1 ? e[0] : getNull(l.start)
                )
            )
        );
    },
    InStmt: r => {
        return P.seqObj(
            ['line', P.string('input').mark()],
            _,
            ['lhs', r.LHS]
        ).map(e => {
            return new AsnStmt(
                e.line.start, e.lhs,
                new CallExp(e.line.start, '$input', [], false)
            );
        });
    },
    OutStmt: r => {
        return P.seqObj(
            ['line', P.string('output').mark()],
            _,
            ['params', r.ListExpCont]
        ).map(e => {
            if (e.params.length !== 0) {
                const ref = e.params[0];
                if (!(ref instanceof LitExp && ref.valType === 'string')) {
                    e.params[0] = new CallExp(dummyLine, 'str', [ref], false);
                }
            }
            const joined = e.params.reduce((a, b) => {
                if (!(b instanceof LitExp && b.valType === 'string')) {
                    b = new CallExp(dummyLine, 'str', [b], false);
                }
                return new BinExp(e.line.start, '+', a, b);
            });
            const funcExp = new CallExp(e.line.start, '$output', [joined], false);
            return new FuncCallStmt(funcExp);
        });
    },
    AsnStmt: r => {
        return P.seqMap(
            r.LHS,
            P.string('=').mark().trim(_),
            r.Exp,
            (a, eq, b) => new AsnStmt(eq.start, a, b)
        );
    },
    IfPiece: r => {
        return P.seqObj(
            ['line', P.string('if').mark()],
            __,
            ['cond', r.Exp],
            __,
            P.string('then'),
            ['if', r.LineDiv.then(r.Stmt).many()]
        );
    },
    ElseIfPiece: r => {
        return P.seqObj(
            P.string('else'),
            __,
            ['elif', r.IfPiece]
        ).map(e => e.elif);
    },
    ElsePiece: r => {
        return P.seqObj(
            P.string('else'),
            ['else', r.LineDiv.then(r.Stmt).many()]
        ).map(e => e.else);
    },
    IfElseStmt: r => {
        return P.seqMap(
            r.IfPiece,
            r.LineDiv.then(r.ElseIfPiece).many(),
            r.LineDiv.then(r.ElsePiece).atMost(1),
            r.LineDiv.then(end('if')),
            (ifStmt, elifs, elseStmt) => {
                const genIfPiece = o => {
                    return new IfStmt(o.line.start, o.cond, o.if, []);
                }
                const ifNode = genIfPiece(ifStmt);
                const elifNodes = elifs.map(genIfPiece);

                return [ifNode, ...elifNodes, ...elseStmt].reduceRight((a, b) => {
                    // to match first 'b' (which is a list of stmts)
                    b.elses = Array.isArray(a) ? a : [a];

                    return b;
                });
            }
        );
    },
    WhileStmt: r => {
        return P.seqObj(
            ['line', P.string('loop').mark()],
            __,
            ['negate', P.alt(
                    P.string('while'),
                    P.string('until')
                ).map(e => e === 'until')
            ],
            __,
            ['cond', r.Exp],
            ['stmts', r.LineDiv.then(r.Stmt).many()],
            r.LineDiv.then(end('loop'))
        ).map(e => {
            if (e.negate) e.cond = new UniExp(e.cond.line, 'not', e.cond);
            return new WhileStmt(e.line.start, e.cond, e.stmts);
        });
    },
    ForStmt: r => {
        return P.seqObj(
            ['line', P.string('loop').mark()],
            __,
            ['iter', iden],
            __,
            P.string('from'),
            __,
            ['from', r.Exp],
            __,
            P.string('to'),
            __,
            ['to', r.Exp],
            ['stmts', r.LineDiv.then(r.Stmt).many()],
            r.LineDiv.then(end('loop'))
        ).map(e => new ForStmt(e.line.start, e.iter, e.from, e.to, e.stmts));
    },
    Global: r => {
        return P.alt(r.Func, r.Stmt).sepBy(r.LineDiv).skip(P.optWhitespace);
    },
    LineDiv: r => {
        return _.then(P.newline).skip(P.optWhitespace);
    }
});
