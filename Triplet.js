import nouns from "./nouns.js";

class Triplet {
    constructor(n, index, context, noun, page) {
        this.n       = n;
        this.index   = index;
        this.context = context;
        this.noun    = noun;
        this.page    = page;
        if (this.noun) {
            this.noun = state.noun.toLowerCase();
        }
    }
    
    // Render the current triplet.
    // lowest: Least significant triplet that is non-zero (or 0 for 0)
    //         This triplet will render with the underlying noun if any.
    //         This triplet with have any prefix for the number as a whole 
    //         (e.g., the "an" before an ordinal number.
    render(lowest, simple, highest) {
        
        // Vocabulary used in rendering numbers
        
        // Digits words that come before the noun.
        let basePrefix = [
            "náid", "aon", "dó",
            "trí", "ceathair", "cúig",
            "sé", "seacht", "ocht",
            "naoi"];

        let objectPrefix = [
            null, "aon", "dhá",
            "trí", "ceithre", "cúig",
            "sé", "seacht", "ocht",
            "naoi"];

        let peoplePrefix = [null, null, "beirt",
            "tríúr", "ceathrar", "cúigar",
            "séisear", "seachtar", "ochtar",
            "naonúr", "deichniur", null, "dhareag"];

        let ordinalPrefix = [
            "náidú", "aonú", "dóú",
            "tríú", "ceathrú", "cúigiú",
            "séú", "seachtú", "ochtú",
            "naoú"];
        
        // Multiples of 10
        let countingTens = [null, "deich", "fiche", "tríocha", "daichead", "caoga", 
                 "seasca", "seachtó", "ochtó", "nócha"];

        let ordinalTens =  [null, "deichiú", "fichiú", "tríochadú", "daicheadú", "caogadú", "seascadú",
                 "seachtódú", "ochtódú", "nóchadú"];
         
        // Powers of 1000.
        let tripletUnits = ["", "míle", "milliún", "billiún","trilliún",  "cuaidrilliún",  "cuintilliún", "seisilliún"];
        
        // Characteristics of letters needed for the various word transformations.
        let vowels    = {a:1, e:1, i:1, o:1, u:1, á:1, é:1, í: 1, ó:1, ú:1};
        let lenites   = {b:1, c:1, d:2, f:1, g:1, m:1, p:1, s:2, t:2};
        let dentals   = {d:1, n:1, t:1, l:1, s:1};
        let consanUru = {b:"m", c:"g", d:"n", f: "bh", g: "n", p:"b", t:"d"};

        //  End of Vocabulary


        let here = this;
        
        let index   = here.index;
        let noun    = here.noun;
        let context = here.context;
        let n       = here.n;
        let nfix    = "";
        let ordPref = (context == "ordinal");
        let wasCounting = false;
        
        
        if (index > 0) {
            // Make some changes to accommodate the fact this we
            // are looking at thousands or above.  Generally the
            // issue is that we need to worry about both the
            // units of the current triplet and whether we've
            // already handled the noun the user may have provied.
            // Many of the special cases are no longer applicable.
            switch (context) {
                case "counting":
                    if (lowest) {
                        nfix = noun;
                    }
                    if (simple) {
                        noun = tripletUnits[index];
                                                                       
                    } else {
                        noun    = tripletUnits[index];
                        wasCounting = true;
                        context = "objects";                        
                    }
                    break;
                    
                case "ordinal":
                    // It is not clear from the standard where the noun
                    // goes in a case like 216,000th where the lowest
                    // triplet is 0 and the first non-zero triplet includes a teen.
                    //   an da cead se mileu NOUN deag     or
                    //          ... se mileu deag NOUN     or
                    //          ... se deag mileu NOUN
                    // We have assumed the first.
                    let unit = tripletUnits[index];
                    if (lowest) {
                        unit += "ú"; 
                        if (index == 1) {
                            unit = "miliú";
                        }
                        noun =  unit + sNoun(hPrefix(noun));
                    } else {
                        noun = unit;
                    }
                    context = "objects";
                    break;
                    
                default:
                    if (lowest) {
                        nfix = noun;
                    }
                    noun = tripletUnits[index];
                    context = "objects";  // No personal numbers!
            }
            context = "objects";
        }

        // 
        if ((n == 11 || n > 12) && context == "people") {
            context = "objects";
        }

        let res;
        
        // There are a varity of special cases for n<3
        // so we handle them individually.
        if (n < 3) {
            res =  small();
        // 
        } else if (n < 100) {
            res =  twoDigits();
        } else {
            res =  threeDigits();
        }
        
        if (ordPref) {
            res = fixOrdinal(res);
        }
        return res;
        
        // Handle very small integers where there are a lot
        // of exceptions to usual rules.
        function small() {
            switch (context) {
                case "counting":
                    switch (n) {
                        case 0: return basePrefix[0];
                        default: return "a "+hPrefix(basePrefix[n]);
                    }
                    
                case "objects":
                    switch(n){
                        case 0: return noun + " ar bith";
                        case 1: 
                            if (index == 0 && highest) {
                                return "aon" + sNoun(lenite(noun)) + sNoun("amhain");
                            } else {
                                if (lowest) {
                                    return sNoun(noun);
                                } else {
                                    return tripletUnits[index]; 
                                }
                            }
                        // We'll never Uru here.
                        // but need to handle words with dual forms which is done
                        // in leniteOrUru.
                        // Only "fiche" in the standard, but may add others.
                        // Of course that particular special case leads to daichead.
                        case 2:
                            return "dhá" + sNoun(leniteOrUru(noun,2));
                    }
                    break;  // Shouldn't be needed.
                    
                case "people":
                    if (noun == null) {
                        noun = "duine";  // Need a value for 0,1
                    }
                    switch(n) {
                        case 0: return noun + " ar bith";
                        case 1: return noun;
                        case 2: return "beirt" +sNoun(hPrefix(lenite(genitivePlural(noun))));
                            
                    }
                    break;  // Shouldn't be needed.
                                    
                case "ordinal":
                    switch(n) {
                        case 0:
                            warn("Non standard construction: "+ordinalPrefix[0]+" for zeroth");
                            return ordinalPrefix[0] + sNoun(noun);
                        case 1:
                            if (highest) {
                                return "chéad" + sNoun(lenite(noun, "chéad"));
                            } else {
                                return "aonú"  + sNoun(noun);
                            }
                        case 2:
                            if (highest) {
                                return "dara"  + sNoun(noun);
                            } else {
                                return "dóú"   + sNoun(noun);
                            }
                    }
            }            
            return null;
        }

        // Handle all numbers below 3-99
        // Bigger indicates if there is a hundreds string preceding.
        function twoDigits(bigger) {

            // Handle people as a special case
            if (context == "people" && (n == 12  || n <= 10)) {  // Recall 0-2 handled elsewhere
                return peoplePrefix[n] + sNoun(genitivePlural(noun));
            }

            if (n < 10) {
                switch (context) {
                    case "counting":
                        return "a "+hPrefix(basePrefix[n]) + sNoun(noun);
                    case "ordinal":
                        return ordinalPrefix[n] + sNoun(hPrefix(noun));
                    default:
                        return objectPrefix[n]+sNoun(leniteOrUru(noun, n, true));
                }
            } else if (n == 10) {
                switch(context) {
                    case "counting":
                        return "a deich"   + sNoun(noun);  // No uru, but usually noun should be null.
                    case "ordinal":
                        return "deichiú" + sNoun(hPrefix(noun));
                    default:
                        // We know that we will never lenite, but leniteOrUru
                        // also handles special nouns.
                        return "deich"   + sNoun(leniteOrUru(noun, n, true));
                }
            } else if (n < 20) {
                let res;
                switch (context) {
                    case "counting":
                        res = "a " + hPrefix(basePrefix[n-10]);
                        if (n == 12) {
                            return res + " dhéag" + sNoun(noun);  // Again should normally have noun null. 
                        } else {
                            return res + " déag" + sNoun(noun);
                        }
                        return res;
                    case "ordinal":
                        let ins = "";
                        let ord = ordinalPrefix[n-10];
                        // If we aren't following a hunder, then the 'is' is not included.
                        return ins + ord + sNoun(hPrefix(noun)) + sNoun("déag");
                    default:
                        // We do not use sNoun here, because we don't want to print out
                        // an infixed noun here.  We do it after the deag.
                        if (simple) {
                            let res = "";
                            if (bigger) {
                                res = "a " + hPrefix(basePrefix[n-10]);
                            } else {
                                res += basePrefix[n-10];
                            }
                            if (n-10 == 2) {
                                res += " dhéag";
                            } else {
                                res += " déag";
                            }
                            
                            res += sNoun(noun);
                            return res;
                            
                        } else {
                            res = objectPrefix[n-10]+ ' ' + leniteOrUru(noun,n-10,true);
                            if (gender(noun) == "f"  || (noun == "míle"  && index == 1)) {
                                res += " dhéag";
                            } else {
                                res += " déag";
                            }
                            if (lowest && nfix) {  // Add in a stowed away noun at the end if this is the first significant triplet.
                                res += ' '+nfix;                                 
                            }
                            return res;
                                
                        }
                }
                
            } else if (n%10 == 0) { // 20, 30, 40, ...
                let tens = Math.floor(n/10);
                switch(context) {
                    case "ordinal":
                        return ordinalTens[tens]+sNoun(hPrefix(noun));
                    default:
                        return countingTens[tens] + sNoun(noun);                    
                }
                
            } else { // two digits, not divisible by 10, > 20
                let tens = Math.floor(n/10);
                let ones = n%10;
                switch (context) {
                    case "counting":
                        return countingTens[tens]+" a "+hPrefix(basePrefix[ones]) + sNoun(noun);  // Usually null.
                    case "ordinal":
                        if (bigger) {
                            return countingTens[tens] + " is " + ordinalPrefix[ones] + sNoun(hPrefix(noun));                            
                        } else {
                            return ordinalPrefix[ones] + sNoun(hPrefix(noun)) + " is "+countingTens[tens];
                        }
                    default:
                        
                        // Recall that personal numbers were handled above in this routine.
                        if (!simple) {
                            if (!bigger) {
                                if (ones == 1 && index == 0) {
                                    return noun + " is "+countingTens[tens];
                                } else {
                                    return objectPrefix[ones]+sNoun(leniteOrUru(noun, ones, true)) + " is "+countingTens[tens];
                                }
                            } else {
                                let amhain = "";
                                if (index == 0 && ones == 1) {
                                    amhain = " amhain";
                                }
                                return res = countingTens[tens] +  " is " + objectPrefix[ones] + sNoun(leniteOrUru(noun, ones))+amhain;
                            } 
                        } else {
                            return countingTens[tens] + " a "+hPrefix(basePrefix[ones])+sNoun(noun);
                        }
                }
            }
        }
        
        // Handle a triplet 100-999
        function threeDigits() {
            let hun = Math.floor(n/100);
            let res;
            if (hun == 1) {
                res = "céad";
            } else {
                let num = objectPrefix[hun];
                res = num + ' '+leniteOrUru("céad", hun);
            }
            if (n % 100 == 0) {
                switch (context) {
                    case "ordinal":
                        return res + "ú"+sNoun(hPrefix(noun));
                    default: 
                        return res + sNoun(noun);
                }                
            } else {
                n = n%100;   
                let td  = twoDigits(true);
                let sep = " ";
                if (context == "ordinal"  || (context == "objects"  && !simple) ) {                    
                    if (n < 20 || n%10 == 0) {
                        sep = " is ";
                    }                    
                }
                return res + sep + td;
            }
        }

        // Apply lenition of uru to the noun depending upon the number
        function leniteOrUru(noun, n, vowel) {
            
            // First check for some exceptional words
            let spec = specialPlural(noun, n);
            if (spec) {
                if (n<7) {
                    return spec;  // No seimhiu
                } else {
                    return uru(spec, vowel);
                }
            }
            
            if (n == 0) {  // 20, 30 ,40, ...  10 will be handled separately.
                return noun;
            } else if (n < 7) {
                return lenite(noun, basePrefix[n]);
            } else {
                return uru(noun, vowel);
            }
        }
        
        // Prefix a space to a noun (or other word) if it is really there.
        // We may also append a noun fix if we had to suppress the real
        // noun for a triplet unit.
        function sNoun(noun) {
            if (noun == null || noun.length == 0) {
                return nfix;
            } else  {
                let res = " "+noun;
                if (nfix) {
                    res += " "+nfix;
                }
                return res;
            }
        }
        
        // We are going to prefix the ordinals with the article 'an'.
        // But only if this is the highest order triplet.
        function fixOrdinal(text) {
            if (!highest) {
                return text;
            } else {
                // Replace an initial 'dhá' with 'dá' since lenition is suppressed after 'an'.
                if (text.startsWith("dhá ")) {
                    text = "d"+text.substring(2);
                }
                // Note clear if we only do tPrefix here for aonu and ochtu or whether we should also do aon and ocht.
                return "an "+tPrefix(text);
            }
        }
        
        // Apply lenition to a word applying the dentals rule if needed.
        function lenite(noun, previous) {  
            
            if (noun == null || noun.length == 0) {
                return noun;
            }
            let init = noun.substring(0,1);
            let type = lenites[init];
            if (!type){
                return noun;
            }
            if (type == 1) {
                return init+"h"+noun.substring(1);
            }
    
            // Need to worry about dentals rule.  Don't lenite after dntls
            if (previous == null || previous.length == 0) {
                // No previous word, so we assume we can lenite.
                return init+"h"+noun.substring(1);
            }
                        
            let prev = previous.substring(previous.length-1);
            if (dentals[prev]) {
                return noun;
            } else {
                return init + "h" + noun.substring(1);
            }            
        }
        
        // Apply Uru to the word.
        function uru(noun, vowel) {
            if (noun == null || noun.length == 0) {
                return noun;                
            }
            if (noun == "billiún") {
                // Otherwise 10,000,000 and 10,000,000,000 would
                // sound exactly the same.  But this is a personal
                // hack, not documented in official practice.
                warn("Suppressed uru of billiún");
                return noun;
            }
            let init = noun.substring(0,1);
            if (consanUru[init]) {
                return consanUru[init]+noun;
            } else if (vowel && vowels[init]) {
                return "n-" + noun;
            }
            return noun;            
        }
        
        // Prepend h to nouns beginning with a vowel.
        function hPrefix(noun) {
            if (noun == null || noun.length == 0) {
                return noun;
            }
            let init = noun.substring(0,1);
            if (vowels[init]) {
                return "h" + noun;
            } else {
                return noun;
            }            
        }
        
        // Prepend t- to numbers beginning with a vowel (1,8)
        function tPrefix(noun) {
            if (noun == null || noun.length == 0) {
                return noun;
            }
            let init = noun.substring(0,1);
            if (vowels[init]) {
                return "t-" + noun;
            } else {
                return noun;
            }            
        }

                
        // Handle nouns that have a special plural form.
        // This is used 3-10, 11-19, 22-29,32-39 ...
        // Note that uru may need to be
        // applied on the transformed noun
        // but lenition should not be applied.
        // Fiche is a unique (officially) case and has a special form for 2.
        function specialPlural(noun, n) {
            let specials3 = {
                bliain:    "bliana",
                seachtain: "seachtaine",
                ceann:     "cinn",
                cloigeann: "cloigne",
                fiche:     "fichid",
                pingin:    "pingine",
                trian:     "treana",
                troigh:    "troithe",
                uair:      "uaire",   
            };
            
            // These words have multiple meanings and the special
            // form is only used with some of them.  We will use
            // the special form, but warn the user.
            let ambig = {"ceann":1, "cloigeann":1, "uair": 1};
            
            
            // I think there may be some other words which have special dual
            // forms (lamh, brog, ...) but they don't seem to be discussed in the Grammadach Oifigiul
            // so we don't include them here.  Note that we include lenition here
            // since otherwise we are going to skip lenition when this returns
            // a non-null since lenition is suppressed for 3-7.
            let specials2 = {
                fiche:     "fhichead"            
            }
           
            if ( (n%10 == 2) && specials2[noun]) {
                return specials2[noun];
            } else if ( (n > 2 && n <= 10) || (n%10) > 2) {
                
                if (specials3[noun]) {
                    if (ambig[noun]) {
                        warn("The noun "+noun+" has a numeric plural form in only some meanings.  Plural form assumed.");
                    }
                    
                    // Not clear if this is a general rule for these for
                    // words that begin with vowels, since it is unique...
                    if (noun == "uair") {
                        let mod = n%10;
                        if (mod > 2 && mod < 7) {
                            return "huaire";
                        }
                    }
                    return specials3[noun];
                }
            }
            return null;  // No applicable transform.
        }
            
        // Use the word list imported from Teanglann to find the genitive plural of
        // the noun.  Warn if not found, but continue returning the untransformed
        // input.
        function genitivePlural(noun) {
            if (noun == null || noun.length == 0) {
                return noun;
            }
            let val = nouns[noun];
            if (!val) {
                val = nouns[noun.toLowerCase()];
            }
            if (!val) {
                warn("Noun "+noun+" not recognized in context which requires genitive plural");
                return noun;
            }
            if (!val.gp) {
                warn("No genitive plural form found for "+noun+".  Using nominative singular in context which requires genitive plural");
                return noun;
            }  else {
                return val.gp;
            }
        }
        
        // Get the gender of a noun from the Teanglann db.
        function gender(noun) {
            if (noun.indexOf(" ") > 0) {
                return "m"; // May be ordinal followed by noun which should not be lenited.
            }
            let word = nouns[noun];
            if (word == null) {
                warn("Attempt to use unknown noun, "+noun+", in context where gender is requied.  Assuming masculine.");
                return "m";
            }
            if (!word.gender) {
                warn("No gender defined for noun.  Assuming masculine.");
                return "m";
            }
            return word.gender;
        }
        
        // Put this here so that most of the code doesn't
        // need to know about the external page.
        function warn(text) {
            here.page.warn(text);
        }
        
    }
}

export default Triplet;

    