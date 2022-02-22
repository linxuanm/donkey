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
    'div', 'mod', 'and', 'or', 'true', 'false'
];

const _ = P.regexp(/( |\t)*/);
const __ = P.regexp(/( |\t)+/);;

const alphaNum = P.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
const iden = alphaNum.assert(
    s => !keywords.includes(s),
    `$Identifier name cannot be a keyword`
);

const funcName = P.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
const int = P.regexp(/-?[0-9]+/).map(parseInt);
const bool = P.regexp(/true|false/).map(e => e == 'true');

class Node {

    constructor(line) {
        this.line = line;
    }
}

class Exp extends Node {
    // TODO: the stack top codegen thingy
}

class Stmt extends Node {
    // TODO: the code emit thingy
}

class LHS {
    // TODO: code emit of storing to place etc
}

class LitExp extends Exp {

    constructor(line, valType, val) {
        super(line);
        this.valType = valType;
        this.val = val;
    }
}

class IdenExp extends Exp {

    constructor(line, name) {
        super(line);
        this.name = name;
    }
}

class BinExp extends Exp {

    constructor(line, op, a, b) {
        super(line);
        this.op = op;
        this.a = a;
        this.b = b;
    }
}

class UniExp extends Exp {

    constructor(line, op, val) {
        super(line);
        this.op = op;
        this.val = val;
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
    }
}

class AsnStmt extends Stmt {

    constructor(line, lhs, exp) {
        super(line);
        this.lhs = lhs;
        this.exp = exp;
    }
}

class IfStmt extends Stmt {

    constructor(line, cond, ifs, elses) {
        super(line);
        this.cond = cond;
        this.ifs = ifs;
        this.elses = elses;
    }
}

class WhileStmt extends Stmt {

    constructor(line, cond, stmts) {
        super(line);
        this.cond = cond;
        this.stmts = stmts;
    }
}

class ForStmt extends Stmt {

    constructor(line, from, to, stmts) {
        super(line);
        this.from = from;
        this.to = to;
        this.stmts = stmts;
    }
}

class IdenLHS extends LHS {

    constructor(name) {
        super();
        this.name = name;
    }
}

class IdxLHS extends LHS {

    constructor(exp, idx) {
        super();
        this.exp = exp;
        this.idx = idx;
    }
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

const lang = P.createLanguage({
    Stmt: r => {
        return P.alt(
            r.AsnStmt,
            r.IfElseStmt,
            r.WhileStmt
        );
    },
    LHS: r => {
        return r.Exp.assert(e => {
            const isIden = e instanceof IdenExp;
            const isIdx = e instanceof BinExp && e.op === 'index';
            
            return isIden || isIdx;
        }, '$Illegal left-hand-side of assignment').map(e => {
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
        return r.Exp.sepBy(P.string(",").trim(P.whitespace));
    },
    SimpExp: r => {
        return P.alt(
            P.seqMap(
                funcName.mark().skip(_),
                parens(r.ListExp, "(", ")"),
                (name, params) => new CallExp(name.start, name.value, params)
            ),
            iden.mark().map(n => new IdenExp(n.start, n.value)),
            int.mark().map(n => new LitExp(n.start, 'integer', n.value)),
            bool.mark().map(n => new LitExp(n.start, 'bool', n.value)),
            parens(r.Exp, "(", ")"),
            parens(r.ListExp, '[', ']').mark().map(
                e => new LitExp(e.start, 'list', e.value)
            )
        );
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
    ExpStmt: r => r.Exp,
    WhileStmt: r => {
        return P.seqObj(
            ['line', P.string('loop').mark()],
            __,
            P.string('while'),
            __,
            ['cond', r.Exp],
            ['stmts', r.LineDiv.then(r.Stmt).many()],
            r.LineDiv.then(end('loop'))
        ).map(e => new WhileStmt(e.line.start, e.cond, e.stmts));
    },
    Global: r => {
        return P.alt(r.Stmt).sepBy(r.LineDiv).skip(P.optWhitespace);
    },
    LineDiv: r => {
        return _.then(P.newline).skip(P.optWhitespace);
    }
});
