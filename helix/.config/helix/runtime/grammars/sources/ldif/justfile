set positional-arguments
alias b := build
alias g := gen
alias t := test
alias c := case
alias h := highlight

case arg:
    tree-sitter test -f {{arg}}

gen:
    tree-sitter generate

build:
    tree-sitter generate

test: build
    tree-sitter test

debug:
    tree-sitter parse --debug-build

parse:
    tree-sitter parse

highlight arg="examples/ast.ldif":
    tree-sitter highlight {{arg}}

default:
  just --list
