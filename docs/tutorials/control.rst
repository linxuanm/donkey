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
        output "value is greater than 10"
    else
        if X < 10 then
            output "value is less than 10"
        else
            output "value is equal to 10"
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
        output X, " is not greater than 100"
        X = X + 1
    end loop

.. note::

    The :code:`loop until` statement is just a syntax sugar for the :code:`loop while` statement, but with an extra :code:`not` operator that surrounds the whole conditional value.

:code:`for` Loop
----------------

The :code:`for` loop enumerates a variable (referred to as the "loop variable") between two values (inclusive). At the end of each iteration, it increments the loop variable by 1. Note that changing the loop variable inside the loop will affect the enumeration of the :code:`for` loop.

An example of the :code:`for` loop that enumerates between an interval::

    CENTER = 20
    loop I from CENTER - 10 to CENTER + 7
        // outputs numbers from 10 to 27 (inclusive)
        output I
    end loop

.. note::

    The loop variable will still be defined after the loop has finished.

Note that there is no decremental :code:`for` loop or :code:`for` loop with custom increments at the end of each iteration as the IB Pseudocode standard did not mention such feature. This behavior can be trivially implemented with a :code:`while` loop though.

:code:`break` and :code:`continue`
----------------------------------

The :code:`break` and :code:`continue` statements are used for early-terminating a loop and jump to next iteration respectively.

The :code:`break` statement exits the current (inner-most) loop immediately, abandoning the rest of the unexecuted statements in the current iteration as well as any subsequent iterations.

For instance, the following code locates the index of the first occurence of 5 in array :code:`ARR`::

    loop I from 0 to ARR.length() - 1
        if ARR[I] == 5 then
            output "5 found at index ", I
            break
        end if
    end loop

The :code:`continue` statement jumps to the end of the current iteration, abandoning all unexecuted code in the current iteration.

For instance, the following code prints out all even numbers from 0 to 100::

    loop I from 0 to 100
        if I % 2 == 1 then
            continue
        end if

        output I
    end loop

The :code:`break` and :code:`continue` works on both :code:`for` and :code:`while` loops.
