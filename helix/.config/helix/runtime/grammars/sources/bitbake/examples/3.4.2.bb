inherit buildhistory rm_work

inherit ${VARNAME}

VARIABLE = ""
VARIABLE:someoverride = "myclass"

python () {
    if condition == value:
        d.setVar('VARIABLE', 'myclass')
    else:
        d.setVar('VARIABLE', '')
}

inherit ${@'classname' if condition else ''}
inherit ${@functionname(params)}
