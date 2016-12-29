var ref = require("ref");
var gphoto = require("./gphoto2");
var assert = require("assert");

var context = gphoto.gp_context_new();

var listPtr = ref.alloc(gphoto.CameraList);

assert.equal(gphoto.gp_list_new(listPtr), gphoto.GP_OK);
list = listPtr.deref();
assert(!ref.isNull(list));
assert.equal(gphoto.gp_list_count(list), 0);

assert.equal(gphoto.gp_list_append(list, "Name0", "Value0"), gphoto.GP_OK);
assert.equal(gphoto.gp_list_count(list), 1);

assert.equal(gphoto.gp_list_reset(list), gphoto.GP_OK);
assert.equal(gphoto.gp_list_count(list), 0);

assert.equal(gphoto.gp_list_append(list, "Name0", "Value1"), gphoto.GP_OK);
assert.equal(gphoto.gp_list_append(list, "Name1", "Value1"), gphoto.GP_OK);
assert.equal(gphoto.gp_list_append(list, "Name1", "Value0"), gphoto.GP_OK);
assert.equal(gphoto.gp_list_append(list, "Name2", "Value0"), gphoto.GP_OK);
assert.equal(gphoto.gp_list_append(list, "Name0", "Value0"), gphoto.GP_OK);
count = gphoto.gp_list_count(list);
assert.equal(count, 5);

assert.equal(gphoto.gp_list_sort(list), gphoto.GP_OK);
assert.equal(gphoto.gp_list_count(list), count);
// TODO - After adding GetListName, check values are sorted

var foundId = ref.alloc("int");
assert.equal(gphoto.gp_list_find_by_name(list, foundId, "Name0"), gphoto.GP_OK);
assert.equal(foundId.deref(), 1);
assert.equal(gphoto.gp_list_find_by_name(list, foundId, "Name1"), gphoto.GP_OK);
assert.equal(foundId.deref(), 3);
assert.equal(gphoto.gp_list_find_by_name(list, foundId, "Name2"), gphoto.GP_OK);
assert.equal(foundId.deref(), 4);
assert.equal(
    gphoto.gp_list_find_by_name(list, foundId, "WrongName"),
    gphoto.GP_ERROR
);

/*
    "gp_list_ref":                  ["int", [CameraList]],
    "gp_list_count":                ["int", [CameraList]],
    "gp_list_unref":                ["int", [CameraList]],
    "gp_list_append":               ["int", [CameraList, "string", "string"]],
    "gp_list_reset":                ["int", [CameraList]],
    "gp_list_sort":                 ["int", [CameraList]],
    "gp_list_find_by_name":         ["int", [CameraList, "int*", "string"]],
    "gp_list_get_name":             ["int", [CameraList, "int", RefT("string")]],
    "gp_list_get_value":            ["int", [CameraList, "int", RefT("string")]],
    "gp_list_set_name":             ["int", [CameraList, "int", "string"]],
    "gp_list_set_value":            ["int", [CameraList, "int", "string"]],
*/

gphoto.gp_context_unref(context);
