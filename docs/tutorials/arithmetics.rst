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
