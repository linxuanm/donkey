class CollectionInner {

    constructor() {
        this.data = [];
        this.iter = 0;
    }
}

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

const METHODS = {
    'List': {
        '$setIndex': new NativeFunction(['lst', 'idx', 'exp'], (vm, exp, line) => {
            exp[1].assertType(
                'integer',
                `Index must be of type integer, but got '${exp[1].type}'`,
                line
            );
            const lst = exp[0].value;
            const idx = exp[1].value;
            if (idx >= lst.length || idx < 0) {
                throw [
                    `Index Error: Line ${line.line}`,
                    `Assigning to index ${idx} of list with \
                    length ${lst.length}`
                ];
            }

            lst[idx] = exp[2];
            vm.push(NULL());
        }),
        'length': new NativeFunction(['lst'], (vm, exp) => {
            vm.push(INT(exp[0].value.length));
        }),
        'add': new NativeFunction(['lst', 'val'], (vm, exp) => {
            exp[0].value.push(exp[1]);
            vm.push(NULL());
        })
    },
    'Queue': {
        'enqueue': new NativeFunction(['lst', 'val'], (vm, exp) => {
            exp[0].value.push(exp[1]);
            vm.push(NULL());
        }),
        'dequeue': new NativeFunction(['lst'], (vm, exp, line) => {
            if (exp[0].value.length === 0) {
                throw [
                    `Invalid Operation: Line ${line.line}`,
                    'Dequeuing from an empty queue'
                ];
            }
            vm.push(exp[0].value.shift());
        }),
        'isEmpty': new NativeFunction(['lst'], (vm, exp) => {
            vm.push(BOOL(exp[0].value.length === 0));
        })
    },
    'Stack': {
        'push': new NativeFunction(['lst', 'val'], (vm, exp) => {
            exp[0].value.push(exp[1]);
            vm.push(NULL());
        }),
        'pop': new NativeFunction(['lst'], (vm, exp, line) => {
            if (exp[0].value.length === 0) {
                throw [
                    `Invalid Operation: Line ${line.line}`,
                    'Popping from an empty stack'
                ];
            }
            vm.push(exp[0].value.pop());
        }),
        'isEmpty': new NativeFunction(['lst'], (vm, exp) => {
            vm.push(BOOL(exp[0].value.length === 0));
        })
    },
    'Collection': {
        'addItem': new NativeFunction(['col', 'val'], (vm, exp) => {
            exp[0].value.data.push(exp[1]);
            vm.push(NULL());
        }),
        'addAll': new NativeFunction(['col', 'val'], (vm, exp, line) => {
            exp[1].assertType(
                'List', 'Collection.addAll only adds lists', line
            );
            exp[0].value.data = exp[0].value.data.concat(exp[1].value);
            vm.push(NULL());
        }),
        'hasNext': new NativeFunction(['col'], (vm, exp) => {
            vm.push(BOOL(exp[0].value.iter < exp[0].value.data.length));
        }),
        'isEmpty': new NativeFunction(['col'], (vm, exp) => {
            vm.push(BOOL(exp[0].value.data.length === 0));
        }),
        'resetNext': new NativeFunction(['col'], (vm, exp) => {
            exp[0].value.iter = 0;
            vm.push(NULL());
        }),
        'getNext': new NativeFunction(['col'], (vm, exp, line) => {
            const col = exp[0].value;
            if (col.iter >= col.data.length) {
                throw [
                    `Invalid Operation: Line ${line.line}`,
                    'Collection reached end of iteration'
                ];
            }
            vm.push(col.data[col.iter++]);
        })
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
                   a === 'List' && b === 'List';
        },
        calc: (a, b) => {
            if (isNum(a.type, b.type)) {
                return new DonkeyObject(comb(a, b), a.value + b.value);
            } else if (a.type === 'List') {
                return new DonkeyObject('List', a.value.concat(b.value));
            } else {
                return new DonkeyObject('string', a.value + b.value);
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
        verify: (a, b) => a === 'List' && b === 'integer',
        calc: (a, b, line) => {
            if (b.value >= a.value.length || b.value < 0) {
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

function repr(exp) {
    if (exp.type === 'string') return `"${exp.value}"`;
    return toString(exp)
}

function toString(exp) {
    switch (exp.type) {
        case 'integer':
        case 'real':
        case 'boolean':
            return exp.value.toString();
        case 'string':
            return exp.value;
        case 'List':
            return `[${exp.value.map(repr).join(', ')}]`;
        case 'null':
            return 'null';
        case 'Stack':
        case 'Queue':
            return `${exp.type}[${exp.value.map(repr).join(', ')}]`;
        case 'Collection':
            const suf = `[${exp.value.data.map(repr).join(', ')}]`;
            return `Collection(ptr=${exp.value.iter})` + suf;
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
    'int': new NativeFunction(['val'], (vm, exp, line) => {
        if (exp[0].type === 'integer') {
            vm.push(exp[0]);
        } else if (exp[0].type === 'real') {
            vm.push(exp[0].map(Math.floor));
        } else if (exp[0].type === 'string') {
            const val = parseInt(exp[0].value);
            if (isNaN(val)) {
                throw [
                    `Value Error: Line ${line.line}`,
                    `string '${exp[0].value}' cannot be converted to an integer`
                ];
            }

            vm.push(INT(val));
        } else {
            throw [
                `Type Error: Line ${line.line}`,
                `'int()' cannot be used on type ${exp[0].type}`
            ];
        }
    }),
    'real': new NativeFunction(['val'], (vm, exp, line) => {
        if (exp[0].type === 'real') {
            vm.push(exp[0]);
        } else if (exp[0].type === 'integer') {
            vm.push(REAL(exp[0].value));
        } else if (exp[0].type === 'string') {
            const val = parseFloat(exp[0].value);
            if (isNaN(val)) {
                throw [
                    `Value Error: Line ${line.line}`,
                    `string '${exp[0].value}' cannot be converted to a real`
                ];
            }

            vm.push(INT(val));
        } else {
            throw [
                `Type Error: Line ${line.line}`,
                `'real()' cannot be used on type ${exp[0].type}`
            ];
        }
    }),
    'stack': new NativeFunction([], (vm, exp, line) => {
        vm.push(new DonkeyObject('Stack', []));
    }),
    'queue': new NativeFunction([], (vm, exp, line) => {
        vm.push(new DonkeyObject('Queue', []));
    }),
    'collection': new NativeFunction([], (vm, exp, line) => {
        vm.push(new DonkeyObject('Collection', new CollectionInner()));
    }),
    '$input': new NativeFunction([], (vm, exp) => {
        const res = prompt('Input: ');
        const msg = `<strong>Input:</strong> <i>'${res}'</i>`;
        outputPrint(msg, '#8ADDFF', false, true);
        vm.push(STR(res));
    })
};

const PRELUDE_FUNCS_NAME = new Set();
Object.keys(NATIVE_FUNCS).forEach(e => PRELUDE_FUNCS_NAME.add(e));
