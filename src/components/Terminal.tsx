import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  onCommand: (command: string) => void;
  lines: TerminalLine[];
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, lines }) => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      onCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">WiFi Messenger CLI</div>
        <div className="terminal-controls">
          <span className="control-btn close"></span>
          <span className="control-btn minimize"></span>
          <span className="control-btn maximize"></span>
        </div>
      </div>
      <div className="terminal-body" ref={terminalRef}>
        <div className="terminal-content">
          {lines.map((line) => (
            <div key={line.id} className={`terminal-line ${line.type}`}>
              <span className="timestamp">[{formatTime(line.timestamp)}]</span>
              <span className="content">
                {line.type === 'input' && '$ '}
                {line.content}
              </span>
            </div>
          ))}
          <form onSubmit={handleSubmit} className="terminal-input-form">
            <div className="input-line">
              <span className="prompt">$ </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                placeholder="Type a command..."
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;