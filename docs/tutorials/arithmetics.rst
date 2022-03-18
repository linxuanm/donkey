.. _arithmetics:

Arithmetics
===========

This chapter covers the arithmetic operations on data types. This includes trivial mathematical operations such as addition and multiplication, as well as boolean logic and overloaded operators on other types.

Mathematical Operations
-----------------------

Mathematical operations in pseudocode are similar to that in any other languages. For instance, the addition of two integers::

    A = 24
    B = 45
    output A + B  // outputs "69"

There are 5 math related binary operations: :code:`+`, :code:`-`, :code:`*`, :code:`/` and :code:`%`, which correspondes to addition, subtraction, multiplication, division and modulus respectively. Operators have precedence, i.e. :code:`A + B * C` is interpreted as :code:`A + (B * C)`.

.. note::

    According to the IB Pseudocode Guide, the division and modulus operators are commonly written in word form: :code:`div` and :code:`mod`. Donkey IDE also supports this. :code:`div` is functionally identical to :code:`/` and the same applies to :code:`mod` and :code:`%`. For example, :code:`32 mod 3` is the same as :code:`32 % 3`.

Note that the quotient of integers is a real number (contains decimal points). To perform integer division, simply wrap the expression in :code:`int()` to round it down::

    output int(20 / 3)  // outputs "6"

The integer conversion function is crucial, as certain operations require an integer type instead of a real number (even if the real is a whole number), such as indexing an array.

In addition, the subtraction operator :code:`-` can be used as a unary operator to negate a numeric value::

    A = 20
    output -A  // outputs "-20"

Comparison Operators
--------------------

Comparison operators compare two values. For instance, :code:`A <= B` evaluates to :code:`true` if :code:`A` is less than or equal to :code:`B`, and :code:`false` otherwise.

There are 6 comparison operators in pseudocode:

- :code:`A == B`: Tests for equality of :code:`A` and :code:`B`. Returns :code:`true` if the two operands are equal.
- :code:`A != B`: Tests for inequality. Returns :code:`true` if the two operands are not equal.
- :code:`A < B`: Returns :code:`true` if :code:`A` is strictly less than :code:`B`.
- :code:`A <= B`: Returns  :code:`true` if :code:`A` is less than or equal to :code:`B`.
- :code:`A > B`: Returns :code:`true` if :code:`A` is strictly greater than :code:`B`.
- :code:`A >= B`: Returns :code:`true` if :code:`A` is greater than or equal to :code:`B`.

While most of the above operators only work on numeric types (i.e. :code:`integer` and :code:`real`), the equality operator :code:`==` and inequality operator :code:`!=` works on all basic data types, and behaves according to the operands equality. For instance, equality of strings can be tested as such::

    output "abc" == "abc"  // outputs "true"

Note that the equality and inequality operators does **NOT** work on compound data types. This means that the equality of, for instance, lists cannot be tested with the equality operator.

Boolean Logic Operators
-----------------------

Boolean logic operators act on operands of type :code:`boolean`. There are 3 boolean operators:
- :code:`A and B`: Returns :code:`true` if both :code:`A` and :code:`B` are :code:`true`.
- :code:`A or B`: Returns :code:`true` if either :code:`A` or :code:`B` is :code:`true`.
- :code:`not A`: Returns the opposite of :code:`A`, i.e. :code:`not true` returns :code:`false`.

.. note::

    Many official IB documents use the capitalized :code:`AND`, :code:`OR` and :code:`NOT` for boolean logic. However, this contradicts with IB's "all keywords are lowercased while variable names are uppercased". Since using uppercase for boolean operators makes absolutely no sense, Donkey IDE adheres to the "lowercase keyword" rule.

In addition to the above operators, there is also the unary operator :code:`!`. This operator, like the :code:`not` operator, inverses the given boolean value. However, this operator has a higher precedence than any of the comparison operators (this design choice mimics the precedence of the :code:`!` operator in  most other programming languages).

Precedence Table
----------------

The following table lists all the operators from highest precedence to lowest precedence:

1. :code:`!`, :code:`-` (negate)
2. :code:`*`, :code:`div`, :code:`mod`, :code:`/`, :code:`%`
3. :code:`+`, :code:`-` (subtraction)
4. :code:`==`, :code:`!=`, :code:`>=`, :code:`<=`, :code:`>`, :code:`<`
5. :code:`not`
6. :code:`and`
7. :code:`or`