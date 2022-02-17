const P = Parsimmon;

const _ = P.optWhitespace;
const iden = P.regexp(/[A-Z]+/);
const funcName = P.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
const int = P.regexp(/-?[0-9]+/).map(parseInt);

const ops = [
    ['*', 'div', 'mod'],
    ['+', '-'],
    ['==', '!=', '>=', '<=', '>', '<'],
    ['and'],
    ['or']
];

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

class AsnStmt extends Node {

    constructor(line, name, exp) {
        super(line);
        this.name = name;
        this.exp = exp;
    }
}

function parens(p, a, b) {
    return p.trim(_).wrap(P.string(a), P.string(b));
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
        ['op', oneOfStr(ops).mark()],
        _,
        ['exp', parser]
    );

    return P.seqMap(parser.skip(_), further.many(), (x, l) => {
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
    return P.string('end').skip(P.whitespace).then(P.string(s));
}

const lang = P.createLanguage({
    Stmt: r => {
        return P.alt(r.AsnStmt);
    },
    AsnStmt: r => {
        return P.seqObj(
            ["lhs", iden], _,
            P.string("="), _,
            ["rhs", r.Exp]
        );
    },
    Exp: r => {
        return opParser(ops, r.UniExp);
    },
    ExpSuffix: r => {
        const idxParser = parens(r.Exp, "[", "]").mark().map(e => {
            return {makeExp: a => new BinExp(e.start, 'index', a, e.value)}
        });
        const invokeParser = P.seqObj(
            P.string("."),
            ['method', funcName.mark()],
            _,
            ['params', parens(r.ListExp, "(", ")")]
        ).map(e => {
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
            makeUniExp(P.string('not').skip(P.whitespace),  r.UniExp),
            makeUniExp(P.string('-'), r.UniExp),
            makeUniExp(P.string('!'), r.UniExp),
            r.CompExp
        );
    },
    CompExp: r => {
        return P.seqMap(
            r.SimpExp,
            _.then(r.ExpSuffix),
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
        return r.Exp.sepBy(P.string(",").trim(_));
    },
    SimpExp: r => {
        return P.alt(
            P.seqMap(
                funcName.mark().skip(_),
                parens(r.ListExp, "(", ")"),
                (name, params) => new CallExp(name.start, name.value, params)
            ),
            iden,
            int.mark().map(n => new LitExp(n.start, 'integer', n.value)),
            parens(r.Exp, "(", ")"),
            parens(r.ListExp, '[', ']').mark().map(
                e => new LitExp(e.start, 'list', e.value)
            )
        );
    },
    Stmt: r => {
        return P.alt(r.AsnStmt);
    },
    AsnStmt: r => {
        return P.seqMap(
            iden,
            P.string('=').mark().trim(_),
            r.Exp,
            (a, eq, b) => new AsnStmt(eq.start, a, b)
        );
    },
    IfPiece: r => {
        return P.seqObj(
            ['line', P.string('if').mark()],
            P.whitespace,
            ['cond', r.Exp],
            P.whitespace,
            P.string('then'),
            P.whitespace,
            ['if', r.Stmt.sepBy(P.whitespace)]
        );
    },
    ElseIfPiece: r => {
        return P.seqObj(
            P.string('else'),
            P.whitespace,
            ['ifPiece', r.Stmt.IfPiece]
        ).map(e => e.ifPiece);
    },
    ElsePiece: r => {
        return P.seqObj(
            P.string()
        );
    },
    ExpStmt: r => r.Exp,
    Global: r => {
        return P.alt(r.Stmt).sepBy(P.newline);
    }
});
