var ref = require("ref");
var gphoto2 = require("./gphoto2");
var assert = require("assert");

var GPhotoError = Error;


function addWidgetToTree(tree, widget) {
    // Code modeled after `display_widgets` in gphoto2/actions.c
    var namePtr = ref.alloc("string");
    var labelPtr = ref.alloc("string");
    gphoto2.gp_widget_get_label(widget, labelPtr); // TODO - check return val
    gphoto2.gp_widget_get_name(widget, namePtr);
    var name = namePtr.deref();
    var label = labelPtr.deref();

    var subtree = getWidgetValue(widget);

    var n = gphoto2.gp_widget_count_children(widget);
    for (var i = 0; i < n; ++i) {
        var childWidgetPtr = ref.alloc(gphoto2.CameraWidget);
        gphoto2.gp_widget_get_child(widget, i, childWidgetPtr);
        // TODO - exception
        addWidgetToTree(subtree, childWidgetPtr.deref());
    }

    tree[name || label] = subtree;
}
module.exports.addWidgetToTree = addWidgetToTree;


var widgetTypeNames = {
    [gphoto2.GP_WIDGET_TEXT]:       "string",
    [gphoto2.GP_WIDGET_RANGE]:      "range",
    [gphoto2.GP_WIDGET_TOGGLE]:     "toggle",
    [gphoto2.GP_WIDGET_DATE]:       "date",
    [gphoto2.GP_WIDGET_MENU]:       "choice",
    [gphoto2.GP_WIDGET_RADIO]:      "choice",
    [gphoto2.GP_WIDGET_WINDOW]:     "window",
    [gphoto2.GP_WIDGET_SECTION]:    "section",
    [gphoto2.GP_WIDGET_BUTTON]:     "button"
};

function getWidgetValue(widget) {
    var labelPtr = ref.alloc("string");
    var typePtr = ref.alloc("int");
    var ret = gphoto2.GP_OK;
    value = Object();

    gphoto2.gp_widget_get_type(widget, typePtr);    // TODO - check return val
    gphoto2.gp_widget_get_label(widget, labelPtr);

    value.label = labelPtr.deref();
    value.type = widgetTypeNames[typePtr.deref()];

    switch (typePtr.deref()) {
        case gphoto2.GP_WIDGET_TEXT: { /* string */
            var txtPtr = ref.alloc("string");
            ret = gphoto2.gp_widget_get_value(widget, txtPtr);
            if (ret == gphoto2.GP_OK)
                value.value = txtPtr.deref();
            break;
        }

        case gphoto2.GP_WIDGET_RANGE: { /* float */
            var valuePtr = ref.alloc("float");
            var maxPtr = ref.alloc("float");
            var minPtr = ref.alloc("float");
            var stepPtr = ref.alloc("float");

            ret = gphoto2.gp_widget_get_range(widget, minPtr, maxPtr, stepPtr);
            if (ret == gphoto2.GP_OK) {
                ret = gphoto2.gp_widget_get_value(widget, valuePtr);
            }
            if (ret == gphoto2.GP_OK) {
                value = {
                    label: value.label,
                    type: "range",
                    value: valuePtr.deref(),
                    max: maxPtr.deref(),
                    min: minPtr.deref(),
                    step: stepPtr.deref()
                };
            }
            break;
        }

        case gphoto2.GP_WIDGET_TOGGLE: { /* int */
            var valuePtr = ref.alloc("int");
            ret = gphoto2.gp_widget_get_value(widget, valuePtr);
            if (ret == gphoto2.GP_OK) {
                value.value = valuePtr.deref();
            }
            break;
        }

        case gphoto2.GP_WIDGET_DATE: {
            var valuePtr = ref.alloc("int");
            ret = gphoto2.gp_widget_get_value(widget, valuePtr);
            if (ret == gphoto2.GP_OK) {
                value.value = Date(valuePtr.deref() * 1000.0);
            }
            break;
        }

        case gphoto2.GP_WIDGET_MENU:
        case gphoto2.GP_WIDGET_RADIO: { /* string */
            var currentChoicePtr = ref.alloc("string");
            var choicesCount = gphoto2.gp_widget_count_choices(widget);

            ret = gphoto2.gp_widget_get_value(widget, currentChoicePtr);
            if (ret != gphoto2.GP_OK) {
                break;
            }
            choices = [];
            for (var i = 0; i < choicesCount; ++i) {
                var choicePtr = ref.alloc("string");
                gphoto2.gp_widget_get_choice(widget, i, choicePtr);
                // TODO - check for errors?
                choices.push(choicePtr.deref());
            }
            value.value = currentChoicePtr.deref();
            value.choices = choices;
            break;
        }

        /* ignore: */
        case gphoto2.GP_WIDGET_WINDOW:
        case gphoto2.GP_WIDGET_SECTION:
        case gphoto2.GP_WIDGET_BUTTON: {
            break;
        }

        default: {
            throw new GPhotoError(
                "Retrieved type of widget " + value.label + " is invalid"
            );
        }
    }

    if (ret != gphoto2.GP_OK) {
        throw new GPhotoError(
            "Failed to retrieve value of " + value.type
            + " widget " + value.label
        );
    }

    return value;
}
module.exports.getWidgetValue = getWidgetValue;


function getWidgetTree(widget) {
    tree = Object();
    addWidgetToTree(tree, widget);
    return tree;
}
module.exports.getWidgetTree = getWidgetTree;


function assert_ok(returnValue) {
    assert.equal(returnValue, gphoto2.GP_OK);
}

function setWidgetValue(widget, value) {
    var roPtr = ref.alloc("int");
    assert_ok(gphoto2.gp_widget_get_readonly(widget, roPtr));
    assert(!roPtr.deref());

    var typePtr = ref.alloc("int");
    gphoto2.gp_widget_get_type(widget, typePtr);
    var widgetType = typePtr.deref();

    var stringWidgets = [
        gphoto2.GP_WIDGET_MENU, gphoto2.GP_WIDGET_TEXT, gphoto2.GP_WIDGET_RADIO
    ];
    var floatWidgets = [
        gphoto2.GP_WIDGET_RANGE
    ];
    var intWidgets = [
        gphoto2.GP_WIDGET_DATE, gphoto2.GP_WIDGET_TOGGLE
    ];

    if (stringWidgets.includes(widgetType)) {
        assert.equal(typeof value, "string");
        assert_ok(gphoto2.gp_widget_set_value(widget, ref.allocCString(value)));
    }
    else if (floatWidgets.includes(widgetType)) {
        assert.equal(typeof value, "number");
        assert_ok(gphoto2.gp_widget_set_value(widget, ref.alloc("int", value)));
    }
    else if (intWidgets.includes(widgetType)) {
        assert.equal(typeof value, "number");
        assert_ok(
            gphoto2.gp_widget_set_value(widget, ref.alloc("float", value))
        );
    }
    else {
        typeName = widgetTypeNames[typePtr.deref()] || "<unknown type>";
        throw new GPhotoError(
            "Cannot change value of given " + typeName + " widget"
        );
    }
}
module.exports.setWidgetValue = setWidgetValue;


function setCameraSetting(camera, key, value, context) {
    var widget = gphoto2.GetConfig(camera, context, key);

    setWidgetValue(widget, value);

    //assert_ok(gphoto2.gp_camera_set_config(camera, widget, context));
    assert_ok(gphoto2.gp_camera_set_single_config(
        camera, key, widget, context
    ));
    gphoto2.gp_widget_unref(widget);
}
module.exports.setCameraSetting = setCameraSetting;
