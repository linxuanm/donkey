import sphinx_rtd_theme

import pygments
from sphinx.highlighting import lexers
from pygments import token


project = 'Donkey'
copyright = '2022, Linxuan Ma'
author = 'Linxuan Ma'

extensions = [
    'sphinx_rtd_theme'
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
html_extra_path = ['google3c1478204fd5b178.html']


keywords = [
    'if', 'else', 'then', 'do', 'for', 'until'
    'while', 'from', 'to', 'loop', 'end',
    'div', 'mod', 'not', 'and', 'or', 'func'
]

statements = ['input', 'output', 'break', 'continue', 'return']
types = ['int', 'str', 'real', 'stack', 'queue', 'collection']


def union(strs):
    return r'\b(' + '|'.join(f'{i}' for i in strs) + r')\b'


class DonkeyLexer(pygments.lexer.RegexLexer):

    name = 'donkey'

    tokens = {
        'root': [
            (r'\/\/.*\n', token.Comment),
            (union(keywords), token.Keyword.Reserved),
            (union(statements), token.Keyword.Namespace),
            (union(types), token.Keyword.Type),
            (r'("[^"]*")|(\'[^\']*\')', token.String),
            (r'\s', token.Text.Whitespace),
            (r'[_a-zA-Z][_a-zA-Z0-9]*', token.Name),
            (r'[-!$%^&*()_+|~=`{}\[\]:;<>?,.\/]', token.Text),
            (r'true|false|null', token.Keyword.Constant),
            (r'-?[0-9]+(\.[0-9]+)?', token.Literal.Number),
        ]
    }


pygments_style = 'friendly'
lexers['donkey'] = DonkeyLexer()
