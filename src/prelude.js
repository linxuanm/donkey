import * as Runtime from './runtime';

class CollectionInner {

    constructor() {
        this.data = [];
        this.iter = 0;
    }
}

export const UN_OP = {
    'not': (b) => {
        b.assertType(
            'boolean',
            '\'not\' can only be applied to boolean'
        );
        return b.map(v => !v);
    },
    '!': (b) => {
        b.assertType(
            'boolean',
            '\'!\' can only be applied to boolean'
        );
        return b.map(v => !v);
    },
    '-': (x) => {
        x.assertType(
            'number',
            '\'-\' can only be applied to numeric types'
        );
        return x.map(v => -v);
    }
};

export const METHODS = {
    'List': {
        '$setIndex': new Runtime.NativeFunction(['lst', 'idx', 'exp'], (vm, exp) => {
                exp[1].assertType(
                    'integer',
                    `Index must be of type integer, but got '${exp[1].type}'`
                );
                const lst = exp[0].value;
                const idx = exp[1].value;
                if (idx >= lst.length || idx < 0) {
                    throw new Runtime.VMError(
                        'Index Error',
                        `Assigning to index ${idx} of list with \
                        length ${lst.length}`
                    );
                }

                lst[idx] = exp[2];
                vm.push(Runtime.NULL());
        }),
        'length': new Runtime.NativeFunction(['lst'], (vm, exp) => {
            vm.push(Runtime.INT(exp[0].value.length));
        }),
        'add': new Runtime.NativeFunction(['lst', 'val'], (vm, exp) => {
            exp[0].value.push(exp[1]);
            vm.push(Runtime.NULL());
        }),
        'remove': new Runtime.NativeFunction(['lst', 'idx'], (vm, exp) => {
            exp[1].assertType(
                'integer',
                `Index must be of type integer, but got '${exp[1].type}'`
            );
            const lst = exp[0].value;
            const idx = exp[1].value;
            if (idx >= lst.length || idx < 0) {
                throw new Runtime.VMError(
                    'Index Error',
                    `Removing index ${idx} of list with \
                    length ${lst.length}`
                );
            }

            lst.splice(idx, 1);
            vm.push(Runtime.NULL());
        }),
        'insert': new Runtime.NativeFunction(['lst', 'idx', 'exp'], (vm, exp) => {
            exp[1].assertType(
                'integer',
                `Index must be of type integer, but got '${exp[1].type}'`
            );
            const lst = exp[0].value;
            const idx = exp[1].value;
            if (idx >= lst.length || idx < 0) {
                throw new Runtime.VMError(
                    'Index Error',
                    `Inserting at index ${idx} of list with \
                    length ${lst.length}`
                );
            }

            lst.splice(idx, 0, exp[2]);
            vm.push(Runtime.NULL());
    })
    },
    'Queue': {
        'enqueue': new Runtime.NativeFunction(['lst', 'val'], (vm, exp) => {
            exp[0].value.push(exp[1]);
            vm.push(Runtime.NULL());
        }),
        'dequeue': new Runtime.NativeFunction(['lst'], (vm, exp) => {
            if (exp[0].value.length === 0) {
                throw new Runtime.VMError(
                    'Invalid Operation',
                    'Dequeuing from an empty queue'
                );
            }
            vm.push(exp[0].value.shift());
        }),
        'isEmpty': new Runtime.NativeFunction(['lst'], (vm, exp) => {
            vm.push(Runtime.BOOL(exp[0].value.length === 0));
        }),
        'addAll': new Runtime.NativeFunction(['col', 'val'], (vm, exp) => {
            exp[1].assertType('List', 'Queue.addAll only adds lists');
            exp[0].value = exp[0].value.concat(exp[1].value);
            vm.push(Runtime.NULL());
        })
    },
    'Stack': {
        'push': new Runtime.NativeFunction(['lst', 'val'], (vm, exp) => {
            exp[0].value.push(exp[1]);
            vm.push(Runtime.NULL());
        }),
        'pop': new Runtime.NativeFunction(['lst'], (vm, exp) => {
            if (exp[0].value.length === 0) {
                throw new Runtime.VMError(
                    `Invalid Operation`,
                    'Popping from an empty stack'
                );
            }
            vm.push(exp[0].value.pop());
        }),
        'isEmpty': new Runtime.NativeFunction(['lst'], (vm, exp) => {
            vm.push(Runtime.BOOL(exp[0].value.length === 0));
        }),
        'addAll': new Runtime.NativeFunction(['col', 'val'], (vm, exp) => {
            exp[1].assertType('List', 'Stack.addAll only adds lists');
            exp[0].value = exp[0].value.concat(exp[1].value);
            vm.push(Runtime.NULL());
        })
    },
    'Collection': {
        'addItem': new Runtime.NativeFunction(['col', 'val'], (vm, exp) => {
            exp[0].value.data.push(exp[1]);
            vm.push(Runtime.NULL());
        }),
        'addAll': new Runtime.NativeFunction(['col', 'val'], (vm, exp) => {
            exp[1].assertType('List', 'Collection.addAll only adds lists');
            exp[0].value.data = exp[0].value.data.concat(exp[1].value);
            vm.push(Runtime.NULL());
        }),
        'hasNext': new Runtime.NativeFunction(['col'], (vm, exp) => {
            vm.push(Runtime.BOOL(exp[0].value.iter < exp[0].value.data.length));
        }),
        'isEmpty': new Runtime.NativeFunction(['col'], (vm, exp) => {
            vm.push(Runtime.BOOL(exp[0].value.data.length === 0));
        }),
        'resetNext': new Runtime.NativeFunction(['col'], (vm, exp) => {
            exp[0].value.iter = 0;
            vm.push(Runtime.NULL());
        }),
        'getNext': new Runtime.NativeFunction(['col'], (vm, exp) => {
            const col = exp[0].value;
            if (col.iter >= col.data.length) {
                throw new Runtime.VMError(
                    'Invalid Operation',
                    'Collection reached end of iteration'
                );
            }
            vm.push(col.data[col.iter++]);
        })
    }
};

