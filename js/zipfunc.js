// zip連結値を格納
function zipFunc() {
    document.querySelector("[name=zipnumber]").value =
        document.querySelector("[name=zip1]").value +
        document.querySelector("[name=zip2]").value;
}
