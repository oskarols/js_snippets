var cycle = function(iter) {
    var currentIndex = 0,
        output = null;

    return function() {
        output = iter[currentIndex]
        currentIndex = (currentIndex === iter.length - 1) ?
            0 :
            currentIndex + 1;

        return output;
    }
}