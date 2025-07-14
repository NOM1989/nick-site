"use client"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon, Info } from "lucide-react"
import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

export default function RetroDisplay() {
  const [row1, setRow1] = useState("")
  const [row2, setRow2] = useState("")
  const [currentRow, setCurrentRow] = useState(0)
  const [cursorPos, setCursorPos] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [lastUpdate, setLastUpdate] = useState("")
  const [lastSentTime, setLastSentTime] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMessageSent, setShowMessageSent] = useState(false)
  const [messageFlashCount, setMessageFlashCount] = useState(0)
  const [encryptedRow1, setEncryptedRow1] = useState("")
  const [encryptedRow2, setEncryptedRow2] = useState("")
  const [encryptionProgress, setEncryptionProgress] = useState(0)
  const displayRef = useRef<HTMLDivElement>(null)
  const flashSequenceStarted = useRef(false)

  // Update timestamp
  const updateTimestamp = useCallback(() => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setLastUpdate(`${hours}:${minutes}`)
  }, [])

  // Initialize timestamp
  useEffect(() => {
    updateTimestamp()
  }, [updateTimestamp])

  const [sendStatus, setSendStatus] = useState("")

  // Generate random character for encryption effect
  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    return chars[Math.floor(Math.random() * chars.length)]
  }

  // Create encrypted version of text with progressive encryption from left to right
  const createEncryptedText = (originalText: string, progress: number) => {
    return originalText.split('').map((char, index) => {
      if (char === ' ') return ' '
      
      const charProgress = Math.max(0, Math.min(1, (progress - index * 0.1) * 2))
      
      if (charProgress >= 1) {
        return ' ' // Fully encrypted (cleared)
      } else if (charProgress > 0) {
        return getRandomChar() // Currently encrypting
      } else {
        return char // Not yet encrypted
      }
    }).join('')
  }

  const handleSend = useCallback(() => {
    if (row1.trim() || row2.trim()) {
      setIsAnimating(true)
      setIsActive(false) // Unfocus during animation
      setEncryptionProgress(0)
      flashSequenceStarted.current = false // Reset flash sequence flag
      
      // Start encryption animation
      const encryptionInterval = setInterval(() => {
        setEncryptionProgress(prev => {
          const newProgress = prev + 0.1
          
          // Update encrypted versions
          setEncryptedRow1(createEncryptedText(row1, newProgress))
          setEncryptedRow2(createEncryptedText(row2, newProgress))
          
          if (newProgress >= 2) { // Complete encryption
            clearInterval(encryptionInterval)
            
            // Clear original text after encryption completes (only once)
            if (!flashSequenceStarted.current) {
              flashSequenceStarted.current = true
              setTimeout(() => {
                setRow1("")
                setRow2("")
                setEncryptedRow1("")
                setEncryptedRow2("")
                setCursorPos(0)
                setCurrentRow(0)
                setEncryptionProgress(0)
                setIsAnimating(false) // End animation state before flash
                
                // Start "Message Sent" flash sequence
                setShowMessageSent(true)
                setMessageFlashCount(0)
                
                const flashInterval = setInterval(() => {
                  setMessageFlashCount(prev => {
                    const newCount = prev + 1
                    if (newCount >= 6) { // Flash 3 times (on/off = 2 counts per flash)
                      clearInterval(flashInterval)
                      setShowMessageSent(false)
                      return 0
                    }
                    return newCount
                  })
                }, 300)
              }, 200)
            }
          }
          
          return newProgress
        })
      }, 80) // Update every 80ms for smooth encryption effect

      setSendStatus("SENT")

      // Update last sent time with full date and time
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      })
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
      setLastSentTime(`${dateStr} ${timeStr}`)

      updateTimestamp()
      setTimeout(() => setSendStatus(""), 2000)
    }
  }, [row1, row2, updateTimestamp])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      const currentText = currentRow === 0 ? row1 : row2
      const setCurrentText = currentRow === 0 ? setRow1 : setRow2

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          setCursorPos(Math.max(0, cursorPos - 1))
          break
        case "ArrowRight":
          e.preventDefault()
          setCursorPos(Math.min(currentText.length, cursorPos + 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setCurrentRow(0)
          setCursorPos(Math.min(cursorPos, row1.length))
          break
        case "ArrowDown":
          e.preventDefault()
          setCurrentRow(1)
          setCursorPos(Math.min(cursorPos, row2.length))
          break
        case "Backspace":
          e.preventDefault()
          if (cursorPos > 0) {
            const newText = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos)
            setCurrentText(newText)
            setCursorPos(cursorPos - 1)
            updateTimestamp()
          } else if (currentRow === 1 && row1.length > 0) {
            // Move to end of previous line if at start of line 2
            setCurrentRow(0)
            setCursorPos(row1.length)
          }
          break
        case "Delete":
          e.preventDefault()
          if (cursorPos < currentText.length) {
            const newText = currentText.slice(0, cursorPos) + currentText.slice(cursorPos + 1)
            setCurrentText(newText)
            updateTimestamp()
          }
          break
        case "Enter":
          e.preventDefault()
          if (currentRow === 0) {
            setCurrentRow(1)
            setCursorPos(row2.length)
          }
          break
        case "Escape":
          e.preventDefault()
          setIsActive(false)
          displayRef.current?.blur()
          break
        default:
          if (e.key.length === 1) {
            // Check if the character is ASCII (character code 32-126 for printable ASCII)
            const charCode = e.key.charCodeAt(0)
            const isAsciiPrintable = charCode >= 32 && charCode <= 126

            if (isAsciiPrintable) {
              e.preventDefault()
              if (currentRow === 0 && row1.length < 16) {
                // Typing on row 1
                const newText = row1.slice(0, cursorPos) + e.key + row1.slice(cursorPos)
                setRow1(newText)
                if (newText.length === 16) {
                  // Auto rollover to next line
                  setCurrentRow(1)
                  setCursorPos(row2.length)
                } else {
                  setCursorPos(cursorPos + 1)
                }
                updateTimestamp()
              } else if (currentRow === 1 && row2.length < 16) {
                // Typing on row 2
                const newText = row2.slice(0, cursorPos) + e.key + row2.slice(cursorPos)
                setRow2(newText)
                setCursorPos(cursorPos + 1)
                updateTimestamp()
              }
            }
            // If not ASCII printable, the key event is ignored (no preventDefault)
          }
          break
      }
    }

    if (isActive) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive, currentRow, cursorPos, row1, row2, updateTimestamp])

  // Handle click to focus
  const handleClick = () => {
    if (!isAnimating) {
      setIsActive(true)
      displayRef.current?.focus()
    }
  }

  // Handle blur
  const handleBlur = () => {
    setIsActive(false)
  }

  // Handle row click for line selection
  const handleRowClick = (rowIndex: number, e: React.MouseEvent) => {
    if (!isAnimating) {
      e.stopPropagation()
      setCurrentRow(rowIndex)
      const text = rowIndex === 0 ? row1 : row2
      setCursorPos(text.length) // Move cursor to end of clicked line
      setIsActive(true)
    }
  }

  // Handle character click for precise cursor positioning
  const handleCharClick = (rowIndex: number, charIndex: number, e: React.MouseEvent) => {
    if (!isAnimating) {
      e.stopPropagation()
      setCurrentRow(rowIndex)

      // Limit cursor position to the actual text length, not the padded length
      const text = rowIndex === 0 ? row1 : row2
      const clampedPosition = Math.min(charIndex, text.length)
      setCursorPos(clampedPosition)
      setIsActive(true)
      displayRef.current?.focus()
    }
  }

  // Render a single row with cursor and click handler
  const renderRow = (text: string, rowIndex: number) => {
    // Show encrypted version during animation
    const displayText = isAnimating 
      ? (rowIndex === 0 ? encryptedRow1 : encryptedRow2)
      : text
    
    const paddedText = displayText.padEnd(16, " ")
    const showCursor = isActive && currentRow === rowIndex && !isAnimating

    return (
      <div
        className={`flex font-mono leading-none transition-all duration-200 rounded-sm px-1`}
        style={{
          fontSize: "18px",
          fontFamily: '"Courier New", monospace',
          fontWeight: "bold",
          textShadow: "1px 1px 0px rgba(0, 255, 0, 0.8), -1px -1px 0px rgba(0, 100, 0, 0.3)",
          letterSpacing: "1px",
        }}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const char = paddedText[i]
          const isCursor = showCursor && i === cursorPos
          
          // Add glitch effect to characters being encrypted
          const originalChar = (rowIndex === 0 ? row1 : row2)[i] || ' '
          const isBeingEncrypted = isAnimating && char !== originalChar && char !== ' ' && originalChar !== ' '

          return (
            <span
              key={i}
              className={`
                inline-block text-center relative cursor-pointer
                ${isCursor ? "bg-green-400 text-black animate-pulse" : "text-green-400"}
                ${char === " " && !isCursor ? "bg-transparent" : ""}
                ${!isCursor && !isAnimating ? "hover:bg-green-900/30" : ""} 
                ${isBeingEncrypted ? "animate-pulse text-green-300" : ""}
                transition-all duration-75
              `}
              onClick={(e) => !isAnimating && handleCharClick(rowIndex, i, e)}
              style={{
                width: "20px",
                height: "24px",
                lineHeight: "24px",
                imageRendering: "pixelated",
                fontSmooth: "never",
                WebkitFontSmoothing: "none",
                textShadow: isBeingEncrypted 
                  ? "0 0 8px rgba(0, 255, 0, 0.8), 0 0 4px rgba(0, 255, 0, 0.6)" 
                  : "1px 1px 0px rgba(0, 255, 0, 0.8), -1px -1px 0px rgba(0, 100, 0, 0.3)",
              }}
            >
              {char === " " && isCursor ? "⠀" : char}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative w-sm">
      {/* Outer casing */}
      <div className="p-6">
        {/* Screen bezel */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-2xl">
          {/* Simple header */}
          <div className="flex justify-between items-center mb-3">
            <h3 
              className="font-mono text-green-400 text-sm font-bold tracking-wider"
              style={{
                textShadow: "0 0 4px rgba(0, 255, 0, 0.6)",
                fontSize: "12px",
                letterSpacing: "2px",
              }}
            >
              LIVE DISPLAY
            </h3>
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild>
                <button className="p-1 text-green-400/70 hover:text-green-400 transition-colors">
                  <Info className="w-3 h-3" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 flex flex-col space-y-2">
                <h4 className="font-bold text-center">Live LCD Screen</h4>
                <Skeleton className="h-32 w-64" />
                <p>This is linked to a display on my desk, send me a message!</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          {/* Display area */}
          <div
            ref={displayRef}
            tabIndex={0}
            onClick={handleClick}
            onBlur={handleBlur}
            className={`
              bg-black p-3 rounded cursor-text outline-none
              relative overflow-hidden
              ${isActive ? "ring-2 ring-green-400/50" : ""}
            `}
            style={{
              background: "linear-gradient(180deg, #001100 0%, #000800 100%)",
              boxShadow: "inset 0 0 20px rgba(0, 255, 0, 0.1)",
            }}
          >
            {/* Scan lines effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 0, 0.1) 2px)",
              }}
            />

            {/* Display content */}
            <div className="relative z-10 space-y-1">
              {/* Show placeholder text if both rows are empty */}
              {!row1 && !row2 && !isActive && !isAnimating && !showMessageSent && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    fontSize: "14px",
                    fontFamily: '"Courier New", monospace',
                    color: "rgba(0, 255, 0, 0.4)",
                    textShadow: "1px 1px 0px rgba(0, 255, 0, 0.2)",
                  }}
                >
                  Click to message...
                </div>
              )}
              
              {/* Message Sent flash overlay */}
              {showMessageSent && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                  style={{
                    fontSize: "16px",
                    fontFamily: '"Courier New", monospace',
                    fontWeight: "bold",
                    color: "rgba(0, 255, 0, 1)",
                    textShadow: "0 0 8px rgba(0, 255, 0, 0.8), 0 0 16px rgba(0, 255, 0, 0.6)",
                    opacity: messageFlashCount % 2 === 0 ? 1 : 0,
                  }}
                >
                  MESSAGE SENT
                </div>
              )}
              
              {renderRow(row1, 0)}
              {renderRow(row2, 1)}
            </div>

            {/* Glow effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0, 255, 0, 0.1) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Status bar */}
          <div className="mt-3 px-2 py-1 bg-gray-800/30 rounded">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className={isOnline ? "text-green-500" : "text-orange-500"}>
                {isOnline ? "●" : "○"} {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
              <span className="text-gray-400">
                Total msgs: {totalMessages}
              </span>
            </div>
          </div>
        </div>

        {/* Send button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSend}
            disabled={!row1.trim() && !row2.trim()}
            className="
              px-6 py-2 font-mono text-sm font-bold
              bg-gray-700 hover:bg-gray-600
              text-green-400 
              rounded shadow-lg
              active:bg-gray-800
              disabled:bg-gray-800 disabled:text-gray-500
              transition-all duration-150
              transform hover:scale-105 active:scale-95
            "
            style={{
              textShadow: "0 0 4px rgba(0, 255, 0, 0.5)",
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  )
}
