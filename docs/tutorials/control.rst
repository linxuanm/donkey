.. highlight:: donkey

Control Flows
=============

Control flow is the execution order and the set of instructions that will be executed in the program. In pseudocode, this includes statements such as :code:`if` and :code:`loop`, as well as complementary statements such as :code:`break` and :code:`continue`.

To illustrate, here is a simple program with control flow statements::

    loop I from 0 to 100
        if I % 5 == 0 then
            output I
        end if
    end loop

:code:`if` Statement
--------------------

The :code:`if` statement determines whether a piece of code should be executed based on a runtime boolean value. Its syntax is as follows (placeholder values are surronded by :code:`<>`)::

    if <conditional_value> then
        <statements>
    end if

If :code:`<conditional_value>` is :code:`true`, then :code:`<statements>` will be executed; if :code:`<conditional_value>` is :code:`false`, then :code:`<statements>` will be skipped.

.. note::

    All conditional values in pseudocode must be a boolean. If any other type is encountered, an error will be thrown.

An :code:`else` component can be added to an :code:`if` statement. The contained statements will be executed if the conditional value is :code:`false`::

    if <conditional_value> then
        <if_statements>
    else
        <else_statements>
    end if

Note that :code:`if` can be nested inside :code:`else`. This is just a syntax sugar that makes mimicing a switch statement easier. For example, the below code::

    if X > 10 then
        output "X is greater than 10"
    else if X < 10 then
        output "X is less than 10"
    else
        output "X is equal to 10"
    end if

is equivalent to::

    if X > 10 then
        output "X is greater than 10"
    else
        if X < 10 then
            output "X is less than 10"
        else
            output "X is equal to 10"
        end if
    end if

The last :code:`else` statement is optional in the switch-like statement.

:code:`while` Loop
------------------

The :code:`while` loop repeatedly executes the containing statements according to the given conditional value.

In a :code:`loop while` statement, the containing statements is repeatedly executed as long as the given conditional value is :code:`true`::

    X = 0
    loop while X < 20
        output X, " is less than 20"
        X = X + 1
    end loop

In a :code:`loop until` statement, the containing statements is repeatedly executed until the given conditional value is :code:`true` (i.e. repeats as long as the conditional value is :code:`false`)::

    X = 0
    loop until X > 100
        output "X is not greater than 100"
        X = X + 1
    end loop

.. note::

    The :code:`loop until` statement is just a syntax sugar for the :code:`loop while` statement, but with an extra :code:`not` operator that surrounds the whole expression.

:code:`for` Loop
----------------
