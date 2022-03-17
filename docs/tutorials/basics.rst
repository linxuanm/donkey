.. highlight:: donkey
.. _basics:

Basic Syntax
============

The IB Pseudocode is an imperative language that supports basic assignments, control flow statements and function declaration and calling. The language is whitespace insensitive, except that statements are separated by line breaks.

Assignment & Values
-------------------

The syntax for assignment is::

    FOO = 12  // an integer
    BAR = "a string"  // a string
    MY_LIST = [1, 2, [], "abc", true]  // lists are heterogeous

Programming is centered around values. In pseudocode, there are 5 basic types of value:

- Integer: A value that represents a whole number, e.g. :code:`2`, :code:`69`, :code:`114514`.
- Real: A value that represents a floating point number, e.g. :code:`69.6969`, :code:`3.14159`.
- String: A text sequence, e.g. :code:`"donkey"`, :code:`'YAY'`. Both single and double quotes works.
- Boolean: A value of either :code:`true` or :code:`false`.
- Null: A single value :code:`null` that denotes the absence of a valid value.

In addition, there are 4 types of compound values (see :ref:`comp_data` for more information):

- List: An ordered container for a group of values, e.g. :code:`[1, "yay", ["nested", "lists"]]`.
- Stack: A first-in-last-out data structure.
- Queue: A first-in-first-out data structure.
- Collection: A container that provides a way to iterate through all its elements.

All basic values are pass-by-value, while all compound values are pass-by-reference.

Note that there is no variable declaration; assigning a value to a variable automatically "declares" it.

In addition, all variables should be capitalized according to the IB Pseudocode standard. However this isn't enforced in Donkey IDE, as there has been numerous cases where IB uses lower-case variable names in official documents (which is erroneous, but considering this is IB CS, what did you expect?). Nonetheless, this documentation will adhere to using capitalized variable names.

Type Conversions
----------------

There are a few convenient built-in functions for converting between types:

- :code:`int`: Converts the given value into an integer (rounds real numbers down to the nearest integer, and parses strings into the integer that they represent).
- :code:`real`: Converts the given value into a real number (changes the type of integers to 'real', and parses strings into the (floating point) number that they represent).
- :code:`str`: Represents the given value with a string. Works on all data types.

Conversion examples::

    NUM_STR = "42"  // a number written as a string
    NUM = int(NUM_STR) * 2  // "NUM" is integer 84

    MY_LIST = [1, 2, 3, 4]
    LIST_STR = str(MY_LIST)  // 'LIST_STR' is string "[1, 2, 3, 4]"

Input & Output
--------------

The input statement prompts the user to input a string, and stores the value in the variable after it::

    input N  // reads a string and stores it in variable "N"

Note that :code:`N` in the above code does not have to be defined previously.

.. note::

    Actually :code:`input <var_name>` translates to :code:`<var_name> = $input()` in the parsing phrase. This makes its behavior regarding :code:`<var_name>` identical to a simple assignment statement.

It is crucial to remember that all inputted values are strings, and therefore needs explicit conversion if an integer/real number input is expected::

    input NUMBER
    NUMBER = int(NUMBER)

    input DECIMAL
    DECIMAL = real(DECIMAL)

The output statement prints a line to the program output. It has a similar syntax to the input statement::

    output "Hello"  // outputs a string
    output 123  // outputs a number
    output N  // outputs the content of a variable

The output statement also accepts multiple parameters at once; the resulting output will simply be their concatenation::

    NAME = "Amy"
    AGE = 19
    output NAME, " is ", AGE, " years old"  // outputs "Amy is 19 years old"

:code:`output` automatically connverts its parameters into strings. This behavior is identical to wrapping each parameter in the :code:`str` conversion function.