const P = Parsimmon;

const _ = P.optWhitespace;
const iden = P.regexp(/[A-Z]+/);
const funcName = P.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
const int = P.regexp(/-?[0-9]+/).map(parseInt);

function parens(p, a, b) {
    return P.string(a).skip(_).then(p).skip(_).skip(P.string(b));
}

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
        return P.alt(
            r.IdxExp
        );
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
    IdxExp: r => {
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
            P.seqObj(
                ['name', funcName],
                _,
                ['params', parens(r.ListExp, "(", ")")]
            ).map(e => new CallExp(e.name, e.params)),
            iden,
            int.map(n => new LitExp('integer', n)),
            parens(r.Exp, "(", ")")
        );
    }
});
