var enabled = true
function leon() {
    const leon_response = document.createElement("p");
    leon_response.innerHTML = "まだ何もなかった時、神は天と地を造りました. 地は形も定まらず、闇に包まれた水の上を、さらに神の霊が覆っていました. <br>「光よ、輝き出よ.」神が言われると、光がさっとさしてきました.";
    document.getElementById("leon_be_like").appendChild(leon_response);
}

function barrelrolltoggel(){
    var a = barrelroll

    if(enabled){
        a.innerText = "ENABLE BARREL ROLL :3"
        document.body.classList.remove("barrelroll")
        enabled = false
    }else{
        a.innerText = "DISABLE BARREL ROLL"
        document.body.classList.add("barrelroll")
        enabled = true
    }
}
