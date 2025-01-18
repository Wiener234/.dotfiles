# ADL Tree-sitter grammar

## Add to HX Editor

1. Add a `[[language]]` and `[[grammar]]` entry to the HX editor's `languages.toml` file. I.E. add the following to `~/.config/helix/languages.toml`

``` toml
# ~/.config/helix/languages.toml
[[language]]
name = "adl"
scope = "source.adl"
file-types = ["adl"]
roots = []
indent = { tab-width = 2, unit = "  " }

[[grammar]]
name = "adl"
source = { git = "https://github.com/adl-lang/tree-sitter-adl", rev = "63fa3696400f9eb05e6dd1d31591f4ee80a00d7a" }
```

2. Get HX to clone and build the `adl` tree-sitter grammar.

``` bash
hx --grammar fetch
hx --grammar build
```

**NOTE:** this will clone and build all 162 (at the time of writting) grammars in the HX global config. It might be possible to clone just tree-sitter-adl and build it.
The following might work (with errors reported for all the globally defined grammars).

``` bash
git clone https://github.com/adl-lang/tree-sitter-adl.git ~/.config/helix/runtime/grammars/sources/adl
hx --grammar build
```

3. Copy the `queries` from the clone repo into the HX expected folder

``` bash
mkdir -p ~/.config/helix/runtime/queries/adl
cp ~/.config/helix/runtime/grammars/sources/adl/queries/* ~/.config/helix/runtime/queries/adl/
```

4. Edit an ADL file in HX

5. Debug

``` bash
tail -f ~/.cache/helix/helix.log
```