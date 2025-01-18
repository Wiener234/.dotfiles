/**
 * @file ADL grammar for tree-sitter
 * @author Gary Miller
 * @license MIT
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'adl',

  extras: $ => [
    /\s/,
    $.comment
  ],

  word: $ => $._ident,

  rules: {
    adl: $ => seq(repeat($._aordc), 'module', $.scoped_name, '{', repeat($._import), repeat($._top), '}', ';'),
    _aordc: $ => choice(
      $.annon,
      $.doc_comment,
    ),
    annon: $ => seq('@', $.scoped_name, optional($.json)),
    // doc_comment: $ => seq('///', /[^\n]*/, /\n/),
    doc_comment: $ => token(seq(/\/\/\/[^\n]*\n/)),
    comment: $ => token(seq('//', choice(/[^/]/, "\n"), /[^\n]*/, /\n/)),
    scoped_name: $ => seq(repeat(seq($._ident, ".")), $._ident),
    _import: $ => choice(
      $.import_star,
      $.import,
    ),
    import_star: $ => seq("import", $.scoped_name, ".*", ";"),
    import: $ => seq("import", $.scoped_name, ";"),
    _top: $ => choice(
      seq($._remote_annon),
      seq($._decl),
    ),
    _remote_annon: $ => choice(
      $.module_annon,
      $.decl_annon,
      $.field_annon,
    ),
    module_annon: $=> seq("annotation", $.scoped_name, $.json, ";"),
    decl_annon: $=> seq("annotation", $.scoped_name, $._ident, $.json, ";"),
    field_annon: $=> seq("annotation", $.scoped_name, "::", $._ident, $._ident, $.json, ";"),
    _decl: $ => choice(
      $.struct,
      $.union,
      $.type_alias,
      $.newtype,
    ),
    struct: $ => seq(repeat($._aordc), "struct", alias($._ident, $.name), optional($.type_param), "{", repeat($.field), "}", ";"),
    union: $ => seq(repeat($._aordc), "union", alias($._ident, $.name), optional($.type_param), "{", repeat($.field), "}", ";"),
    type_alias: $ => seq(repeat($._aordc), "type", alias($._ident, $.name), optional($.type_param), "=", $.type_expr, ";"),
    newtype: $ => seq(repeat($._aordc), "newtype", alias($._ident, $.name), optional($.type_param), "=", $.type_expr, optional($.default_val), ";"),
    type_param: $ => seq('<', listSep1($._ident, ","),'>'),
    type_expr_params: $ => seq('<', listSep1(alias($.type_expr,$.param), ","),'>'),
    field: $ => seq(repeat($._aordc), $.type_expr, alias($._ident, $.fname), optional($.default_val), ";"),
    type_expr: $ => choice(
      seq($.scoped_name, $.type_expr_params),
      seq($.scoped_name),
    ),
    default_val: $ => seq("=", $.json),
    _ident: $ => /[a-zA-Z_]+[a-zA-Z0-9_]*/,

    json: $ => seq($._value),
    _value: $ => choice(
      $.object,
      $.array,
      $.number,
      $.string,
      $.true,
      $.false,
      $.null,
    ),
    object: $ => seq('{', listSep($.pair, ','), '}'),
    pair: $ => seq(alias($.string, $.key),':',field('value', $._value)),
    array: $ => seq('[', listSep($._value, ','), ']'),
    string: $ => choice(
      seq('"', '"'),
      seq('"', $._string_content, '"'),
    ),
    _string_content: $ => repeat1(choice(
      token.immediate(prec(1, /[^\\"\n]+/)),
      $.escape_sequence,
    )),
    escape_sequence: _ => token.immediate(seq(
      '\\',
      /(\"|\\|\/|b|f|n|r|t|u)/,
    )),
    number: _ => {
      const decimal_digits = /\d+/;
      const signed_integer = seq(optional('-'), decimal_digits);
      const exponent_part = seq(choice('e', 'E'), signed_integer);
      const decimal_integer_literal = seq(
        optional('-'),
        choice(
          '0',
          seq(/[1-9]/, optional(decimal_digits)),
        ),
      );
      const decimal_literal = choice(
        seq(decimal_integer_literal, '.', optional(decimal_digits), optional(exponent_part)),
        seq(decimal_integer_literal, optional(exponent_part)),
      );
      return token(decimal_literal);
    },
    true: _ => 'true',
    false: _ => 'false',
    null: _ => 'null',
    // jscomment: _ => token(choice(
    //   seq('//', /.*/),
    //   seq(
    //     '/*',
    //     /[^*]*\*+([^/*][^*]*\*+)*/,
    //     '/',
    //   ),
    // )),
  },
});

/**
 * Creates a rule to match one or more of the rules separated by a comma
 * @param {RuleOrLiteral} rule
 * @param {string} sep
 * @return {SeqRule}
 */
function listSep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 * @param {RuleOrLiteral} rule
 * @param {string} sep
 * @return {ChoiceRule}
 */
function listSep(rule, sep) {
  return optional(listSep1(rule, sep));
}
