.. _debugging:

Debugging
=========

This section covers the debugger feature of Donkey.

The debugger (section 3 in the image below) is a tool to help you debug by providing a way to trace through your code.

.. image:: images/ui_demo.png
   :width: 600

The debugger is usually inactive unless Donkey is ran in debug mode (by pressing the "bug" icon instead of the "play" bytton). Once a program is ran in debug mode, it will pause on every break point, and display some relevant information in the debugger window.

The program is paused indefinitely once a break point is hit, and will only continue if the user manually presses the "continue" button (appears in the location of the "play" button once Donkey enters debug mode).

Break Points
------------

A break point :code:`;;` is a statement that pauses your program when ran in debug mode (it has no effects in regular executions). The same break poinnt can be hit multiple times if it is placed innside a for/while loop or inside a function.

Just like any other statements, a break point has to be placed in a separate line::

    ARR = [2, 4, 6, 7, 8]
    loop for I from 0 to ARR.length() - 1
        CURR = ARR[i]
        ;;
    end loop

The above code, when ran in debug mode, will pause 5 times.

Debugger Information
-----------------------

When a break point is hit, relevant information regarding the specific break point will be printed out in the debugger window. This includes:

- The line number of the break point.
- Values of local variables within the same function of the break point (none if the break point is not inside any functions).
- Values of global variables.
