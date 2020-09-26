import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app'

import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'


console.log(process.env);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DB_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID
};
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const firestore = firebase.firestore()


// created by amans199 => you can find me on twitter [https://twitter.com/amans199]

function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header>

      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <div className="signInBtn">
      <button onClick={signInWithGoogle}>Sign In with Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => { auth.signOut() }}>Sign Out</button>
  )
}
// <></> called fragments in react
function ChatRoom() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)
  const [messages] = useCollectionData(query, { idField: 'id' })
  const [formValue, setFormValue] = useState('')
  const scrollToTheEnd = useRef()
  const sendMessage = async (e) => {
    e.preventDefault()
    if (formValue != '') {
      const { uid, photoURL } = auth.currentUser
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
      setFormValue('')
      scrollToTheEnd.current.scrollIntoView({ behavior: 'smooth' })
    } else {
      alert('The message doesn\'t contain any text')
    }
  }
  return (
    <>
      <div className="MessagesHeader">
        <div>
          <h3>Messenger</h3>
          <small>Made With &hearts;	 By <a rel="noreferer nooperer" target="_blank" href="https://twitter.com/amans199">Ahmed Mansour</a></small>
        </div>
        <SignOut />
      </div>
      <div className="messages">
        {messages && messages.map(msg => (msg.text != '' ? <ChatMessage key={msg.id} message={msg} /> : ''))}
        <div ref={scrollToTheEnd}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </>
  )
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
