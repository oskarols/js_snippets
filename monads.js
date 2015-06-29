/**
 * Axioms
 *
 * bind(unit(value), f) ==== f(value)
 *
 * alt.
 *
 * unit(value).bind(f) ==== f(value)
 *
 *
 *
 * bind(monad, unit) ==== monad
 *
 * alt.
 *
 * monad.bind(unit) ==== monad
 *
 *
 *
 * bind(bind(monad, f), g)
 *
 * alt.
 *
 * monad.bind(f).bind(g)
 *
 *
 * I have no idea wtf this is doing :S
 *
 * bind(monad, function(value) {
 *   return bind(f(value), g)
 * });
 *
 * alt.
 *
 * monad.bind(function(value) {
 *   return f(value).bind(g);
 * })
 *
 *
 * So.. a monad is a wrapped value?
 */

var l = console.log;

// Monad is an object

var MONAD_single = function() {
  return function unit(value) {
    var monad = Object.create(null);
    monad.bind = function(func) {
      return func(value);
    };
    return monad;
  }
};

var concatArgs = function(value, args) {
  return [value].concat(Array.prototype.slice.apply(args || []));
};

var MONAD = function() {
  // Where we keep methods of monad
  var prototype = Object.create(null);

  function unit(value) {
    var monad = Object.create(prototype);

    monad.bind = function(func, args) {
      return func.apply(undefined, concatArgs(value, args));
    };

    monad.valueOf = function() {
      return value;
    };

    return monad;
  }

  // Add additional method to prototype
  unit.method = function(name, func) {
    prototype[name] = func;
    return unit;
  };

  // Wrap function that know nothing about monads.
  // and wrap it in a function that calls unit and bind
  // so that it will act as thoug it knew about monads
  unit.lift = function(name, func) {
    prototype[name] = function() {
      // "this" refers to the monad via the prototype
      return this.bind.apply(undefined, concatArgs(func, arguments));
    }
    return unit;
  };

  return unit;

};

var maybeMonadize = function(func) {
  return function(value) {
    if (value === null || value === undefined) {
      return value;
    }

  }
};


function StringMonad (value) {

  // Is monad the value or the thing we attach methods to?
  var prototype = Object.create(null);

  // unit or w/e
  var unit = function() {

    var monad = Object.create(prototype);

    monad.valueOf = function() {
      return value;
    };

    monad.toString = function() {
      return 'Monad<value: ' + this.valueOf() + '>';
    };

    monad.bind = function(func, args) {
      return func.apply(null, concatArgs(value, args));
    };

    monad.methods = function() {
      var methods = Array.prototype.slice(arguments);

      methods.forEach(function(method) {
        this.addMethod(method.name, method);
      });
    };

    monad.addMethod = function(name, func) {
      var self = this;

      // TODO: Could use function.name if used function declarations
      // and only use name if explicitly defined

      // Implements maybe monad, passed methods
      // are never run when Monadic value becomes nullable
      var maybeBoundMethod = function() {
        var args = arguments,
            passFunc = func;

        value = self.bind(function(value) {
          if (value === null || value === undefined) {
            return value;
          } else {
            return passFunc.apply(null, concatArgs(value, args));
          }
        }, args);

        return monad;
      };

      // Turn a -> a into a -> Monad a
      var boundMethod = function() {
        value = self.bind(func, arguments);
        return monad;
      };

      monad[name] = maybeBoundMethod;

      return monad;
    };

    return monad;
  };


  return unit();
};


//////////////
// Concepts //
//////////////

/// Monoid
///
/// a function used in composition

// Functor
//
// a -> Ma
//
// Function with input of a type, and output of a Monad that gets input the same type
//
// Given two functions that have a -> Ma, we can't connect them since a !== Ma
// So we need some glue, which in Haskell is >>= (bind)


// Monad
//
// Say you have a set of a -> Ma Functors,
// the monad is what you use to /thread/ these together, and to store the value.
//
// using monad.foo().bar() you can have glue _between_ running foo and bar,
// With the Maybe-monad this would be checking for null-values and then not running
// the subsequent function if that is the case.
//
// This /includes/ the bind-function >>= which is used to thread together
// a -> Ma and a -> Ma


////////////////////////////////////////////////////////////
// Simple composable string functions -- String -> String //
////////////////////////////////////////////////////////////

var lowercase = function(s) {
  return s.toLowerCase();
};

var uppercase = function(s) {
  return s.toUpperCase();
};

var takeOdd = function(s) {
  var newStr = "";
  for (var i = 0; i < s.length; i++) {
    if (i % 2 !== 1) newStr += s[i];
  }
  return newStr;
};

var takeEven = function(s) {
  var newStr = "";
  for (var i = 0; i < s.length; i++) {
    if (i % 2) newStr += s[i];
  }
  return newStr;
};

var addFrills = function(s) {
  var frill = "~~";
  return frill + s + frill;
};

var giveNull = function(s) {
  return null;
};


//////////////////
// Testing area //
//////////////////

// var StringMonad = MONAD();

var strMonad = StringMonad("Oskar Olsson");


strMonad.methods(uppercase, lowercase, takeOdd, takeEven, giveNull, addFrills);

// strMonad.addMethod("uppercase", )
//         .addMethod("lowercase", )
//         .addMethod("takeOdd", )
//         .addMethod("takeEven", )
//         .addMethod("giveNull", )
//         .addMethod("addFrills", );


var odd = strMonad
          .uppercase()
          .takeEven()
          .addFrills()
          .takeEven();

console.log('Odd w/ even frills', odd.toString());

var nullable = strMonad
              .addFrills()
              .giveNull()
              .addFrills()
              .takeEven();

console.log('Nullable', nullable.toString());

