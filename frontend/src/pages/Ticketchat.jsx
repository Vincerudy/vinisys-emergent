import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './css/Ticketchat.css';

export default function Ticketchat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState({});
  const [socket, setSocket] = useState(null);
  const audioRefs = useRef({});
  const match_id = 3222594;
  const user_id = 5;
  const language = navigator.language.split('-')[0]; // remplace expo-localization

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      match_id,
      user_id,
      content: message,
      language,
      timestamp: Date.now(),
      sent: true,
    };

    setMessages([newMessage, ...messages]);
    setMessage('');

    try {
      await axios.post(`https://api.vinisys.com/postmessages`, newMessage);
    } catch (error) {
      console.error('Erreur d’envoi :', error.response?.data || error.message);
    }
  };

  const startRecording = async () => {
    alert("L'enregistrement audio n'est pas encore implémenté. Utilisez WebRTC ou MediaRecorder pour le support navigateur.");
  };

  const stopRecording = async () => {
    alert("Arrêt de l'enregistrement non disponible.");
  };

  const playAudio = async (id) => {
    const currentAudio = audioRefs.current[id];

    if (!currentAudio) return;

    if (!currentAudio.paused) {
      currentAudio.pause();
      setIsPlaying(prev => ({ ...prev, [id]: false }));
    } else {
      // Arrêter tous les autres
      Object.keys(audioRefs.current).forEach((key) => {
        if (key !== id) {
          audioRefs.current[key].pause();
          setIsPlaying(prev => ({ ...prev, [key]: false }));
        }
      });

      await currentAudio.play();
      setIsPlaying(prev => ({ ...prev, [id]: true }));

      currentAudio.onended = () => {
        setIsPlaying(prev => ({ ...prev, [id]: false }));
      };
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`https://api.vinisys.com/affichageMessage/${match_id}`);
        const sorted = res.data.sort((a, b) => b.timestamp - a.timestamp);
        setMessages(sorted);
      } catch (error) {
        console.error("Erreur récupération messages :", error);
      }
    };

    const newSocket = io('https://api.vinisys.com:3614');
    newSocket.on('connect', () => console.log('Socket connecté'));
    newSocket.on('new_message', (msg) => {
      if (msg.match_id === match_id) {
        setMessages(prev => [msg, ...prev]);
      }
    });

    setSocket(newSocket);
    fetchMessages();

    return () => {
      newSocket.disconnect();
    };
  }, [match_id]);

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.user_id === user_id ? 'sent' : 'received'}`}>
            {msg.content && <p>{msg.content}</p>}
            {msg.audio && (
              <div className="audio-message">
                <audio
                  ref={(el) => (audioRefs.current[msg.id] = el)}
                  src={msg.audio}
                />
                <button onClick={() => playAudio(msg.id)}>
                  {isPlaying[msg.id] ? 'Pause' : 'Play'}
                </button>
              </div>
            )}
            <span className="timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez un message..."
        />
        <button onClick={handleSend}>Envoyer</button>
        <button onClick={startRecording}>🎙️</button>
      </div>
    </div>
  );
}
