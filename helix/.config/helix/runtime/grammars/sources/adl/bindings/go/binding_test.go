package tree_sitter_adl_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-adl"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_adl.Language())
	if language == nil {
		t.Errorf("Error loading Adl grammar")
	}
}
