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

class InvokeExp {

    constructor(obj, method, params) {
        this.obj = obj;
        this.method = method;
        this.params = params;
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
        const callParser = parens(r.ListExp, "(", ")").map(e => {
            return {makeExp: a => new BinExp('call', a, e)}
        });
        const invokeParser = P.seqObj(
            P.string("."),
            ['method', funcName],
            _,
            ['params', parens(r.ListExp, "(", ")")]
        ).map(e => {
            return {makeExp: a => new InvokeExp(a, e.method, e.params)};
        });

        return P.sepBy(P.alt(
            idxParser, callParser, invokeParser
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
            iden,
            int.map(n => new LitExp('integer', n)),
            parens(r.Exp, "(", ")")
        );
    }
});
