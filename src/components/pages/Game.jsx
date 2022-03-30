import { BsFillPlayCircleFill } from 'react-icons/bs'
import { BsFillPauseCircleFill } from 'react-icons/bs'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import EndGame from '../EndGame'

export default function Game({ token, currentUser }) {
    const { id } = useParams()

    const [tracks, setTracks] = useState([]) // tracks' name,song,id
    const [audio, setAudio] = useState({
        name: '',
        id: '',
        sound: null,
        isPlayed: false
    })
    const [btnChoice, setBtnChoice] = useState([]) //button choices max 4
    const [rounds, setRounds] = useState(1)
    const [score, setScore] = useState(0)
    const [keepTrack, setKeepTrack] = useState([{
        songName: '',
        songId: '',
        songUrl: '',
        answer: null
    }])

    useEffect(() => {
        // const something = async () => {
        (async () => {
            try {
                // accessing the api to get the top-tracks of the artist(id)
                const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        market: 'US'
                    }
                })
                // array for storing the tracks' name and track_url
                const audioData = []
                console.log(response.data.tracks[0].artists[0].name)
                for (let i = 0; i < response.data.tracks.length; i++) {
                    audioData.push({ name: response.data.tracks[i].name, song: response.data.tracks[i].preview_url, id: response.data.tracks[i].id })
                }
                //saving the tracks' data to a state
                setTracks(audioData) //tracks' name,url,id
            } catch (error) {
                console.log(error)
            }
        })()
        // }
    }, [])


    const loadAudio = () => {
        if (audio.sound != null) {
            if (audio.isPlayed) {
                audio.sound.pause()
                setAudio({ ...audio, sound: null, isPlayed: false, name: '' })
            } else
                setAudio({ ...audio, sound: null, isPlayed: false, name: '' })
        } else {

            const rand = Math.floor(Math.random() * tracks.length)
            const prevSong = tracks[rand].song
            const prevName = tracks[rand].name
            const prevId = tracks[rand].id
            // console.log('tracks name', prevName)
            // console.log('tracks name', prevSong)
            // console.log('keep track', keepTrack.length)
            // console.log('keep track song', keepTrack.values)

            const searchArray = keepTrack.map(e => {
                return e.songUrl
            })

            if (keepTrack.length === 1) {
                setAudio({ ...audio, name: prevName, id: prevId, sound: new Audio(prevSong) })//assigning a random song from the top 10 
            }
            else if (!searchArray.includes(prevSong)) {
                setAudio({ ...audio, name: prevName, id: prevId, sound: new Audio(prevSong) })//assigning a random song from the top 10 
            } else loadAudio()

            // console.log('keep track', ...keepTrack)
            // console.log('after setting audio', audio)
            // randomChoices()
        }
    }
    useEffect(() => {
        const btnChoices = []
        const rando = Math.floor(Math.random() * btnChoice.length)

        const correctAnswer = audio.name
        console.log('correct', audio.name)

        console.log('before while', btnChoices.length)
        // will create 4 randomized choices
        if (tracks.length != 0) {
            while (btnChoices.length != 4) {
                const rand = Math.floor(Math.random() * tracks.length)
                if (!btnChoices.includes(tracks[rand].name)) {
                    btnChoices.push(tracks[rand].name)
                }
            }
        }

        console.log('after while', btnChoices.length)
        console.log('current', audio.name)
        console.log('before', btnChoices)
        if (!btnChoices.includes(correctAnswer)) {
            btnChoices.splice(rando, 1, correctAnswer)
            // console.log('after', btnChoices)
        }
        setBtnChoice(btnChoices)
        console.log('this is the inside of the audio state', audio)
    }, [audio.sound])

    const handleClick = () => {
        // console.log('click')
        const prev = audio.isPlayed
        if (audio.sound != null) {
            if (audio.isPlayed) {
                audio.sound.pause()
                setAudio({ ...audio, isPlayed: !prev })
            }
            else {
                audio.sound.play()
                setAudio({ ...audio, isPlayed: !prev })
            }
        }
    }

    const userChoice = btnChoice.map(name => {
        return (
            <>
                <li><button value={name} onClick={() => checkAnswer(name)}>{name}</button></li>
            </>
        )
    })

    const checkAnswer = (answer) => {
        // const prev = rounds
        if (answer === audio.name) {
            setRounds(rounds + 1)
            setScore(score + 1)
            console.log(true)
            setKeepTrack([...keepTrack, { songName: audio.name, songId: audio.id, songUrl: audio.sound.src, answer: true }])
            loadAudio()
        }
        else {
            console.log(false)
            setRounds(rounds + 1)
            setKeepTrack([...keepTrack, { songName: audio.name, songId: audio.id, songUrl: audio.sound.src, answer: false }])
            loadAudio()
        }
    }
    return (
        <div>
            {rounds > 5 ? <EndGame score={score} artistId={id} currentUser={currentUser} songsPlayed={keepTrack} /> :
                <>
                    <h2>Game Page</h2>
                    <h3>Round {rounds} of 5</h3>
                    <h3>Score: {score}</h3>
                    <div className="audio-widget">
                        <button onClick={handleClick}>
                            {!audio.isPlayed ? <BsFillPlayCircleFill /> : <BsFillPauseCircleFill />}
                        </button>
                    </div>
                    {/* <h5>Timer: 30 seconds</h5> */}
                    <button onClick={loadAudio}>Load</button>
                    <h3>Listen to the track and choose your answer</h3>

                    <ul>
                        {audio.sound != null ? userChoice : ''}
                    </ul>
                </>
            }
        </div>
    )
}
