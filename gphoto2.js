var ref = require("ref");
var ArrayType = require("ref-array");
var Struct = require("ref-struct");
var ffi = require("ffi");

var RefT = ref.refType;

var GPContext = RefT("void");
var CameraList = RefT("void");
var Camera = RefT("void");
var CameraFile = RefT("void");
var CameraWidget = RefT("void");

var CameraFilePath = Struct({
    name: ArrayType(ref.types.uchar, 128),
    folder: ArrayType(ref.types.uchar, 1024)
});

var gphoto2 = ffi.Library("libgphoto2", {
    "gp_context_new":       [GPContext, []],
    "gp_context_unref":     ["void", [GPContext]],

    "gp_port_result_as_string":     ["string", ["int"]],

    "gp_list_new":          ["int", [RefT(CameraList)]],
    "gp_list_ref":          ["int", [CameraList]],
    "gp_list_unref":        ["int", [CameraList]],
    "gp_list_free":         ["int", [CameraList]],
    "gp_list_count":        ["int", [CameraList]],
    "gp_list_append":       ["int", [CameraList, "string", "string"]],
    "gp_list_reset":        ["int", [CameraList]],
    "gp_list_sort":         ["int", [CameraList]],
    "gp_list_find_by_name": ["int", [CameraList, "int*", "string"]],
    "gp_list_get_name":     ["int", [CameraList, "int", RefT("string")]],
    "gp_list_get_value":    ["int", [CameraList, "int", RefT("string")]],
    "gp_list_set_name":     ["int", [CameraList, "int", "string"]],
    "gp_list_set_value":    ["int", [CameraList, "int", "string"]],
    // "gp_list_populate":     ["int", [CameraList, "string", "int"]],

// To check
    "gp_camera_autodetect": ["int", [CameraList, GPContext]],

    "gp_camera_new":        ["int", [RefT(Camera)]],
    "gp_camera_init":       ["int", [Camera, GPContext]],
    "gp_camera_capture": [
        "int", [Camera, "int", RefT(CameraFilePath), GPContext]
    ],
    "gp_camera_exit":       ["int", [Camera, GPContext]],
    "gp_camera_unref":      ["int", [Camera]],

    "gp_camera_get_config": ["int", [Camera, RefT(CameraWidget), GPContext]],

    "gp_widget_unref":          ["int", [CameraWidget]],
    "gp_widget_get_type":       ["int", [CameraWidget, RefT("int")]],
    "gp_widget_get_label":      ["int", [CameraWidget, RefT("string")]],
    "gp_widget_get_value":      ["int", [CameraWidget, RefT("string")]],
    "gp_widget_get_range":      [
        "int", [CameraWidget, RefT("float"), RefT("float"), RefT("float")]
    ],
    "gp_widget_count_choices":  ["int", [CameraWidget]],
    "gp_widget_get_choice":     ["int", [CameraWidget, "int", RefT("string")]],

    "gp_file_new":          ["int", [RefT(CameraFile)]],
    "gp_camera_file_get":   [
        "int", [CameraFile, "string", "string", "int", CameraFile, GPContext]
    ],
    "gp_file_save":         ["int", [CameraFile, "string"]],
    "gp_file_unref":        ["int", [CameraFile]],
} );

module.exports = gphoto2

module.exports.GPContext =          GPContext;
module.exports.CameraList =         CameraList;
module.exports.Camera =             Camera;
module.exports.CameraFile =         CameraFile;
module.exports.CameraWidget =       CameraWidget;
module.exports.CameraFilePath =     CameraFilePath;
module.exports.CameraWidgetType =   RefT("int");

module.exports.GP_OK =                            0;
module.exports.GP_ERROR =                        -1;
module.exports.GP_ERROR_BAD_PARAMETERS =         -2;
module.exports.GP_ERROR_NO_MEMORY =              -3;
module.exports.GP_ERROR_LIBRARY =                -4;
module.exports.GP_ERROR_UNKNOWN_PORT =           -5;
module.exports.GP_ERROR_NOT_SUPPORTED =          -6;
module.exports.GP_ERROR_IO =                     -7;
module.exports.GP_ERROR_FIXED_LIMIT_EXCEEDED =   -8;
module.exports.GP_ERROR_TIMEOUT =                -10;
module.exports.GP_ERROR_IO_SUPPORTED_SERIAL =    -20;
module.exports.GP_ERROR_IO_SUPPORTED_USB =       -21;
module.exports.GP_ERROR_IO_INIT =                -31;
module.exports.GP_ERROR_IO_READ =                -34;
module.exports.GP_ERROR_IO_WRITE =               -35;
module.exports.GP_ERROR_IO_UPDATE =              -37;
module.exports.GP_ERROR_IO_SERIAL_SPEED =        -41;
module.exports.GP_ERROR_IO_USB_CLEAR_HALT =      -51;
module.exports.GP_ERROR_IO_USB_FIND =            -52;
module.exports.GP_ERROR_IO_USB_CLAIM =           -53;
module.exports.GP_ERROR_IO_LOCK =                -60;
module.exports.GP_ERROR_HAL =                    -70;

module.exports.GP_CAPTURE_IMAGE = 0;
module.exports.GP_FILE_TYPE_NORMAL = 1;

module.exports.GP_WIDGET_WINDOW =   0;
module.exports.GP_WIDGET_SECTION =  1;
module.exports.GP_WIDGET_TEXT =     2;
module.exports.GP_WIDGET_RANGE =    3;
module.exports.GP_WIDGET_TOGGLE =   4;
module.exports.GP_WIDGET_RADIO =    5;
module.exports.GP_WIDGET_MENU =     6;
module.exports.GP_WIDGET_BUTTON =   7;
module.exports.GP_WIDGET_DATE =     8;
