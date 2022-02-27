const PRELUDE_FUNCS = [
    'int', 'real', 'str', 'stack', 'queue', 'collection',
    '$input', '$output'
];

const PRELUDE_FUNCS_NAME = new Set();
PRELUDE_FUNCS.forEach(e => PRELUDE_FUNCS_NAME.add(e));

NATIVE_FUNCS = {
    '$output': new NativeFunction(['msg'], (vm, exp) => {
        console.log(exp[0]);
    })
};