const uniNum = x => x === 'integer' || x === 'real';
const isNum = (at, bt) => uniNum(at) && uniNum(bt);
const isBool = (at, bt) => at === 'boolean' && bt === 'boolean';
const comb = (a, b) => a.type === 'real' || b.type === 'real' ? 'real' : 'integer';
export const BIN_OP = {
    '+': {
        verify: (a, b) => {
            return isNum(a, b) ||
                   a === 'string' && b === 'string' ||
                   a === 'List' && b === 'List';
        },
        calc: (a, b) => {
            if (isNum(a.type, b.type)) {
                return new Runtime.DonkeyObject(comb(a, b), a.value + b.value);
            } else if (a.type === 'List') {
                return new Runtime.DonkeyObject('List', a.value.concat(b.value));
            } else {
                return new Runtime.DonkeyObject('string', a.value + b.value);
            }
        }
    },
    '-': {
        verify: isNum,
        calc: (a, b) => new Runtime.DonkeyObject(comb(a, b), a.value - b.value)
    },
    '*': {
        verify: isNum,
        calc: (a, b) => new Runtime.DonkeyObject(comb(a, b), a.value * b.value)
    },
    '/': {
        verify: isNum,
        calc: (a, b) => {
            if (b.value == 0) throw new Runtime.VMError(
                'Value Error', 'Division by 0'
            );
            return new Runtime.DonkeyObject('real', a.value / b.value);
        }
    },
    '%': {
        verify: isNum,
        calc: (a, b) => {
            if (b.value == 0) throw new Runtime.VMError(
                'Value Error', 'Division by 0'
            );
            return new Runtime.DonkeyObject(comb(a, b), a.value % b.value);
        }
    },
    '==': {
        verify: (a, b) => true,
        calc: (a, b) => Runtime.BOOL(a.type === b.type && a.value === b.value)
    },
    '!=': {
        verify: (a, b) => true,
        calc: (a, b) => Runtime.BOOL(a.type !== b.type || a.value !== b.value)
    },
    '<=': {
        verify: isNum,
        calc: (a, b) => Runtime.BOOL(a.value <= b.value)
    },
    '>=': {
        verify: isNum,
        calc: (a, b) => Runtime.BOOL(a.value >= b.value)
    },
    '<': {
        verify: isNum,
        calc: (a, b) => Runtime.BOOL(a.value < b.value)
    },
    '>': {
        verify: isNum,
        calc: (a, b) => Runtime.BOOL(a.value > b.value)
    },
    'and': {
        verify: isBool,
        calc: (a, b) => Runtime.BOOL(a.value && b.value)
    },
    'or': {
        verify: isBool,
        calc: (a, b) => Runtime.BOOL(a.value || b.value)
    },
    'index': {
        verify: (a, b) => a === 'List' && b === 'integer',
        calc: (a, b) => {
            if (b.value >= a.value.length || b.value < 0) {
                throw new Runtime.VMError(
                    'Index Error',
                    `Accessing index ${b.value} of list with length ${a.value.length}`
                );
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

export const NATIVE_FUNCS = {
    '$output': new Runtime.NativeFunction(['msg'], (vm, exp) => {
        vm.handles.print(toString(exp[0]));
        vm.push(Runtime.NULL());
    }),
    'str': new Runtime.NativeFunction(['val'], (vm, exp) => {
        vm.push(Runtime.STR(toString(exp[0])));
    }),
    'int': new Runtime.NativeFunction(['val'], (vm, exp) => {
        if (exp[0].type === 'integer') {
            vm.push(exp[0]);
        } else if (exp[0].type === 'real') {
            vm.push(Runtime.INT(Math.floor(exp[0].value)));
        } else if (exp[0].type === 'string') {
            const val = parseInt(exp[0].value);
            if (isNaN(val)) {
                throw new Runtime.VMError(
                    `Value Error`,
                    `string '${exp[0].value}' cannot be converted to an integer`
                );
            }

            vm.push(Runtime.INT(val));
        } else {
            throw new Runtime.VMError(
                `Type Error`,
                `'int()' cannot be used on type ${exp[0].type}`
            );
        }
    }),
    'real': new Runtime.NativeFunction(['val'], (vm, exp) => {
        if (exp[0].type === 'real') {
            vm.push(exp[0]);
        } else if (exp[0].type === 'integer') {
            vm.push(Runtime.REAL(exp[0].value));
        } else if (exp[0].type === 'string') {
            const val = parseFloat(exp[0].value);
            if (isNaN(val)) {
                throw new Runtime.VMError(
                    'Value Error',
                    `string '${exp[0].value}' cannot be converted to a real`
                );
            }

            vm.push(Runtime.INT(val));
        } else {
            throw new Runtime.VMError(
                'Type Error',
                `'real()' cannot be used on type ${exp[0].type}`
            );
        }
    }),
    'stack': new Runtime.NativeFunction([], (vm, exp) => {
        vm.push(new Runtime.DonkeyObject('Stack', []));
    }),
    'queue': new Runtime.NativeFunction([], (vm, exp) => {
        vm.push(new Runtime.DonkeyObject('Queue', []));
    }),
    'collection': new Runtime.NativeFunction([], (vm, exp) => {
        vm.push(new Runtime.DonkeyObject('Collection', new CollectionInner()));
    }),
    '$input': new Runtime.NativeFunction([], (vm, exp) => {
        const res = prompt('Input: ');
        const msg = `<strong>Input:</strong> <i>'${res}'</i>`;
        outputPrint(msg, '#8ADDFF', false, true);
        vm.push(Runtime.STR(res));
    })
};

export const PRELUDE_FUNCS_NAME = new Set();
Object.keys(NATIVE_FUNCS).forEach(e => PRELUDE_FUNCS_NAME.add(e));
