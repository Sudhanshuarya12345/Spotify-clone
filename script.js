let currentsong = new Audio();
let songs;
let currentFolder;

// let linkOfSongfolder = 'http://127.0.0.1:5500/Spotify%20clone/songs/'
let linkOfSongfolder = 'https://github.com/Sudhanshuarya12345/Spotify-clone/blob/main/songs/'

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input"
    }
    const minutes = Math.floor(seconds / 60)
    const remSecond = Math.floor(seconds % 60)
    // formate the minutes and second in two digit values
    const fmin = String(minutes).padStart(2, '0')
    const fsec = String(remSecond).padStart(2, '0')
    // returing timing in formate of mm:ss
    return `${fmin}:${fsec}`
}

async function displayAlbums() {
    let a = await fetch(`${linkOfSongfolder}`)

    // getting link of main folder
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response

    let anchors = div.getElementsByTagName('a')
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes('/songs/') && !e.href.includes("htaccess")){
            let splitoflink = e.href.split('/')
            let folder = splitoflink[splitoflink.length-1]
            // console.log(folder)

            //get the metadata of the folder like description, title etc
            let a = await fetch(`${linkOfSongfolder}${folder}/info.json`)
            let response = await a.json()

            // Adding cards to cardcontainer
            cardcontainer.innerHTML = cardcontainer.innerHTML +
                `
                    <div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <svg width="34" height="34" viewBox="0 0 100 100">
                                <polygon points="30,20 80,50 30,80" />
                            </svg>                        
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
                `
        }
    }
}


async function getsongs(folder) {
    currentFolder = folder
    // Fetching innerHTML of below link
    let a = await fetch(`${linkOfSongfolder}${currentFolder}/`)
    let response = await a.text()

    // use response inside div And get link using getElementsByTagName('a')
    let div = document.createElement("div")
    div.innerHTML = response;
    let alink = div.getElementsByTagName("a")

    // push all link inside object songs
    let songs = []
    for (let index = 0; index < alink.length; index++) {
        if (alink[index].href.endsWith(".mp3") ||
            alink[index].href.endsWith(".m4a")) {
            songs.push(alink[index].href)
        }
    }
    return songs
}

async function addSongsToYourLibrary() {
    let songslink = await getsongs(`${currentFolder}`)
    // storing name
    songs = []
    for (let index = 0; index < songslink.length; index++) {
        songs.push(songslink[index].split(`/songs/${currentFolder}/`)[1])
    }

    currentsong.src = songslink[0]
    playmusic((decodeURI(songs[0]).split('.'))[0], true)

    // Adding element(song) to playlist and Show it in playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (let index = 0; index < songs.length; index++) {
        const song = songs[index];
        songUL.innerHTML = songUL.innerHTML +
            `
                <li>
                    <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll(".mp3", "").replaceAll(".m4a", "").replaceAll("%20", " ")}</div>
                        <div>Artist</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.png" width="24px" height="24px" alt="">
                    </div>
                </li>
            `
    }

    // Attach an event listener to play
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", Element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/tut84%20Spotify%20clone/songs/Audio/"+track+".mp3")
    currentsong.src = `${linkOfSongfolder}${currentFolder}/` + track + ".mp3"
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.png"

        currentsong.play().catch(error => {
            currentsong.src = `${linkOfSongfolder}${currentFolder}/` + track + ".m4a"
            play.src = "img/pause.png"
            currentsong.play()
        });
    }

    // Show details of songs like duration, current time, name etc.
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main() {
    currentFolder = "Audio"

    addSongsToYourLibrary()

    await displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.png"
        }
        else {
            currentsong.pause()
            play.src = "img/play.png"
        }
    })
  
    // Listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentsong.currentTime)} / ${secondsToMinutes(currentsong.duration)}`
        
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%'
        if(currentsong.currentTime == currentsong.duration){
            play.src = "img/play.png"
        }
    })

    // Add an event listener to seekbar to change currentTime of currentSong
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector('.circle').style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration)*percent)/100
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })
    // add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-110%"
    })
    
    // add an event listener to play previous song
    document.getElementById("previous").addEventListener("click", ()=>{
        let element = currentsong.src.split('/')
        let index = songs.indexOf(element[element.length - 1])

        if(index > 0){
            let nextmusic = songs[index-1].replaceAll(".mp3", "").replaceAll(".m4a", "").replaceAll("%20", " ")
            playmusic(nextmusic)
        }
        else{
            let nextmusic = songs[songs.length-1].replaceAll(".mp3", "").replaceAll(".m4a", "").replaceAll("%20", " ")
            playmusic(nextmusic)
        }
    })
    
    // add an event listener to play next song
    next.addEventListener("click",()=>{
        let element = currentsong.src.split('/')
        let index = songs.indexOf(element[element.length - 1])

        if(index < songs.length-1){
            let nextmusic = songs[index+1].replaceAll(".mp3", "").replaceAll(".m4a", "").replaceAll("%20", " ")
            playmusic(nextmusic)
        }
        else{
            let nextmusic = songs[0].replaceAll(".mp3", "").replaceAll(".m4a", "").replaceAll("%20", " ")
            playmusic(nextmusic)
        }
    })

    // Add an event to Volume to change loudness
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        // volume set like 25%, 30% etc.
        muteUnmute.src = "img/volume.svg"
        currentsong.volume = parseInt(e.target.value)/100
    })

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            currentFolder = item.currentTarget.dataset.folder
            addSongsToYourLibrary()
            play.src = "img/play.png"
        })
    })

    // Add an listener to mute and unmute by clicking on image
    document.querySelector(".volume").children[0].addEventListener("click", (e)=>{
        // volume set like 25%, 30% etc.
        if(muteUnmute.src.includes('volume.svg')){
            muteUnmute.src = "img/mute.svg"
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
            currentsong.volume = parseInt(0)
        }
        else{
            muteUnmute.src = "img/volume.svg"
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
            currentsong.volume = 0.10
        }
    })


}

main()

