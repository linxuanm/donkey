const PRELUDE_FUNCS = [
    'int', 'real', 'str', 'stack', 'queue', 'collection',
    '$input', '$output'
];

const PRELUDE_FUNCS_NAME = new Set();
PRELUDE_FUNCS.forEach(e => PRELUDE_FUNCS_NAME.add(e));

const UN_OP = {
    'not': (b, line) => {
        b.assertType(
            'boolean',
            '\'not\' can only be applied to boolean',
            line
        );
        return b.map(v => !v);
    },
    '!': (b, line) => {
        b.assertType(
            'boolean',
            '\'!\' can only be applied to boolean',
            line
        );
        return b.map(v => !v);
    },
    '-': (x, line) => {
        x.assertType(
            'number',
            '\'-\' can only be applied to numeric types',
            line
        );
        return x.map(v => -v);
    }
};

const uniNum = x => x === 'integer' || x === 'real';
const isNum = (at, bt) => uniNum(at) && uniNum(bt);
const isBool = (at, bt) => at === 'boolean' && bt === 'boolean';
const comb = (a, b) => a.type === 'real' || b.type === 'real' ? 'real' : 'integer';
const BIN_OP = {
    '+': {
        verify: (a, b) => {
            return isNum(a, b) ||
                   a === 'string' && b === 'string' ||
                   a === 'list' && b === 'list';
        },
        calc: (a, b) => {
            if (isNum(a.type, b.type)) {
                return new DonkeyObject(comb(a, b), a.value + b.value);
            } else {
                const retType = a.type;
                return new DonkeyObject(retType, a.value + b.value);
            }
        }
    },
    '-': {
        verify: isNum,
        calc: (a, b) => new DonkeyObject(comb(a, b), a.value - b.value)
    },
    '*': {
        verify: isNum,
        calc: (a, b) => new DonkeyObject(comb(a, b), a.value * b.value)
    },
    '/': {
        verify: isNum,
        calc: (a, b, line) => {
            if (b.value == 0) throw [
                `Value Error: Line ${line.line}`,
                `Division by 0`
            ];
            return new DonkeyObject('real', a.value / b.value);
        }
    },
    '%': {
        verify: isNum,
        calc: (a, b) => {
            if (b.value == 0) throw [
                `Value Error: Line ${line.line}`,
                `Division by 0`
            ];
            return new DonkeyObject(comb(a, b), a.value % b.value);
        }
    },
    '==': {
        verify: (a, b) => true,
        calc: (a, b) => BOOL(a.type === b.type && a.value === b.value)
    },
    '!=': {
        verify: (a, b) => true,
        calc: (a, b) => BOOL(a.type !== b.type || a.value !== b.value)
    },
    '<=': {
        verify: isNum,
        calc: (a, b) => BOOL(a.value <= b.value)
    },
    '>=': {
        verify: isNum,
        calc: (a, b) => BOOL(a.value >= b.value)
    },
    '<': {
        verify: isNum,
        calc: (a, b) => BOOL(a.value < b.value)
    },
    '>': {
        verify: isNum,
        calc: (a, b) => BOOL(a.value > b.value)
    },
    'and': {
        verify: isBool,
        calc: (a, b) => BOOL(a.value && b.value)
    },
    'or': {
        verify: isBool,
        calc: (a, b) => BOOL(a.value || b.value)
    },
    'index': {
        verify: (a, b) => a === 'list' && b === 'integer',
        calc: (a, b, line) => {
            if (b.value >= a.value.length) {
                throw [
                    `Index Error: Line ${line.line}`,
                    `Accessing index ${b.value} of list with length ${a.value.length}`
                ];
            }
            return a.value[b.value];
        }
    }
};
BIN_OP['div'] = BIN_OP['/'];
BIN_OP['mod'] = BIN_OP['%'];

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
        case 'null':
            return 'null';
        case 'stack':
        case 'queue':
        case 'collection':
            return `${exp.type}[${exp.value.map(toString).join(', ')}]`;
    }

    throw `toString not implemented for type ${exp.type}`;
}

const NATIVE_FUNCS = {
    '$output': new NativeFunction(['msg'], (vm, exp) => {
        outputPrint(toString(exp[0]));
        vm.push(NULL());
    }),
    'str': new NativeFunction(['val'], (vm, exp) => {
        vm.push(STR(toString(exp[0])));
    }),
    'int': new NativeFunction(['val'], (vm, exp) => {
        exp[0].assertType('')
        vm.push(INT());
    }),
    'real': new NativeFunction(['val'], (vm, exp) => {
        vm.push(INT(toString(exp[0])));
    })
};
