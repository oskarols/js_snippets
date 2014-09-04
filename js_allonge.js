var args = function args(args, start, stop) {
  return Array.prototype.slice.apply(
    args, [start || undefined, stop || undefined]
  );
}

var compose = function (a, b) {
  return function (c) {
    a(b(c));
  }
}

var once = function (fn, context) {
  var wasRun = false;
  return function() {
    if (!wasRun) {
      wasRun = true;
      fn.apply(context || null, arguments);
    }
  };
}

var maybe = function(fn, context) {
  return function (a) {
    if (a === undefined || a === null) return;

    return fn.call(context || null, a);
  }
}

/**
 * Makes a function with a fixed number of arguments
 * accept a variable amount, by turning the last argument
 * into an array.
 *
 * var inAnArray = function (first, rest) {
 *   return [first, rest];
 * }
 *
 * inAnArray(1, 2, 3)
 * > [1, 2]
 *
 * variadic(inAnArray)(1, 2, 3)
 * > [1, [2, 3]]
 */
var variadic = function (fn) {
  var fnLength = fn.length;

  if (fnLength < 1) {
    return fn;
  } else if (fnLength === 1) {
    // Since only one param, always convert to array
    return function () {
      return fn.call(this, args(arguments));
    }
  } else {
    // Assume last arg is the variadic one
    return function () {
      var numberOfArgs = arguments.length,
          // i.e. the non-variadic args (named)
          namedArgs = args(arguments, 0, fnLength - 1),
          variadicArgs = args(arguments, fnLength - 1)
          numberOfMissingNamedArgs = Math.max(
            // -1 since last arg is not "named"
            ((fnLength - 1) - namedArgs.length), 0
          ),
          argPadding = new Array(numberOfMissingNamedArgs);

          console.log(namedArgs, variadicArgs, numberOfMissingNamedArgs, argPadding);

      return fn.apply(
        this, namedArgs
          .concat(argPadding)
          .concat([variadicArgs])
        );
      }
  }
}

var partialLeft = function (fn, leftArg) {
  return function () {
    return fn.apply(null, [leftArg].concat(args(arguments)));
  }
}

var partialRight = function (fn, rightArg) {
  return function () {
    return fn.apply(null, args(arguments).concat([rightArg]));
  }
}

var partial = function(fn) {
  var partialArgs = args(arguments, 1)

  return function () {
    var innerArgs = args(arguments);
    innerArgs = innerArgs.concat(partialArgs);
    return fn.apply(null, innerArgs);
  }
}

var unary = function(fn) {
  if (fn.length === 1) return fn;

  return function (firstArg) {
    return fn.call(this, firstArg);
  }
}

var tap = function(value) {
  return function (fn) {
    if (typeof fn === 'function') {
      return fn(value)
    }
    return value;
  }
}

var curriedTap = function (value, fn) {
  var curried = function () {
    if (typeof fn === function) {
      return fn(value)
    }
    return value;
  }
  if (fn === undefined)
    return curried;
  return curried(fn);
}

