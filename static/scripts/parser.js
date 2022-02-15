const P = Parsimmon;

const _ = P.optWhitespace;
const iden = P.regexp(/[A-Z]+/);
const int = P.regexp(/-?[0-9]+/).map(parseInt);

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
            int.map(n => new LitExp('integer', n))
        );
    }
});
