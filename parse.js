import Triplet from "./Triplet.js";
function parse(page, state) {
    let number = state.number;
    let minus = "";
    number = number.trim();
    if (number.startsWith("-")) {
        minus = "lúide ";
        number = number.substring(1);
    }
    number = number.replace(",", "");
    if (number.match(/[^0-9]/)) {
        page.setResult("Error: illegal number");
        return;
    }
    if (number.length > 24) {
        page.setResult("Error: number too large.  Limit is 10**24.");
        return;
    }
    
    let minSimp = parseInt(state.minSimple);
    if (Number.isNaN(minSimp)) {
        minSimp = 100;
    }
    
    let n = parseFloat(number);
    
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

    let context = state.context;
    // Handle something like 1003 persons where we send 3 to low order triplet.
    if (n > 12 && context == "people") {
        context = "objects";
    }
    
    // Get rid of leading zeros.
    while (number.length > 1 && number.startsWith("0")) {
        number = number.substring(1);
    }
    
    let result = "";
    // Need to do at least one iteration.
    let index = 0;    
    let first = true;  // Have we seen a non-zero triplet yet?
    let singleDigitTriplet = false;
    let bigNumber = number.length > 3;
    do {
        console.log("In loop,number:", number, number.length);
        let tripVal;
        // Get triplet value.
        if (number.length < 3) {
            tripVal = parseInt(number);
        } else {
            tripVal = parseInt(number.substring(number.length-3));
        }
        if (number.length < 3 || tripVal) {  // Handle special case of 0
            let trp = new Triplet(tripVal, index, context, state.noun, page);
            let trpRes = trp.render(first, simple, bigNumber);
                        
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
        if (number.length < 4) {
            break;
        }
        number = number.substring(0, number.length-3);
        if (tripVal < 20  && tripVal > 0) {
            singleDigitTriplet = true;  // Used when tying triplets togeter.            
        }
        
    } while (true);
    
    result = minus + result;
    
    result = result.trim().replace(/\s+/g, ' ');
    page.setResult(result);
}

export default parse;

