const P = Parsimmon;

const _ = P.optWhitespace;
const iden = P.regexp(/[A-Z]+/);
const funcName = P.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
const int = P.regexp(/-?[0-9]+/).map(parseInt);

const ops = [
    ['*', 'div', 'mod'],
    ['+', '-']
];

class LitExp {

    constructor(valType, val) {
        this.valType = valType;
        this.val = val;
    }
}

class IdenExp {

    constructor(name) {
        this.name = name;
    }
}

class BinExp {

    constructor(op, a, b) {
        this.op = op;
        this.a = a;
        this.b = b;
    }
}

class UniExp {

    constructor(op, val) {
        this.op = op;
        this.val = val;
    }
}

class CallExp {

    /*
        'isMethod' is just a hacky way to hide the object
        on which the method is invoked in the stack trace
        cuz APPARENTLY IB STUDENTS CAN'T UNDERSTAND "the
        first parameter is the instance object"
    */
    constructor(name, params, isMethod) {
        this.name = name;
        this.params = params;
        this.isMethod = isMethod;
    }
}

function parens(p, a, b) {
    return p.trim(_).wrap(P.string(a), P.string(b));
}

function makeUniExp(op, parser) {
    return P.string(op).skip(_).then(parser).map(e => new UniExp(op, e));
}

function oneOfStr(arr) {
    return P.alt(...arr.map(e => P.string(e))).desc(arr);
}

function chainOp(ops, parser) {
    const further = P.seqObj(
        ['op', oneOfStr(ops)],
        _,
        ['exp', parser]
    );

    return P.seqMap(parser, _.then(further).many(), (x, l) => {
        return [x, ...l].reduce((a, b) => new BinExp(b.op, a, b.exp));
    });
}

function opParser(precOps, parser) {
    for (var i of precOps) {
        parser = chainOp(i, parser);
    }

    return parser;
}

const lang = P.createLanguage({
    Stmt: r => {
        return P.alt(asnStmt);
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
        const idxParser = parens(r.Exp, "[", "]").map(e => {
            return {makeExp: a => new BinExp('index', a, e)}
        });
        const invokeParser = P.seqObj(
            P.string("."),
            ['method', funcName],
            _,
            ['params', parens(r.ListExp, "(", ")")]
        ).map(e => {
            return {makeExp: a => new CallExp(e.method, [a, ...e.params], true)};
        });

        return P.sepBy(P.alt(
            idxParser, invokeParser
        ), _);
    },
    UniExp: r => {
        return P.alt(
            makeUniExp('not',  r.UniExp),
            makeUniExp('-', r.UniExp),
            makeUniExp('!', r.UniExp),
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
        return r.Exp.sepBy(P.seq(_, P.string(","), _));
    },
    SimpExp: r => {
        return P.alt(
            P.seqMap(
                funcName.skip(_),
                parens(r.ListExp, "(", ")"),
                (name, params) => new CallExp(name, params)
            ),
            iden,
            int.map(n => new LitExp('integer', n)),
            parens(r.Exp, "(", ")"),
            parens(r.ListExp, '[', ']').map(e => new LitExp('list', e))
        );
    }
});
