var enabled = !document.cookie.includes('barrelroll=disabled')

function YeetusdeletusReze() {
    const rezeVideo = document.getElementById('reze-video')
    if (rezeVideo) {
        rezeVideo.classList.add('slide-out-right')
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('barrelroll')
    if (btn) {
        if (enabled) {
            document.body.classList.add("barrelroll")
            btn.innerText = "DISABLE BARREL ROLL"
        } else {
            document.body.classList.remove("barrelroll")
            btn.innerText = "ENABLE BARREL ROLL :3"
        }
    }
})

function leon() {
    const leon_response = document.createElement("p");
    leon_response.innerHTML = "まだ何もなかった時、神は天と地を造りました. 地は形も定まらず、闇に包まれた水の上を、さらに神の霊が覆っていました. <br>「光よ、輝き出よ.」神が言われると、光がさっとさしてきました.";
    document.getElementById("leon_be_like").appendChild(leon_response);
}

function barrelrolltoggel(){
    var a = barrelroll
    document.cookie = "barrelroll=" + (enabled ? "disabled" : "enabled") + "; path=/; max-age=31536000";

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
