var ref = require("ref");
var ArrayType = require("ref-array");
var Struct = require("ref-struct");
var ffi = require("ffi");

var RefT = ref.refType;

var GPContext = RefT("void");
var CameraList = RefT("void");
var Camera = RefT("void");
var CameraFile = RefT("void");
var CameraFilePath = RefT("void");

ByteArray = ArrayType(ref.types.uchar);

//console.log(ByteArray);
//console.log(ArrayType(ref.types.uchar, 10));

CameraFilePath = Struct({
    name: ArrayType(ref.types.uchar, 128),
    folder: ArrayType(ref.types.uchar, 1024)
});

var gphoto2 = ffi.Library("libgphoto2", {
    "gp_context_new":               [GPContext, []],
    "gp_context_unref":             ["void", [GPContext]],

    "gp_port_result_as_string":     ["string", ["int"]],

    "gp_list_new":                  ["int", [RefT(CameraList)]],
    "gp_list_count":                ["int", [CameraList]],
    "gp_list_unref":                ["int", [CameraList]],

    "gp_camera_autodetect":         ["int", [CameraList, GPContext]],

    "gp_camera_new":                ["int", [RefT(Camera)]],
    "gp_camera_init":               ["int", [Camera, GPContext]],
    "gp_camera_capture":            [
        "int", [Camera, "int", RefT(CameraFilePath), GPContext]
    ],
    "gp_camera_exit":               ["int", [Camera, GPContext]],
    "gp_camera_unref":              ["int", [Camera]],

    "gp_file_new":                  ["int", [RefT(CameraFile)]],
    "gp_camera_file_get":           [
        "int", [CameraFile, "string", "string", "int", CameraFile, GPContext]
    ],
    "gp_file_save":                 ["int", [CameraFile, "string"]],
    "gp_file_unref":                ["int", [CameraFile]]
} );

module.exports = gphoto2

module.exports.GPContext = GPContext
module.exports.CameraList = CameraList
module.exports.Camera = Camera
module.exports.CameraFile = CameraFile
module.exports.CameraFilePath = CameraFilePath

module.exports.GP_CAPTURE_IMAGE = 0;
module.exports.GP_FILE_TYPE_NORMAL = 1;
