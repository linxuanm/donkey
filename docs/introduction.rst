Introduction
============

Donkey IDE is an online developing and debugging environment for the IB Computer Science Pseudocode. Donkey supports the IB Pseudocode syntax, as well as the numerous data structures that may appear in an IB CS exam (:code:`stack`, :code:`queue`, :code:`collection`, etc.).

The current version can be accessed `here <http://code.mightymullan.com>`_.

.. note::

    It is common knowledge that the IB CS board is not very intelligent and, in fact, has no fucking clue as to what they are doing. This unfortunately resulted in severely contradictary behavior specifications and ambiguous syntax in their pseudocode standard. To eliminate those problems, Donkey IDE incorporates a stricter subset of the IB Pseudocode syntax while retaining all the functionalities.

User Interface
--------------

Donkey IDE has a simple user interface consisting of few components.

.. image:: images/ui_demo.png
   :width: 600

The labeled components are:

1. Code editor. This is where code is written.
2. Program output. The output of the program will be displayed here when the program is executed.
3. Debugging output. The content of all variables will be dumped here after a breakpoint is hit (:ref:`debugging`)
