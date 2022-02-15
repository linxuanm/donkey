const P = Parsimmon;

const _ = P.optWhitespace;
const iden = P.regexp(/[A-Z]+/);
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
    IdxExp: r => {
        return P.seqMap(
            r.SimpExp,
            _.then(P.sepBy(P.alt(
                parens(r.Exp, "[", "]").map(e => {
                    return {kind: 'index', exp: e}
                }),
                parens(r.ListExp, "(", ")").map(e => {
                    return {kind: 'call', exp: e}
                })
            ), _)),
            (exp, idxs) => {
                if (idxs.length === 0) {
                    return exp;
                }
                return [exp, ...idxs].reduce(
                    (a, b) => new BinExp(b.kind, a, b.exp)
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
