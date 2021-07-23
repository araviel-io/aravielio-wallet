export function ForceSignatureFromException(exception) {
   // console.log("+++ PARSED EXCEPTION SIGN : ", exception)
    //var ex = exception.ToString();

    var exsignature = exception.substring(
        exception.indexOf("Transaction ") + 12, 
        exception.lastIndexOf(" failed")
    );
    console.log("+++ PARSED EXCEPTION SIGNddd : ", exsignature)
    //tparse signature
    return exsignature;
}
