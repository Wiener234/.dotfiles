// RFC https://datatracker.ietf.org/doc/html/rfc2849
// WIKI https://en.wikipedia.org/wiki/LDAP_Data_Interchange_Format

const FILL = /\s*/;
const SEP = /\r?\n/;
const ALPHA = /\w/;
const DIGIT = /\d/;
const OPT_CHAR = /[\w\d-]/

module.exports = grammar({
    name: 'ldif',

    extras: $ => [/\s/, $.comment],
    //word: $ => $.identifier,

    rules: {
        source_file: $ => repeat($._definition),

        _definition: $ => choice(
            $.comment,
            $.ldif_change_record,
        ),

        // TOP LEVEL


        ldif_change_record: $ => seq(
            $.dn_spec,
            $.changerecord
        ),

        // From RFC

        dn_spec: $ => seq(
            "dn:",
            FILL,
            $.distinguishedName,
            SEP
        ),

        distinguishedName: $ => $.name,

        name: $ => seq($.name_componet, repeat(seq(",", $.name_componet))),

        name_componet: $ => seq($.attributeTypeAndValue, repeat(seq("+", $.attributeTypeAndValue))),

        attributeTypeAndValue: $ => seq(
            $.attributeType,
            "=",
            $.string
        ),

        string: $ => choice(
            repeat1(choice($._stringchar, $.pair)),
            seq("#", $._hexpair),
            seq('"', repeat(choice($._stringchar, $.pair)), '"')
        ) ,


        // "\" ( special / "\" / QUOTATION / _hexpair )
        pair: $ => seq(
            "\\",
            choice(
                $._special,
                "\\",
                '"',
                $._hexpair,
            )
        ),

        _hexpair: $ => /[\dABCDEFabcdef]{2}/,

        // <any character except one of special, "\" or QUOTATION >
        _stringchar: $ => /[^\\\r\n\t,=+<>#;"]/,

        _special: $ => /[,=+<>#;]/,


        changerecord: $ => seq(
                "changetype:",
                FILL,
                choice(
                    $.change_add,
                    $.change_delete,
                    $.change_moddn,
                    $.change_modify
                )
            ),

        change_add: $ => seq("add",
            SEP
            // 1*attrval-spec
        ),
        change_delete: $ => seq("delete",
            SEP
        ),
        change_moddn: $ => seq(
            choice( "modrdn", "moddn"),
            //SEP,
            "newrdn:"
                // (FILL rdn /
                //                            ":" FILL base64-rdn) SEP
                //                 "deleteoldrdn:" FILL ("0" / "1")  SEP
                //             0*1("newsuperior:"
                //                 (    FILL distinguishedName /
                //                     ":" FILL base64-distinguishedName) SEP)
        ),
        change_modify: $ => seq(
            "modify",
            SEP,
            repeat($.mod_spec)
        ),

        mod_spec: $ => seq(
            choice("add:", "delete:", "replace:"),
            FILL, $.AttributeDescription, SEP,
            $.attrval_spec,
            "-", SEP
        ),

        attrval_spec: $ => seq(
            $.AttributeDescription,
            $.value_spec,
            SEP
        ),

        value_spec: $ => seq(
            ":",
            choice(
                seq(FILL, /\w*/),
                seq(":", FILL, $.base64_string),
                seq("<", FILL, $.url)
            )
        ),

       attributeType: $ => choice(
            seq(ALPHA, repeat1($._keychar)),
            $.ldap_oid,
        ),

        ldap_oid: $ => seq(
            /\d+/,
            optional(seq(".", /\d+/))
        ),

        options: $ => choice(
            $.option,
            seq($.identifier, ";", $.options)
        ),
        option: $ => repeat1(OPT_CHAR),

        _keychar: $ => choice(OPT_CHAR),

        // URI Generic Synxtax https://www.ietf.org/rfc/rfc3986.txt
        url: $ =>  /(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,

        AttributeDescription: $ => seq(
            $.attributeType,
            optional(seq(";", $.options))
        ),
        base64_string: $ =>  $.identifier,
        identifier: $ =>  /[a-zA-Z][\w\-]+/,
        comment: $ => token(seq('#', /.*/))
    },

});

function repeat1(rule) {
  return seq(rule, repeat(rule))
}

