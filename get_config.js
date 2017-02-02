var ref = require("ref");
var gphoto2 = require("./gphoto2");

function addWidgetToTree(tree, widget) {
    // Code modeled after `display_widgets` in gphoto2/actions.c
    var namePtr = ref.alloc("string");
    var labelPtr = ref.alloc("string");
    gphoto2.gp_widget_get_label(widget, labelPtr); // TODO - check return val
    gphoto2.gp_widget_get_name(widget, namePtr);
    var name = namePtr.deref();
    var label = labelPtr.deref();

    var subtree = getWidgetValue(widget); // TODO - check return val

    var n = gphoto2.gp_widget_count_children(widget);
    for (var i = 0; i < n; ++i) {
        var childWidgetPtr = ref.alloc(gphoto2.CameraWidget);
        gphoto2.gp_widget_get_child(widget, i, childWidgetPtr);
        // TODO - exception
        addWidgetToTree(subtree, childWidgetPtr.deref());
    }

    tree[name || label] = subtree;
}

function getWidgetValue(widget) {
    var labelPtr = ref.alloc("string");
    var typePtr = ref.alloc("int");
    var ret = gphoto2.GP_OK;
    value = Object();

    gphoto2.gp_widget_get_type(widget, typePtr);
    gphoto2.gp_widget_get_label(widget, labelPtr);

    value.label = labelPtr.deref();

    switch (typePtr.deref())
    {
        case gphoto2.GP_WIDGET_TEXT:
        { /* string */
            var txtPtr = ref.alloc("string");
            ret = gphoto2.gp_widget_get_value(widget, txtPtr);

            if (ret != gphoto2.GP_OK)
            {
                throw GphotoError("Failed to retrieve value of text widget " +
                    value.label);
            }
            value.type = "string";
            value.value = txtPtr.deref();
            break;
        }

        case gphoto2.GP_WIDGET_RANGE:
        { /* float */
            var valuePtr = ref.alloc("float");
            var maxPtr = ref.alloc("float");
            var minPtr = ref.alloc("float");
            var stepPtr = ref.alloc("float");

            ret = gphoto2.gp_widget_get_range(widget, minPtr, maxPtr, stepPtr);
            if (ret != gphoto2.GP_OK)
            {
                throw GphotoError("Failed to retrieve values of range widget " +
                    value.label);
            }
            ret = gphoto2.gp_widget_get_value(widget, valuePtr);
            value =
            {
                label: value.label,
                type: "range",
                value: valuePtr.deref(),
                max: maxPtr.deref(),
                min: minPtr.deref(),
                step: stepPtr.deref()
            };
            break;
        }

        case gphoto2.GP_WIDGET_TOGGLE:
        { /* int */
            var valuePtr = ref.alloc("int");
            ret = gphoto2.gp_widget_get_value(widget, valuePtr);
            if (ret != gphoto2.GP_OK)
            {
                throw GphotoError(
                    "Failed to retrieve values of toggle widget " +
                    value.label
                );
            }
            value.type = "toggle";
            value.value = valuePtr.deref();
            break;
        }

        case gphoto2.GP_WIDGET_DATE:
        {
            var valuePtr = ref.alloc("int");
            ret = gphoto2.gp_widget_get_value(widget, valuePtr);
            if (ret != gphoto2.GP_OK)
            {
                throw GphotoError(
                    "Failed to retrieve values of date/time widget " +
                    value.label
                );
            }
            value.type = "date";
            value.value = Date(valuePtr.deref() * 1000.0)
            break;
        }

        case gphoto2.GP_WIDGET_MENU:
        case gphoto2.GP_WIDGET_RADIO:
        { /* string */
            var currentChoicePtr = ref.alloc("string");
            var choicesCount = gphoto2.gp_widget_count_choices(widget);

            ret = gphoto2.gp_widget_get_value(widget, currentChoicePtr);
            if (ret != gphoto2.GP_OK)
            {
                throw GphotoError(
                    "Failed to retrieve value of menu widget " + value.label
                );
            }
            choices = [];
            for (var i = 0; i < choicesCount; ++i)
            {
                var choicePtr = ref.alloc("string");
                gphoto2.gp_widget_get_choice(widget, i, choicePtr);
                choices.push(choicePtr.deref());
            }
            value.type = "choice";
            value.value = currentChoicePtr.deref();
            value.choices = choices;
            break;
        }

        /* ignore: */
        case gphoto2.GP_WIDGET_WINDOW:
        {
            value.type = "window";
            break;
        }
        case gphoto2.GP_WIDGET_SECTION:
        {
            value.type = "section";
            break;
        }
        case gphoto2.GP_WIDGET_BUTTON:
        {
            value.type = "button";
            break;
        }
        default:
        {
            throw GphotoError(
                "Failed to retrieve type of widget " + value.label
            );
        }
    }
    return value;
}

function getWidgetTree(widget) {
    tree = Object();
    addWidgetToTree(tree, widget);
    return tree;
}

module.exports.getWidgetValue = getWidgetValue;
module.exports.addWidgetToTree = addWidgetToTree;
module.exports.getWidgetTree = getWidgetTree;
