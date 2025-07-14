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
  const displayRef = useRef<HTMLDivElement>(null)

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

  const handleSend = useCallback(() => {
    if (row1.trim() || row2.trim()) {
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
    setIsActive(true)
    displayRef.current?.focus()
  }

  // Handle blur
  const handleBlur = () => {
    setIsActive(false)
  }

  // Handle row click for line selection
  const handleRowClick = (rowIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentRow(rowIndex)
    const text = rowIndex === 0 ? row1 : row2
    setCursorPos(text.length) // Move cursor to end of clicked line
    setIsActive(true)
  }

  // Handle character click for precise cursor positioning
  const handleCharClick = (rowIndex: number, charIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentRow(rowIndex)

    // Limit cursor position to the actual text length, not the padded length
    const text = rowIndex === 0 ? row1 : row2
    const clampedPosition = Math.min(charIndex, text.length)
    setCursorPos(clampedPosition)
    setIsActive(true)
    displayRef.current?.focus()
  }

  // Render a single row with cursor and click handler
  const renderRow = (text: string, rowIndex: number) => {
    const paddedText = text.padEnd(16, " ")
    const showCursor = isActive && currentRow === rowIndex

    return (
      <div
        className="flex font-mono leading-none transition-colors duration-200 rounded-sm px-1"
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

          return (
            <span
              key={i}
              className={`
                inline-block text-center relative cursor-pointer
                ${isCursor ? "bg-green-400 text-black animate-pulse" : "text-green-400"}
                ${char === " " && !isCursor ? "bg-transparent" : ""}
                ${!isCursor ? "hover:bg-green-900/30" : ""} transition-colors duration-150
              `}
              onClick={(e) => handleCharClick(rowIndex, i, e)}
              style={{
                width: "20px",
                height: "24px",
                lineHeight: "24px",
                imageRendering: "pixelated",
                fontSmooth: "never",
                WebkitFontSmoothing: "none",
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
                <h4 className="font-bold text-center">LCD Screen</h4>
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
              {!row1 && !row2 && !isActive && (
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
                Total messages: {totalMessages}
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
