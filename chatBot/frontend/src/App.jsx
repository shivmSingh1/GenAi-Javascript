import { useState, useRef, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from "axios"
export const serverUrl = "https://chatease-gbfi.onrender.com"
import { v4 as uuidv4 } from "uuid"
import { MdDarkMode, MdLightMode, MdSend } from 'react-icons/md'

function App() {
  const [userMessage, setUserMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const id = uuidv4();
    setSessionId(id);
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (userMessage.trim() === '') return

    // Add user message
    const newMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user'
    }

    setMessages([...messages, newMessage])
    setUserMessage('')
    setLoading(true)

    try {
      const res = await axios.post(`${serverUrl}/chat`, { userMessage: userMessage, sessionId })
      console.log("Response from backend:", res?.data)

      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        text: res?.data?.text || res?.data?.response || JSON.stringify(res?.data),
        sender: 'assistant'
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.response?.data?.error || error.message || 'Failed to get response'}`,
        sender: 'assistant'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`d-flex flex-column h-100`} style={{ height: '100vh', backgroundColor: darkMode ? '#0f0f0f' : '#ffffff' }}>
      {/* Header */}
      <div style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#2d2d2d' : '#e5e5e5'}`,
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h5 style={{ margin: 0, color: darkMode ? '#ffffff' : '#000000', fontSize: '1.25rem', fontWeight: 600 }}>
          <i className='bi bi-chat-dots me-2'></i>
          ChatEase
        </h5>
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            fontSize: '1.5rem',
            color: darkMode ? '#fbbf24' : '#6b7280',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.color = darkMode ? '#fcd34d' : '#4b5563'}
          onMouseOut={(e) => e.target.style.color = darkMode ? '#fbbf24' : '#6b7280'}
        >
          {darkMode ? <MdLightMode /> : <MdDarkMode />}
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        backgroundColor: darkMode ? '#0f0f0f' : '#f9fafb'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {messages.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <h4 style={{ color: darkMode ? '#f3f4f6' : '#1f2937', marginBottom: '0.5rem' }}>How can I help you today?</h4>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Start a conversation by typing your message below</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    marginBottom: '1rem',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: msg.sender === 'user' ? '0.75rem' : '0.75rem',
                      wordWrap: 'break-word',
                      backgroundColor: msg.sender === 'user' ? '#10a37f' : (darkMode ? '#1f2937' : '#ffffff'),
                      color: msg.sender === 'user' ? '#ffffff' : (darkMode ? '#f3f4f6' : '#000000'),
                      boxShadow: msg.sender === 'user' ? '0 2px 4px rgba(16, 163, 127, 0.2)' : (darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.05)'),
                      border: msg.sender === 'user' ? 'none' : (darkMode ? 'none' : '1px solid #e5e7eb'),
                      lineHeight: '1.5',
                      fontSize: '0.95rem'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', marginBottom: '1rem', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    color: darkMode ? '#f3f4f6' : '#000000',
                    boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                    border: darkMode ? 'none' : '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div className='spinner-border spinner-border-sm text-success' role='status' style={{ width: '1rem', height: '1rem' }}>
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                    <span style={{ fontSize: '0.95rem' }}>Thinking...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        borderTop: `1px solid ${darkMode ? '#2d2d2d' : '#e5e5e5'}`,
        padding: '1.5rem',
        boxShadow: darkMode ? '0 -1px 3px rgba(0,0,0,0.3)' : '0 -1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end',
            backgroundColor: darkMode ? '#262626' : '#f3f4f6',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: `2px solid ${darkMode ? '#3f3f3f' : '#e5e7eb'}`,
            transition: 'all 0.3s ease'
          }}
            onFocus={(e) => {
              if (e.target.tagName === 'TEXTAREA') {
                e.currentTarget.style.borderColor = '#10a37f'
                e.currentTarget.style.backgroundColor = darkMode ? '#1a1a1a' : '#ffffff'
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = darkMode ? '#3f3f3f' : '#e5e7eb'
              e.currentTarget.style.backgroundColor = darkMode ? '#262626' : '#f3f4f6'
            }}
          >
            <textarea
              placeholder='Type your message here...'
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows='1'
              style={{
                flex: 1,
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                color: darkMode ? '#f3f4f6' : '#000000',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'none',
                maxHeight: '150px',
                outline: 'none',
                scrollbarWidth: 'thin',
                scrollbarColor: darkMode ? '#4f4f4f #1a1a1a' : '#d1d5db #f3f4f6'
              }}
            />
            <div
              onClick={handleSend}
              disabled={userMessage.trim() === ''}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: userMessage.trim() === '' ? 'not-allowed' : 'pointer',
                fontSize: '1.5rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: userMessage.trim() === '' ? '#d1d5db' : '#10a37f',
                padding: '0.25rem',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                if (userMessage.trim() !== '') {
                  e.target.style.color = '#0d8566'
                  e.target.style.transform = 'scale(1.2)'
                }
              }}
              onMouseOut={(e) => {
                if (userMessage.trim() !== '') {
                  e.target.style.color = '#10a37f'
                }
                e.target.style.transform = 'scale(1)'
              }}
              title='Send message (Enter)'
            >
              <MdSend />
            </div>
          </div>
          <small style={{ display: 'block', marginTop: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.85rem' }}>
            Press Shift+Enter for new line, Enter to send
          </small>
        </div>
      </div>
    </div>
  )
}

export default App
