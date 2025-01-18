module.exports = grammar({
    name: "lpf",

    extras: $ => [/\s/, $.line_comment],
    
    rules: {
        source_file: $ => repeat($._line),

        identifier: $ => /[\p{XID_Start}_]\p{XID_Continue}*/u,
        number: $ => /\d+(.\d+)?/u,
        string: $ => seq('"', /[^"]+/u, '"'),
        _value: $ => choice($.identifier, $.number, $.string),

        signal_name: $ => seq($.identifier, optional(seq('[', $.number , ']'))),
 
        comment: $ => choice(
          $.line_comment,
        ),

        _line: $ => choice(
            seq($.sysconfig, ";"),
            seq($.locate_comp, ";"),
            seq($.frequency_port, ";"),
            seq($.iobuf_port, ";"),
            seq($.block, ";"),
        ),

        sysconfig: $ => seq(
            "SYSCONFIG",
            repeat($.key_value)
        ),

        locate_comp: $ => seq(
            "LOCATE",
            "COMP",
            $.string,
            "SITE",
            $.string,
        ),

        frequency_port: $ => seq(
            "FREQUENCY",
            "PORT",
            $.string,
            $.number,
            choice("MHZ", "KHZ", "HZ")
        ),

        iobuf_port: $ => seq(
            "IOBUF",
            "PORT",
            $.string,
            repeat($.key_value),
        ),

        // NOTE: This is not really part of the spec, but I have an LPF file that contains it
        block: $ => seq(
            "BLOCK",
            repeat(choice($.identifier, $.key_value)),
        ),

        key_value: $ => seq($.identifier, "=", $._value),

        line_comment: $ => token(seq(
          '#', /.*/
        )),
    }
})
