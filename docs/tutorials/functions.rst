.. highlight:: donkey

Functions
=========

The syntax of defining a function is as follows::

    func <func_name>(<param_1>, <param_2>, ..., <param_n>)
        <code>
    end <func_name>

The :code:`end` statement at the end of a function declaration must match the name of the function.

Each function can take in any number of parameters. Note that there is no requirements on the type of the parameter; function parameters are type agnostic.

The order of function definition also doesn't matter; a function can be called in the global scope before it is defined.

.. note::

    In the original IB specification, functions are defined without the initial :code:`func` keyword; however, this leads to an ambiguous grammar (due to the grammar also being whitespace agnostic). An example of this ambiguity is::

        my_func(x)

        my_func(y)
            output y
        end my_fuc
    
    As a workaround, the :code:`func` keyword was added.

Invoking a Function
-------------------

A function can be invoked with the following syntax::

    <func_name>(<param_1>, ..., <param_n>)

A functionn invocation can be a statement on its own (even with a return value, in which case the value is simply discarded), or a value.

:code:`return` Statement

The :code:`return` statement is used to pass an value out from a function and terminate the function, i.e. the result of the function. Its syntax is as follows::

    return <value>

Note that a :code:`return` statement must be inside a function.

If a function has no :code:`return` statement and reaches to the end of its code, it will return :code:`null`.

For example, the following code will print out :code:`3`::

    func my_func(x)
        return x + 2
    end my_func

    output my_func(1) // "3"
