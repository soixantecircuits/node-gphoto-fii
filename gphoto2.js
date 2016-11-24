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




let GP_CAPTURE_IMAGE = 0;
let GP_FILE_TYPE_NORMAL = 1;

function use_camera(context, camera)
{
    pathPtr = ref.alloc(CameraFilePath);
    //path = new CameraFilePath

    let res = gphoto2.gp_camera_capture(camera, GP_CAPTURE_IMAGE, pathPtr, context);
    if (res < 0)
    {
        console.log("ERROOOOOOR");
        //printf("Could not capture image:\n%s\n", gphoto2.gp_port_result_as_string(res));
        return (-1);
    }
    path_folder = pathPtr.deref().folder.buffer.readCString(0);
    path_name = pathPtr.deref().name.buffer.readCString(0);
    console.log("Photo temporarily saved in " + path_folder + path_name);

    let destPtr = ref.alloc(CameraFile);
    if (gphoto2.gp_file_new(destPtr) < 0)
        return -1;
    let dest = destPtr.deref();
    res = gphoto2.gp_camera_file_get(camera, path_folder, path_name,
        GP_FILE_TYPE_NORMAL, dest, context);
    if (res < 0)
    {
        console.log("Could not load image:\n" +
            gphoto2.gp_port_result_as_string(res));
        return (-1);
    }

    let dest_path = "my_photo";
    res = gphoto2.gp_file_save(dest, dest_path);
    if (res < 0)
    {
        console.log("Could not save image in " + dest_path + ":\n" +
            gphoto2.gp_port_result_as_string(res));
        return (-1);
    }
    console.log("Image saved in " + dest_path);
    gphoto2.gp_file_unref(dest);

    return 0;
}

function main()
{
    let context = gphoto2.gp_context_new()

    if (context.isNull())
        return 1;

    let cameraInfosPtr = ref.alloc(CameraList);
    if (gphoto2.gp_list_new(cameraInfosPtr) < 0)
        return 1;
    let cameraInfos = cameraInfosPtr.deref();

    if (gphoto2.gp_camera_autodetect(cameraInfos, context) < 0)
        return 1;
    console.log(gphoto2.gp_list_count(cameraInfos) + " cameras detected");
    gphoto2.gp_list_unref(cameraInfos);

    let cameraPtr = ref.alloc(Camera);
    if (gphoto2.gp_camera_new(cameraPtr) < 0)
        return -1;
    let camera = cameraPtr.deref();
    if (gphoto2.gp_camera_init(camera, context) < 0)
    {
        console.log("Could not initialize camera\n");
        return -1;
    }
    use_camera(context, camera);

    gphoto2.gp_camera_exit(camera, context);
    gphoto2.gp_camera_unref(camera);

    gphoto2.gp_context_unref(context);

    return 0;
}

console.log("main returned: " + main());
