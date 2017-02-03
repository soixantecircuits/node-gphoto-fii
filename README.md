gphoto2_ffi
=============

Tests for a Node.js module, generated with the node-ffi library, that wraps the
functions of the C library libgphoto2.


Example
-------

    var ref = require("ref");
    var lib = require("./gphoto2");

    var context = lib.gp_context_new()

    var CameraList = ref.refType("void");

    var cameraInfosPtr = ref.alloc(CameraList);
    if (lib.gp_list_new(cameraInfosPtr) < 0)
        process.exit(1);
    var cameraInfos = cameraInfosPtr.deref();

    if (lib.gp_camera_autodetect(cameraInfos, context) < 0)
        process.exit(1);
    console.log(lib.gp_list_count(cameraInfos) + " cameras detected");

    lib.gp_list_unref(cameraInfos);

    lib.gp_context_unref(context);

    process.exit(0);


License
-------

License MIT. See `LICENSE` file.
