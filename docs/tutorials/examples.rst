.. highlight:: donkey
.. _examples:

Examples
=========

Below are some example code written in donkey.

Recursive Sort
--------------

The following function :code:`sort` sorts a given list with a recursive algorithm::

    func sort(A)
        if A.length() <= 1 then
            return A
        else
            REF = A[0]
            LESS = []
            MORE = []
            loop I from 1 to A.length() - 1
                if A[I] <= REF then
                    LESS.add(A[I])
                else
                    MORE.add(A[I])
                end if
            end loop
            return sort(LESS) + [A[0]] + sort(MORE)
        end if
    end sort

    output sort([9, 5, 3, 2, 1, 5, 7, 1, 8, 6, 3, 2])

N-Queen Problem
---------------

The following code solves the `N-Queen <https://en.wikipedia.org/wiki/Eight_queens_puzzle>`_ problem with brute force::

    func nQueen(BOARD, N, DEPTH)
        if DEPTH == N then
            logBoard(BOARD)
            return
        end if
        loop I from 0 to N - 1
            BAD = false
            loop ROW from 0 to DEPTH - 1
                D_COL = abs(I - BOARD[ROW])
                D_ROW = abs(DEPTH - ROW)
                if I == BOARD[ROW] or D_COL == D_ROW then
                    BAD = true
                    break
                end if
            end loop
            
            if not BAD then
                BOARD[DEPTH] = I
                nQueen(BOARD, N, DEPTH + 1)
            end if
        end loop
    end nQueen

    func abs(X)
        if X < 0 then
            return -X
        end if
        return X
    end abs

    func logBoard(BOARD)
        N = BOARD.length()
        loop I from 0 to N - 1
            LINE = ''
            loop CNT from 0 to BOARD[I] - 1
                LINE = LINE + ' . '
            end loop
            LINE = LINE + ' # '
            loop CNT from BOARD[I] + 1 to N - 1
                LINE = LINE + ' . '
            end loop
            
            output LINE
        end loop
        output "---"
    end logBoard

    nQueen([0, 0, 0, 0, 0, 0], 6, 0)
