const PRELUDE_FUNCS = [
    'int', 'real', 'str', 'stack', 'queue', 'collection',
    '$input', '$output'
];

const PRELUDE_FUNCS_NAME = new Set();
PRELUDE_FUNCS.forEach(e => PRELUDE_FUNCS_NAME.add(e));

const UN_OP = {
    'not': b => {
        b.assertType('boolean');
        return b.map(v => !v);
    },
    '!': b => {
        b.assertType('boolean');
        return b.map(v => !v);
    },
    '-': x => {
        x.assertType('number');
        return x.map(v => -v);
    }
};

function toString(exp) {
    switch (exp.type) {
        case 'integer':
        case 'real':
        case 'boolean':
            return exp.value.toString();
        case 'string':
            return exp.value;
        case 'list':
            return `[${exp.value.map(toString).join(', ')}]`;
        case 'stack':
        case 'queue':
        case 'collection':
            return `${exp.type}[${exp.value.map(toString).join(', ')}]`;
    }
}

const NATIVE_FUNCS = {
    '$output': new NativeFunction(['msg'], (vm, exp) => {
        outputPrint(toString(exp[0]));
        vm.push(NULL());
    }),
    'str': new NativeFunction(['val'], (vm, exp) => {
        vm.push(STR(toString(exp[0])));
    }),
};
