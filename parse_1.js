import Triplet from "./Triplet.js";
function parse(page, state) {
    let number = state.number;
    let n = parseFloat(number);
    if (Number.isNaN(n) ) {
        page.setResult("Error: illegal number");
        return;
    }
    let minus = "";
    if (n < 0) {
        minus = "lúide ";
        n     = -n;
    }
    if (n != Math.floor(n)) {
        page.setResult("Error: currently only handling integers");
        return;
    }
    if (Math.abs(n) >= 1.e24){
        page.setResult("Error: handling only numbers below 1 septillion");
        return;
    }
    
    let result = "";
    // Need to do at least one iteration.
    let index = 0;
    if (n > 5.e14) {
        page.warn("Very large numbers are subject to floating point inaccuracies so that the lower order digits of the number may not be read accurately");
    }
    
    let minSimp = parseInt(state.minSimple);
    if (Number.isNaN(minSimp)) {
        minSimp = 100;
    }
    
    // Use the simple syntax where possible (not for ordinals) 
    // when the number is larger than the minimum but at least 20.
    // If the minimum is set to a negative value, then always
    // use the traditional form.
    let simple = false;
    // There are simple systems for counting numbers starting at 10,000
    // and for objects at 20.  There is no simple system for 
    // ordinal numbers (and no personal numbers over 12.
    switch(state.context) {
        case "counting":
            if (minSimp > 0 && n > 10000 && (n>minSimp)) {
                simple = true;
            }
            break;
        case "ordinal": break;  // never simple
        default:
            if (minSimp > 0 && n > 20 && (n>minSimp)) {
                simple = true;
            }            
    }
    
    // Handle something like 1003 persons where we send 3 to low order triplet.
    if (n > 12 && state.context == "people") {
        state.context = "objects";
    }
    
    let first = true;  // Have we seen a non-zero triplet yet?
    let singleDigitTriplet = false;
    do {
        let tripVal = n%1000;
        if (n == 0 || tripVal) {  // Handle special case of 0
            let trp = new Triplet(tripVal, index, state, page);
            let trpRes = trp.render(first, simple, n<999);
                        
            // Separate by commas if lower order number is two digits or more
            // Use is when previous triplet was less than 20.
            if (!first) {
                if (singleDigitTriplet) {
                    result = trpRes + " is " + result;
                } else {
                    result = trpRes + ", " + result;
                }
            } else {
                result = trpRes;
            }
            first  = false;
        }
            
        index += 1;
        n      = Math.floor(n/1000);
        if (tripVal < 20  && tripVal > 0) {
            singleDigitTriplet = true;  // Used when tying triplets togeter.            
        }
        
    } while (n > 0);
    result = minus + result;
    
    result = result.trim().replace(/\s+/g, ' ');
    page.setResult(result);
}

export default parse;

