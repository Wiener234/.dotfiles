const zero_to_255 = /(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])/;
const hex_digit = /[A-Za-z0-9]/;
const number = /\d+/;

const space = /[ \t]+/;
const maybe_space = optional(space);


module.exports = grammar({
  name: "xtc",

  extras: $ => [],

  rules: {
    program: $ => $._lines,

    _lines: $ => repeat1($._line),
    
    _line: $ => seq(
      maybe_space,
      optional(seq(
        $.change_port,
        maybe_space,
      )),
      optional(choice(
        $.command,
        $.comment,
      )),
      $._line_ending,
    ),

    change_port: $ => /\d+\/\d+/,
    
    command: $ => seq(
      $.parameter,
      optional(seq(space, $.indexes)),
      repeat(seq(space, $._argument)),
    ),

    parameter: $ => /([Pp][Ee]|[CMPcmp])[A-Za-z]?_\w+/,
    indexes: $ => seq(
      '[', maybe_space, $.index,
      repeat(seq( maybe_space, ',', maybe_space, $.index )),
      maybe_space,
      ']',
    ),

    index: $ => /\d+/,

    _argument: $ => choice(
      $.hex_argument,
      $.ipv4_argument,
      $.numeric_argument,
      $.string_literal_argument,
      $.string_argument,
      $.template,
    ),

    hex_argument: $ => seq(
      "0x",
      repeat1(
        choice(
          $.template,
          hex_digit,
      ))
    ),

    template: $ => /<[\w_-]+>/,
    numeric_argument: $ => /-?\d+/,
    string_literal_argument: $ => /"[^"]*"/,
    string_argument: $ => /[A-Za-f][A-Za-f0-9_]+/,
    ipv4_argument: $ => token(seq(
      zero_to_255, '.',
      zero_to_255, '.',
      zero_to_255, '.',
      zero_to_255,
    )),


    comment: $ => seq(
      ";",
      repeat(choice(
        $.port_comment,
        /[^\n\r]/,
      ))
    ),

    port_comment: $ => token(seq(
      "Port", maybe_space,
      ":",    maybe_space,
      number, maybe_space,
      "/",    maybe_space,
      number
    )),

    _line_ending: $ => token(seq(maybe_space, /[\n\r]+/))
  },
});


