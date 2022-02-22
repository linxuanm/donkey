const PRELUDE_FUNCS = [
    'int', 'real', 'str', 'stack', 'queue', 'collection',
    '$input', '$output'
];

const PRELUDE_FUNCS_NAME = new Set();
PRELUDE_FUNCS.forEach(e => PRELUDE_FUNCS_NAME.add(e));
