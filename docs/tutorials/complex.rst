.. highlight:: donkey
.. _comp_data:

Compound Data Types
===================

Compound data types are data types that contains more than just a trivial value (roughly). In pseudocode, there are 4 compound data types:

- List: An ordered container for a group of values, e.g. :code:`[1, "yay", ["nested", "lists"]]`.
- Stack: A first-in-last-out data structure.
- Queue: A first-in-first-out data structure.
- Collection: A container that provides a way to iterate through all its elements.

One key distinction between compound data types and simple data types is that the latter is copied by value; this means that the assignment operator :code:`=` (as well as passing parameters to a function during a function call) copies the value instead of passing a reference to it. In contrast, when a compound data types is assigned to a variable, any modification on the variable will be reflected onto the original object, as both are references to the same object::

    A = [1, 2, 3]
    B = A
    B.add(4)
    output A  // "[1, 2, 3, 4]"
    output B  // "[1, 2, 3, 4]"

This mimics the behavior of non-primitive data structures in most other imperative programming languages. Such a feature can be useful when, e.g., passing a list to another function to modify it in-place.

List
----

A list is an ordered container for a group of values::

    LIST = [2, 3, [9, 10], "yes"]

An element inside a list can be accessed by its index. Note that the first element in a list is the 0-th index. Similarly, an indexed list can act as the left hand side of an assignment; this will replace the element at that index with the right hand side of the assignment::

    LIST = ["A", "B", "C", "D", "E"]
    output LIST[0]  // "A"
    output LIST[4]  // "E"

    LIST[3] = "hello"
    output LIST  // '["A", "B", "C", "hello", "E"]'

.. note::

    The word "array" may sometimes appear in this guide. In the scope of IB Pseudocode, "array" is a synonym for "list", as the official documents often mix the two terms, and make no attempt to discern the difference between them.

The methods available for a list (assuming that it is named :code:`LIST`) are:

    - :code:`LIST.length()`: Returns an integer that represents the length of the list.
    - :code:`LIST.add(VALUE)`: Appends :code:`VALUE` to the end of the list, and returns :code:`null`.
    - :code:`LIST.remove(INDEX)`: Removes the element at :code:`INDEX` (an integer), and returns :code:`null`.
    - :code:`LIST.insert(INDEX, VALUE)`: Inserts :code:`VALUE` into the :code:`INDEX`-th (an integer) position of the list, and returns :code:`null`.

Stack
-----

A stack is a first-in-last-out data structure. It can be viewed as a list: "pushing" a value into the stack adds the value to the end of the list, while "popping" a value removes the **last** value of the list. The "top" of a stack is its last element.

Attempting to pop a value off an empty stack results in an error.

A stack can be created via the :code:`stack()` built-in method, which returns a newly created stack.

The methods available for a stack (assuming that it is named :code:`STACK`) are:

    - :code:`STACK.push(VALUE)`: Pushes :code:`VALUE` into the stack, and returns :code:`null`.
    - :code:`STACK.pop()`: Removes and returns the top element of the stack.
    - :code:`STACK.isEmpty()`: Returns a boolean value indicating whether the stack is empty.
    - :code:`STACK.addAll(ELEMENTS)`: Pushes all elements in :code:`ELEMENTS` (a list) into the stack in the order given by :code:`ELEMENTS`.

An example of using stack::

    FOO = stack()
    FOO.addAll([2, 6])
    output FOO  // "Stack[2, 6]"

    output FOO.pop()  // "6"
    FOO.push(3)
    output FOO.pop()  // "3"
    output FOO.pop()  // "2"
    output FOO.isEmpty()  // "true"

Queue
-----

A queue is a first-in-first-out data structure. It can be viewed as a list: "enqueuing" a value into the stack adds the value to the end of the list, while "dequeuing" a value removes the **first** value of the list. The "top" of a queue is its first element.

Attempting to dequeue a value off an empty queue results in an error.

A queue can be created via the :code:`queue()` built-in method, which returns a newly created queue.

The methods available for a queue (assuming that it is named :code:`QUEUE`) are:

    - :code:`QUEUE.enqueue(VALUE)`: Enqueues :code:`VALUE` into the queue, and returns :code:`null`.
    - :code:`QUEUE.dequeue()`: Removes and returns the top element of the queue.
    - :code:`QUEUE.isEmpty()`: Returns a boolean value indicating whether the queue is empty.
    - :code:`QUEUE.addAll(ELEMENTS)`: Pushes all elements in :code:`ELEMENTS` (a list) into the queue in the order given by :code:`ELEMENTS`.

An example of using queue::

    A = queue()

    A.enqueue("A")
    A.enqueue("B")
    output A.dequeue()  // "A"
    A.enqueue("C")
    output A.dequeue()  // "B"
    output A.dequeue()  // "C"

Collection
----------

A collection is a container that provides a way to iterate through all its elements. Like a list, it is a structure containing an ordered group of values; unlike a list, it does not provide a way to index its elements. The contained elements of a collection is accessed by iterating through it by calling the :code:`getNext()` method.

Each collection has an internal pointer that tracks the current element of the iteration. After a :code:`getNext()` is called, the current element is returned and the internal pointer increments to point to the next element in the collection.

Attempting to continue iterating (by calling :code:`getNext()`) at the end of a collection results in an error.

A collection can be created via the :code:`collection()` built-in method, which returns a newly created collection.

The methods available for a collection (assuming that it is named :code:`COL`) are:

    - :code:`COL.addItem(VALUE)`: Appends :code:`VALUE` to the end of the collection, and returns :code:`null`.
    - :code:`COL.addAll(ELEMENTS)`: Appends all elements in :code:`ELEMENTS` (a list) into the collection in the order given by :code:`ELEMENTS`.
    - :code:`COL.isEmpty()`: Returns a boolean value indicating whether the collection is empty.
    - :code:`COL.resetNext()`: Resets the pointer of the collection to the beginning, and returns :code:`null`.
    - :code:`COL.getNext()`: Returns the current element in the collection and increments the collection pointer to point to the next element.
    - :code:`COL.hasNext()`: Returns :code:`true` if there are still elements ahead in the collection (i.e. returns :code:`false` if the collection's pointer has reached past the last element of the collection).

An example of using collection::

    X = collection()
    X.addAll(["Alpha", "Beta", "Gamma", "Delta"])

    loop while X.hasNext()
        output "Name: ", X.getNext()
    end loop

    X.resetNext()
    loop while X.hasNext()
        output "Name again: ", X.getNext()
    end loop

The above code iterates through the collection twice with a :code:`while` loop, and prints out the names in the collection twice.
