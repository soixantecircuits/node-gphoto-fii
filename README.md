gphoto2_ffi
=============

This is a Node.js module, generated with the node-ffi library, that wraps
around the functions of the C library libgphoto2. Inspired by node-gphoto2.


Installation
------------

No npm package so far; you can install this module by cloning it into your
project:

    git clone https://github.com/soixantecircuits/node-gphoto-fii.git

    mv node-gphoto-fii ./node_modules


Example
-------

    const gp2 = require("gphoto2_ffi");

    var context = gp2.gp_context_new();
    var camera = gp2.NewInitCamera(context);

    var config = gp2.GetConfig(camera, context, name);
    var tree = gp2.getWidgetTree(config);
    console.log(name + ":");
    console.log(util.inspect(tree[name], {showHidden: false, depth: null}));

    gp2.gp_widget_unref(config);
    gp2.gp_camera_exit(camera, context);
    gp2.gp_camera_unref(camera);
    gp2.gp_context_unref(context);


License
-------

MIT License. See `LICENSE` file.
