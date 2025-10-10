"use client";

import { useState, useEffect } from "react";
import Terminal, { ColorMode, TerminalOutput } from "react-terminal-ui";
import { BaseWindow } from "./base-window";
import { apps } from "./app-registry";

interface TerminalWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onOpenApp?: (appId: string) => void;
  onOpenFinder?: (finderType: string) => void;
  onOpenTaskManager?: () => void;
  onCloseWindow?: (windowId: string) => void;
  onMinimizeWindow?: (windowId: string) => void;
  onRestoreWindow?: (windowId: string) => void;
  windows?: Array<{
    id: string;
    post?: { metadata: { title: string } };
    companyId?: string;
    finderType?: string;
    isMinimized: boolean;
    startTime?: number;
  }>;
}

export function TerminalWindow({
  onClose,
  onMinimize,
  onRestore,
  onFocus,
  zIndex,
  initialPosition = { x: 200, y: 200 },
  initialSize = { width: 800, height: 600 },
  onOpenApp,
  onOpenFinder,
  onOpenTaskManager,
  onCloseWindow,
  onMinimizeWindow,
  onRestoreWindow,
  windows = [],
}: TerminalWindowProps) {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>Welcome to ChaseOS Terminal!</TerminalOutput>,
    <TerminalOutput>Type 'help' for available commands.</TerminalOutput>,
  ]);

  const [currentDirectory, setCurrentDirectory] = useState("/");

  const addOutput = (output: React.ReactNode) => {
    setTerminalLineData((prev) => [...prev, output]);
  };

  const executeCommand = (input: string) => {
    const command = input.trim().toLowerCase();
    const parts = input.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        addOutput(
          <TerminalOutput>
            <div className="text-green-400 font-bold">Available Commands:</div>
            <div className="ml-2">
              <div>
                • <span className="text-blue-400">help</span> - Show this help
                message
              </div>
              <div>
                • <span className="text-blue-400">ls</span> - List directory
                contents
              </div>
              <div>
                • <span className="text-blue-400">cd</span> &lt;directory&gt; -
                Change directory
              </div>
              <div>
                • <span className="text-blue-400">pwd</span> - Print working
                directory
              </div>
              <div>
                • <span className="text-blue-400">open</span> &lt;app&gt; - Open
                an application
              </div>
              <div>
                • <span className="text-blue-400">apps</span> - List available
                applications
              </div>
              <div>
                • <span className="text-blue-400">ps</span> - Show running
                processes
              </div>
              <div>
                • <span className="text-blue-400">kill</span> &lt;process_id&gt;
                - Close a process
              </div>
              <div>
                • <span className="text-blue-400">clear</span> - Clear terminal
              </div>
            </div>
          </TerminalOutput>
        );
        break;

      case "ls":
        if (currentDirectory === "/") {
          addOutput(
            <TerminalOutput>
              <div className="text-blue-400">apps/</div>
              <div className="text-green-400">Documents/</div>
              <div className="text-green-400">Downloads/</div>
              <div className="text-green-400">Desktop/</div>
            </TerminalOutput>
          );
        } else if (currentDirectory === "/apps") {
          addOutput(
            <TerminalOutput>
              {apps.map((app) => (
                <div key={app.id} className="text-blue-400">
                  {app.name}/
                </div>
              ))}
            </TerminalOutput>
          );
        } else {
          addOutput(<TerminalOutput>Directory not found</TerminalOutput>);
        }
        break;

      case "cd":
        const targetDir = args[0];
        if (!targetDir) {
          addOutput(
            <TerminalOutput>Usage: cd &lt;directory&gt;</TerminalOutput>
          );
        } else if (targetDir === "/") {
          setCurrentDirectory("/");
          addOutput(<TerminalOutput>Changed to root directory</TerminalOutput>);
        } else if (targetDir === "apps" && currentDirectory === "/") {
          setCurrentDirectory("/apps");
          addOutput(
            <TerminalOutput>Changed to /apps directory</TerminalOutput>
          );
        } else if (targetDir === "..") {
          if (currentDirectory === "/apps") {
            setCurrentDirectory("/");
            addOutput(
              <TerminalOutput>Changed to root directory</TerminalOutput>
            );
          } else {
            addOutput(
              <TerminalOutput>Already at root directory</TerminalOutput>
            );
          }
        } else {
          addOutput(
            <TerminalOutput>Directory not found: {targetDir}</TerminalOutput>
          );
        }
        break;

      case "pwd":
        addOutput(<TerminalOutput>{currentDirectory}</TerminalOutput>);
        break;

      case "open":
        const appName = args[0];
        if (!appName) {
          addOutput(<TerminalOutput>Usage: open &lt;app&gt;</TerminalOutput>);
        } else {
          const app = apps.find(
            (a) => a.name.toLowerCase() === appName.toLowerCase()
          );
          if (app) {
            if (app.type === "finder") {
              onOpenFinder?.(app.finderType!);
              addOutput(<TerminalOutput>Opening {app.name}...</TerminalOutput>);
            } else {
              onOpenApp?.(app.id);
              addOutput(<TerminalOutput>Opening {app.name}...</TerminalOutput>);
            }
          } else {
            addOutput(
              <TerminalOutput>App not found: {appName}</TerminalOutput>
            );
          }
        }
        break;

      case "apps":
        addOutput(
          <TerminalOutput>
            <div className="text-green-400 font-bold">
              Available Applications:
            </div>
            {apps.map((app) => (
              <div key={app.id} className="ml-2">
                • <span className="text-blue-400">{app.name}</span> -{" "}
                {app.description}
              </div>
            ))}
          </TerminalOutput>
        );
        break;

      case "ps":
        if (windows.length === 0) {
          addOutput(<TerminalOutput>No processes running</TerminalOutput>);
        } else {
          addOutput(
            <TerminalOutput>
              <div className="text-green-400 font-bold">Running Processes:</div>
              {windows.map((window, index) => {
                let name = "Unknown Process";
                if (window.post) {
                  name = window.post.metadata.title;
                } else if (window.companyId) {
                  name = `Company: ${window.companyId}`;
                } else if (window.finderType) {
                  name = `Finder: ${window.finderType}`;
                }
                return (
                  <div key={window.id} className="ml-2">
                    {index + 1}. <span className="text-blue-400">{name}</span>{" "}
                    (PID: {window.id})
                  </div>
                );
              })}
            </TerminalOutput>
          );
        }
        break;

      case "kill":
        const processId = args[0];
        if (!processId) {
          addOutput(
            <TerminalOutput>Usage: kill &lt;process_id&gt;</TerminalOutput>
          );
        } else {
          const window = windows.find((w) => w.id === processId);
          if (window) {
            onCloseWindow?.(processId);
            addOutput(
              <TerminalOutput>Process {processId} terminated</TerminalOutput>
            );
          } else {
            addOutput(
              <TerminalOutput>Process not found: {processId}</TerminalOutput>
            );
          }
        }
        break;

      case "clear":
        setTerminalLineData([
          <TerminalOutput>Welcome to ChaseOS Terminal!</TerminalOutput>,
          <TerminalOutput>Type 'help' for available commands.</TerminalOutput>,
        ]);
        break;

      case "taskmanager":
        onOpenTaskManager?.();
        addOutput(<TerminalOutput>Opening Task Manager...</TerminalOutput>);
        break;

      default:
        addOutput(
          <TerminalOutput>
            Command not found: {command}. Type 'help' for available commands.
          </TerminalOutput>
        );
    }
  };

  return (
    <BaseWindow
      title="Terminal"
      onClose={onClose}
      onMinimize={onMinimize}
      onRestore={onRestore}
      onFocus={onFocus}
      zIndex={zIndex}
      initialPosition={initialPosition}
      initialSize={initialSize}
    >
      <div className="h-full w-full flex flex-col">
        {/* Terminal Header */}
        <div
          className="px-4 py-2 flex items-center justify-between border-b flex-shrink-0"
          style={{
            backgroundColor: "#161b22",
            borderBottom: "1px solid #21262d",
          }}
        >
          <div className="flex items-center space-x-2">
            <div
              className="text-sm font-medium font-sf-pro"
              style={{ color: "#f0f6fc" }}
            >
              ChaseOS Terminal
            </div>
            <div className="text-xs font-sf-pro" style={{ color: "#8b949e" }}>
              v1.0.0
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs font-sf-pro" style={{ color: "#8b949e" }}>
              Connected
            </div>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#3fb950" }}
            />
          </div>
        </div>

        {/* Terminal Content */}
        <div
          className="flex-1 overflow-hidden"
          style={{ backgroundColor: "#0d1117" }}
        >
          <Terminal
            name="ChaseOS Terminal"
            colorMode={ColorMode.Dark}
            onInput={executeCommand}
            height="100%"
            prompt="chaseos@terminal:~$ "
          >
            {terminalLineData}
          </Terminal>
        </div>

        {/* Terminal Footer */}
        <div
          className="px-4 py-2 border-t flex items-center justify-between text-xs font-sf-pro flex-shrink-0"
          style={{
            backgroundColor: "#161b22",
            borderColor: "#21262d",
            color: "#8b949e",
          }}
        >
          <div className="flex items-center space-x-4">
            <span>Directory: {currentDirectory}</span>
            <span>Commands: {terminalLineData.length}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>ChaseOS Terminal</span>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </BaseWindow>
  );
}
