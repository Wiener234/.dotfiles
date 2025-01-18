/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "ld",
  extras: ($) => [/\s/, $.comment],
  word: ($) => $.NAME,
  rules: {
    script_file: ($) => repeat($.ifile_p1),

    extern_name_list: ($) => sep1($.NAME, optional(",")),

    filename: ($) => $.NAME,
    ifile_p1: ($) =>
      choice(
        $.memory,
        $.sections,
        $.phdrs,
        $.startup,
        $.high_level_library,
        $.low_level_library,
        $.floating_point_support,
        $.statement_anywhere,
        $.version,
        ";",
        seq("TARGET", "(", $.NAME, ")"),
        seq("SEARCH_DIR", "(", $.filename, ")"),
        seq("OUTPUT", "(", $.filename, ")"),
        seq("OUTPUT_FORMAT", "(", $.NAME, ")"),
        seq("OUTPUT_FORMAT", "(", $.NAME, ",", $.NAME, ",", $.NAME, ")"),
        seq("OUTPUT_ARCH", "(", $.NAME, ")"),
        "FORCE_COMMON_ALLOCATION",
        "FORCE_GROUP_ALLOCATION",
        "INHIBIT_COMMON_ALLOCATION",
        seq("INPUT", "(", $.input_list, ")"),
        seq("GROUP", "(", $.input_list, ")"),
        seq("MAP", "(", $.filename, ")"),
        seq("INCLUDE", $.filename),
        seq("NOCROSSREFS", "(", optional($.nocrossref_list), ")"),
        seq("NOCROSSREFS_TO", "(", optional($.nocrossref_list), ")"),
        seq("EXTERN", "(", $.extern_name_list, ")"),
        seq("INSERT", "AFTER", $.NAME),
        seq("INSERT", "BEFORE", $.NAME),
        seq("REGION_ALIAS", "(", $.NAME, ",", $.NAME, ")"),
        seq("LD_FEATURE", "(", $.NAME, ")"),
      ),
    input_list: ($) =>
      sep1(
        choice($.NAME, $.LNAME, seq("AS_NEEDED", "(", $.input_list, ")")),
        optional(","),
      ),
    sections: ($) => seq("SECTIONS", "{", optional($.sec_or_group_p1), "}"),
    sec_or_group_p1: ($) => repeat1(choice($.section, $.statement_anywhere)),
    statement_anywhere: ($) =>
      choice(
        seq("ENTRY", "(", $.NAME, ")"),
        seq($.assignment, $.separator),
        seq("ASSERT", "(", $.exp, ",", $.NAME, ")"),
      ),
    section_name_spec: ($) =>
      choice(
        $.wildcard_maybe_reverse,
        seq(
          choice(
            "SORT_BY_NAME",
            "SORT",
            "SORT_BY_ALIGNMENT",
            "SORT_NONE",
            "SORT_BY_INIT_PRIORITY",
          ),
          "(",
          $.wildcard_maybe_reverse,
          ")",
        ),
        seq(
          choice("SORT_BY_NAME", "SORT"),
          "(",
          choice("SORT_BY_ALIGNMENT", "SORT_BY_NAME", "SORT"),
          "(",
          $.wildcard_maybe_reverse,
          ")",
          ")",
        ),
        seq(
          "SORT_BY_ALIGNMENT",
          "(",
          choice("SORT_BY_NAME", "SORT", "SORT_BY_ALIGNMENT"),
          "(",
          $.wildcard_maybe_reverse,
          ")",
          ")",
        ),
        seq(
          "REVERSE",
          "(",
          choice("SORT_BY_NAME", "SORT", "SORT_BY_INIT_PRIORITY"),
          "(",
          $.wildcard_maybe_exclude,
          ")",
          ")",
        ),
      ),
    wildcard_maybe_exclude: ($) =>
      seq(
        optional(seq("EXCLUDE_FILE", "(", $.exclude_name_list, ")")),
        $.wildcard_name,
      ),
    wildcard_maybe_reverse: ($) =>
      choice(
        $.wildcard_maybe_exclude,
        seq("REVERSE", "(", $.wildcard_maybe_exclude, ")"),
      ),
    filename_spec: ($) =>
      choice(
        $.wildcard_maybe_reverse,
        seq(
          choice("SORT_BY_NAME", "SORT", "SORT_NONE"),
          "(",
          $.wildcard_maybe_reverse,
          ")",
        ),
        seq(
          "REVERSE",
          "(",
          choice("SORT_BY_NAME", "SORT"),
          "(",
          $.wildcard_maybe_exclude,
          ")",
          ")",
        ),
      ),
    sect_flag_list: ($) => sep1($.wildcard_name, "&"),
    sect_flags: ($) => seq("INPUT_SECTION_FLAGS", "(", $.sect_flag_list, ")"),
    exclude_name_list: ($) => repeat1($.wildcard_name),
    section_name_list: ($) => sep1($.section_name_spec, optional(",")),
    input_section_spec_no_keep: ($) =>
      choice(
        $.NAME,
        seq($.sect_flags, $.NAME),
        seq(optional($.sect_flags), "[", $.section_name_list, "]"),
        seq(
          optional($.sect_flags),
          $.filename_spec,
          "(",
          $.section_name_list,
          ")",
        ),
      ),
    input_section_spec: ($) =>
      choice(
        $.input_section_spec_no_keep,
        seq("KEEP", "(", $.input_section_spec_no_keep, ")"),
      ),
    statement: ($) =>
      choice(
        ";",
        seq($.assignment, $.separator),
        "CREATE_OBJECT_SYMBOLS",
        "CONSTRUCTORS",
        seq(choice("SORT_BY_NAME", "SORT"), "(", "CONSTRUCTORS", ")"),
        $.input_section_spec,
        seq($.length, "(", $.mustbe_exp, ")"),
        seq("ASCIZ", $.NAME),
        seq("FILL", "(", $.fill_exp, ")"),
        "LINKER_VERSION",
        seq("ASSERT", "(", $.exp, ",", $.NAME, ")", $.separator),
        seq("INCLUDE", $.filename),
      ),
    statement_list: ($) => repeat1($.statement),
    length: (_) => choice("QUAD", "SQUAD", "LONG", "SHORT", "BYTE"),
    fill_exp: ($) => $.mustbe_exp,
    assign_op: (_) =>
      choice("+=", "-=", "*=", "/=", "<<=", ">>=", "&=", "|=", "^="),
    separator: (_) => choice(";", ","),
    assignment: ($) =>
      choice(
        seq($.NAME, "=", $.mustbe_exp),
        seq($.NAME, $.assign_op, $.mustbe_exp),
        seq(
          choice("HIDDEN", "PROVIDE", "PROVIDE_HIDDEN"),
          "(",
          $.NAME,
          "=",
          $.mustbe_exp,
          ")",
        ),
      ),
    memory: ($) => seq("MEMORY", "{", optional($.memory_spec_list), "}"),
    memory_spec_list: ($) => sep1($.memory_spec, optional(",")),
    memory_spec: ($) =>
      choice(
        seq(
          $.NAME,
          optional($.attributes),
          ":",
          $.origin_spec,
          optional(","),
          $.length_spec,
        ),
        seq("INCLUDE", $.filename),
      ),
    origin_spec: ($) => seq(choice("ORIGIN", "o", "org"), "=", $.mustbe_exp),
    length_spec: ($) => seq(choice("LENGTH", "l", "len"), "=", $.mustbe_exp),
    attributes: ($) => seq("(", $.attributes_list, ")"),
    attributes_list: ($) => repeat1($.attributes_string),
    attributes_string: ($) => seq(optional("!"), $.NAME),
    startup: ($) => seq("STARTUP", "(", $.filename, ")"),
    high_level_library: ($) =>
      seq("HLL", "(", optional($.high_level_library_NAME_list), ")"),
    high_level_library_NAME_list: ($) => sep1($.filename, optional(",")),
    low_level_library: ($) =>
      seq("SYSLIB", "(", optional($.low_level_library_NAME_list), ")"),
    low_level_library_NAME_list: ($) =>
      seq(optional(","), sep1(repeat1($.filename), ",")),
    floating_point_support: (_) => choice("FLOAT", "NOFLOAT"),
    nocrossref_list: ($) => seq(sep1($.NAME, optional(",")), optional(",")),
    paren_script_name: ($) => seq("(", $.NAME, ")"),
    mustbe_exp: ($) => $.exp,
    exp: ($) =>
      prec.left(
        choice(
          seq(choice("-", "!", "+", "~"), $.exp),
          seq("(", $.exp, ")"),
          seq(
            choice("NEXT", "ABSOLUTE", "DATA_SEGMENT_END", "BLOCK", "LOG2CEIL"),
            "(",
            $.exp,
            ")",
          ),
          seq(
            $.exp,
            choice(
              "*",
              "/",
              "%",
              "+",
              "-",
              "<<",
              ">>",
              "==",
              "!=",
              "<=",
              ">=",
              "<",
              ">",
              "&",
              "^",
              "|",
              "&&",
              "||",
            ),
            $.exp,
          ),
          seq($.exp, "?", $.exp, ":", $.exp),
          seq(choice("DEFINED", "CONSTANT"), "(", $.SYMBOLNAME, ")"),
          $.INT,
          "SIZEOF_HEADERS",
          seq(
            choice("ALIGNOF", "SIZEOF", "ADDR", "LOADADDR", "ORIGIN", "LENGTH"),
            $.paren_script_name,
          ),
          seq("ALIGN", "(", $.exp, optional(seq(",", $.exp)), ")"),
          seq(
            choice(
              "DATA_SEGMENT_ALIGN",
              "DATA_SEGMENT_RELRO_END",
              "MAX",
              "MIN",
            ),
            "(",
            $.exp,
            ",",
            $.exp,
            ")",
          ),
          seq("SEGMENT_START", "(", $.SYMBOLNAME, ",", $.exp, ")"),
          $.SYMBOLNAME,
          seq("ASSERT", "(", $.exp, ",", $.SYMBOLNAME, ")"),
        ),
      ),
    memspec_at: ($) => seq("AT", ">", $.NAME),
    at: ($) => seq("AT", "(", $.exp, ")"),
    align: ($) => seq("ALIGN", "(", $.exp, ")"),
    subalign: ($) => seq("SUBALIGN", "(", $.exp, ")"),
    sect_constraint: (_) => choice("ONLY_IF_RO", "ONLY_IF_RW", "SPECIAL"),
    section: ($) =>
      choice(
        seq(
          $.NAME,
          $.opt_exp_with_type,
          optional($.at),
          optional($.align),
          optional("ALIGN_WITH_INPUT"),
          optional($.subalign),
          optional($.sect_constraint),
          "{",
          optional($.statement_list),
          "}",
          optional($.memspec),
          optional($.memspec_at),
          optional($.phdr_opt),
          optional(seq("=", $.fill_exp)),
          optional(","),
        ),
        seq(
          "OVERLAY",
          $.opt_exp_without_type,
          optional("NOCROSSREFS"),
          optional($.at),
          optional($.subalign),
          "{",
          optional($.overlay_section),
          "}",
          optional($.memspec),
          optional($.memspec_at),
          optional($.phdr_opt),
          optional(seq("=", $.fill_exp)),
          optional(","),
        ),
        seq(
          "GROUP",
          $.opt_exp_with_type,
          "{",
          optional($.sec_or_group_p1),
          "}",
        ),
        seq("INCLUDE", $.filename),
      ),
    type: ($) =>
      choice(
        "NOLOAD",
        "DSECT",
        "COPY",
        "INFO",
        "OVERLAY",
        seq("READONLY", "(", "TYPE", "=", $.exp, ")"),
        "READONLY",
        seq("TYPE", "=", $.exp),
      ),
    atype: ($) => seq("(", optional($.type), ")"),
    opt_exp_with_type: ($) =>
      seq(
        optional(
          choice(
            $.exp,
            seq(
              "BIND",
              "(",
              $.exp,
              ")",
              optional(seq("BLOCK", "(", $.exp, ")")),
            ),
          ),
        ),
        optional($.atype),
        ":",
      ),
    opt_exp_without_type: ($) => seq(optional($.exp), ":"),
    memspec: ($) => seq(">", $.NAME),
    phdr_opt: ($) => seq(optional($.phdr_opt), ":", $.NAME),
    phdrs: ($) => seq("PHDRS", "{", optional($.phdr_list), "}"),
    phdr_list: ($) => repeat1($.phdr),
    phdr: ($) => seq($.NAME, $.phdr_type, optional($.phdr_qualifiers), ";"),
    phdr_type: ($) => $.exp,
    phdr_qualifiers: ($) =>
      repeat1(
        choice(seq($.NAME, optional($.phdr_val)), seq("AT", "(", $.exp, ")")),
      ),
    phdr_val: ($) => seq("(", $.exp, ")"),
    overlay_section: ($) =>
      repeat1(
        seq(
          $.NAME,
          "{",
          optional($.statement_list),
          "}",
          optional($.phdr_opt),
          optional(seq("=", $.fill_exp)),
          optional(","),
        ),
      ),
    version: ($) => seq("VERSION", "{", $.vers_nodes, "}"),
    vers_nodes: ($) => repeat1($.vers_node),
    vers_node: ($) =>
      choice(
        seq("{", optional($.vers_tag), "}", ";"),
        seq(
          $.VERS_TAG,
          "{",
          optional($.vers_tag),
          "}",
          optional($.verdep),
          ";",
        ),
      ),
    verdep: ($) => repeat1($.VERS_TAG),
    vers_tag: ($) =>
      choice(
        seq($.vers_defns, ";"),
        seq("global", ":", $.vers_defns, ";"),
        seq("local", ":", $.vers_defns, ";"),
        seq("global", ":", $.vers_defns, ";", "local", ":", $.vers_defns, ";"),
      ),
    vers_defns: ($) =>
      seq(
        optional(seq($.vers_defns, ";")),
        choice(
          $.VERS_IDENTIFIER,
          seq(
            "extern",
            optional(seq($.NAME, "{", $.vers_defns, optional(";"), "}")),
          ),
          "global",
          "local",
        ),
      ),
    NAME: (_) =>
      /=?[_a-zA-Z/.\\$~][_a-zA-Z0-9/.\\$~\-+:\[\],=]*|[_a-zA-Z.\\$][_a-zA-Z0-9/.\\$~]*|\/DISCARD\/|"[^"]*"/,
    SYMBOLNAME: (_) => /[_a-zA-Z.\\$][_a-zA-Z0-9/.\\$~]*|\/DISCARD\/|"[^"]*"/,
    LNAME: (_) => /-l[_a-zA-Z0-9/.\\$~\-+:\[\],=]+/,
    wildcard_name: (_) => /[_a-zA-Z0-9/.\\$~\-+:\[\],=?*^!]+/,
    INT: (_) =>
      choice(
        /\$[0-9A-Fa-f]+/,
        /[0-9A-Fa-f]+[HhXxBbOoDd]/,
        /((\$|0[xX])[0-9A-Fa-f]+|[0-9]+)[MKmk]?/,
      ),
    VERS_TAG: (_) => /[.$_a-zA-Z][._a-zA-Z0-9]*/,
    VERS_IDENTIFIER: (_) =>
      /[*?.$_a-zA-Z\[\]\-!^\\]([*?.$_a-zA-Z0-9\[\]\-!^\\]|::)*/,

    comment: (_) => /\/\*([^*]|\*[^/])*\*\//,
  },
});

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} sep
 *
 * @return {SeqRule}
 *
 */
function sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}
