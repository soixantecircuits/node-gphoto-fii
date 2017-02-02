var ref = require("ref");
var gphoto = require("../gphoto2");
var assert = require("assert");

var context = gphoto.gp_context_new();
var cameraList = gphoto.NewList();

var GP_OK = gphoto.GP_OK;

function assert_ok(returnValue) {
    assert.equal(returnValue, gphoto.GP_OK);
}

var LOG_EVERYTHING = true;

function debug_log(str) {
    if (LOG_EVERYTHING)
        console.log(str);
}

assert(gphoto.gp_camera_autodetect(cameraList, context) >= 0);

var count = gphoto.gp_list_count(cameraList);
if (count == 0) {
    console.error("No camera detected");
    return;
}
else if (LOG_EVERYTHING) {
    console.log("Camera(s) detected (" + count + "):")
    for (var i = 0; i < count; ++i) {
        var name, value;
        [name, value] = gphoto.GetListEntry(cameraList, i);
        console.log("- '" + name + "' -> " + value);
    }
}
gphoto.gp_list_unref(cameraList);

var camera = gphoto.NewInitCamera(context);

var configPtr = ref.alloc(gphoto.CameraWidget);
assert_ok(gphoto.gp_camera_get_config(camera, configPtr, context));
config = configPtr.deref();

var configList = gphoto.NewList();
assert_ok(gphoto.gp_camera_list_config(camera, configList, context));
count = gphoto.gp_list_count(configList);
debug_log("Config(s) (" + count + "):");

var get_config = require("../get_config");

for (var i = 0; i < count; ++i) {
    var name, value;

    [name, value] = gphoto.GetListEntry(configList, i);
    debug_log("\n- '" + name + "':");
    var config = gphoto.GetConfig(camera, context, name);
    configValue = get_config.getWidgetValue(config);
    debug_log(configValue);
}


gphoto.gp_list_unref(configList);
gphoto.gp_camera_unref(camera);
