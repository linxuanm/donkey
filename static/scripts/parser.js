const P = Parsimmon;

const _ = P.optWhitespace;
const iden = P.regexp(/[A-Z]+/);

const asnStmt = P.seqObj(
    ["lhs", iden], _,
    P.string("="), _,
    ["rhs", iden]
);

const lang = P.createLanguage({
    Stmt: function(r) {
        return P.alt(asnStmt);
    }
});
