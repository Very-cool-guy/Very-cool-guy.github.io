const body = document.getElementsByTagName("body")[0]
const cursor = document.getElementById("sixseven")

let counter = 0
body.addEventListener("click", () => {
    counter++
    cursor.innerHTML = "YOU CLICKED : " + counter + "TIMES (WILL YOU BE ABLE TO REACH 67 😭😭😭)"
    checkCounter()
})

function checkCounter() {
    if (counter === 67){
        window.location.href = "../67.html"
    }
}