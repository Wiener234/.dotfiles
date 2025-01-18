# tree-sitter-xtc

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) parser for XTC (Xena
Traffic Configuration) / XOA (Xena OpenAutomation).

The parser is designed to read Xena Traffic Configuration files, but also
include [MT2](https://mt2.fr) template rules. This kind of XTC dialect is
is used for certification in the Broadband Forum of PON (Passive Optical
Network) technologies, such as the
[BBF.247](https://www.broadband-forum.org/testing-and-certification-programs/bbf-247-gpon-onu-certification)

## Goals

This is still a simple project,
with the aim to provide syntax highlighting for .xtc/.xoa files for the [Helix editor](https://helix-editor.com/).
Support may be expanded for other editor when the need arise.

## Limitations

I did not write unit tests for this tree sitter implementation.

## Sources

My work is based on what is available on
https://docs.xenanetworks.com/projects/xoa-cli/en/latest/index.html
