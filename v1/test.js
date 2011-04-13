/* javascript */

var test = test || {};  /* namespace */

/*
 * Raise an alert at most 5 times.
 */
test.alert = function(s) {
  ++test.numAlerts;
  if (test.numAlerts <= 5) {
    window.alert(s);
  }
};
test.numAlerts = 0;

/*
 * Assert that two "scalars" are equal.
 */
test.assertEqual = function(x, y) {
  (x == y) || test.alert('assertEqual(' + x.toString() + ', ' + y.toString() + ') failed');
};

/*
 * Assert that two arrays of scalars have equal values.
 */
test.assertEqualArray = function(x, y) {
  test.assertEqual(x.length, y.length);
  for (var i = 0; i < x.length; ++i)
    test.assertEqual(x[i], y[i]);
};
