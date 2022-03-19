Introduction
============

Donkey IDE is an online developing and debugging environment for the IB Computer Science Pseudocode. Donkey supports the IB Pseudocode syntax, as well as the numerous data structures that may appear in an IB CS exam (:code:`stack`, :code:`queue`, :code:`collection`, etc.).

The current version can be accessed `here <http://donkey.davidma.cn>`_.

.. note::

    The IB CS board is notorious for making mistakes in official resources and exam papers. This unfortunately resulted in contradictory code behavior specifications and ambiguous syntax in their pseudocode standard. To eliminate those problems, Donkey IDE incorporates a stricter subset of the IB Pseudocode syntax while retaining all the functionalities.

User Interface
--------------

Donkey IDE has a simple user interface consisting of few components.

.. image:: images/ui_demo.png
   :width: 600

The labeled components are:

1. Code editor. This is where code is written.
2. Program output. The output of the program will be displayed here when the program is executed.
3. Debugging output. The content of all variables will be dumped here after a breakpoint is hit (:ref:`debugging`)

Press the play button in the middle to execute the code.

That's it! To start writing pseudocode, check out :ref:`basics`.
