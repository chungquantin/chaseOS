"use client";

import { useState, useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { MDXContent } from "./mdx-content";

export type BlogPost = {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
  };
  slug: string;
  content: string;
};

interface WindowProps {
  post: BlogPost;
  onClose: () => void;
  onMinimize?: () => void;
  onRestore?: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

interface PaneArea {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "left" | "right" | "top" | "bottom" | "center";
}

export function Window({
  post,
  onClose,
  onMinimize,
  onRestore,
  initialPosition,
  initialSize,
}: WindowProps) {
  const [position, setPosition] = useState(
    initialPosition || { x: 100, y: 100 }
  );
  const [size, setSize] = useState(() => {
    const defaultSize = initialSize || { width: 800, height: 600 };
    return {
      width: Math.max(400, defaultSize.width),
      height: Math.max(300, defaultSize.height),
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === headerRef.current ||
      headerRef.current?.contains(e.target as Node)
    ) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)
        );
        const newY = Math.max(
          0,
          Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y)
        );

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setPosition({ x: newX, y: newY });
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const minWidth = 400;
        const minHeight = 300;
        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;
        let newY = position.y;

        switch (resizeDirection) {
          case "se": // bottom-right
            newWidth = Math.max(
              minWidth,
              Math.min(
                window.innerWidth - position.x,
                resizeStart.width + deltaX
              )
            );
            newHeight = Math.max(
              minHeight,
              Math.min(
                window.innerHeight - position.y,
                resizeStart.height + deltaY
              )
            );
            break;
          case "sw": // bottom-left
            newWidth = Math.max(
              minWidth,
              Math.min(position.x + size.width, resizeStart.width - deltaX)
            );
            newHeight = Math.max(
              minHeight,
              Math.min(
                window.innerHeight - position.y,
                resizeStart.height + deltaY
              )
            );
            // Ensure the window doesn't disappear by constraining the position
            newX = Math.max(
              0,
              Math.min(position.x + deltaX, position.x + size.width - minWidth)
            );
            break;
          case "ne": // top-right
            newWidth = Math.max(
              minWidth,
              Math.min(
                window.innerWidth - position.x,
                resizeStart.width + deltaX
              )
            );
            newHeight = Math.max(
              minHeight,
              Math.min(position.y + size.height, resizeStart.height - deltaY)
            );
            newY = Math.max(0, position.y + deltaY);
            break;
          case "nw": // top-left
            newWidth = Math.max(
              minWidth,
              Math.min(position.x + size.width, resizeStart.width - deltaX)
            );
            newHeight = Math.max(
              minHeight,
              Math.min(position.y + size.height, resizeStart.height - deltaY)
            );
            // Ensure the window doesn't disappear by constraining both positions
            newX = Math.max(
              0,
              Math.min(position.x + deltaX, position.x + size.width - minWidth)
            );
            newY = Math.max(
              0,
              Math.min(
                position.y + deltaY,
                position.y + size.height - minHeight
              )
            );
            break;
          case "e": // right border
            newWidth = Math.max(
              minWidth,
              Math.min(
                window.innerWidth - position.x,
                resizeStart.width + deltaX
              )
            );
            break;
          case "w": // left border
            newWidth = Math.max(
              minWidth,
              Math.min(position.x + size.width, resizeStart.width - deltaX)
            );
            // Ensure the window doesn't disappear by constraining the position
            newX = Math.max(
              0,
              Math.min(position.x + deltaX, position.x + size.width - minWidth)
            );
            break;
          case "s": // bottom border
            newHeight = Math.max(
              minHeight,
              Math.min(
                window.innerHeight - position.y,
                resizeStart.height + deltaY
              )
            );
            break;
          case "n": // top border
            newHeight = Math.max(
              minHeight,
              Math.min(position.y + size.height, resizeStart.height - deltaY)
            );
            // Ensure the window doesn't disappear by constraining the position
            newY = Math.max(
              0,
              Math.min(
                position.y + deltaY,
                position.y + size.height - minHeight
              )
            );
            break;
        }

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          // Final safety check to ensure minimum size
          const finalWidth = Math.max(minWidth, newWidth);
          const finalHeight = Math.max(minHeight, newHeight);

          setSize({ width: finalWidth, height: finalHeight });
          setPosition({ x: newX, y: newY });
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection("");
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp, {
        passive: false,
      });
      document.body.style.userSelect = "none";
      document.body.style.cursor = isDragging ? "grabbing" : "default";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeStart,
    position,
    size,
    resizeDirection,
  ]);

  const handleMaximize = () => {
    if (isMaximized) {
      setSize({ width: 800, height: 600 });
      setPosition({ x: 100, y: 100 });
    } else {
      setSize({
        width: window.innerWidth - 20,
        height: window.innerHeight - 20,
      });
      setPosition({ x: 10, y: 10 });
    }
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    }
  };

  return (
    <div
      ref={windowRef}
      className={`fixed overflow-hidden bg-black border border-gray-800 rounded-xl shadow-2xl window-transition z-50`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isMaximized ? 9999 : 50,
        willChange: isDragging || isResizing ? "transform" : "auto",
      }}
    >
      {/* Window Header */}
      <div
        ref={headerRef}
        className="bg-gray-900 px-4 py-2 rounded-t-lg cursor-move flex items-center justify-between border-b border-gray-800"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 bg-red-500 rounded-full cursor-pointer hover:bg-red-600"
            onClick={onClose}
          />
          <div
            className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-600"
            onClick={handleMinimize}
          />
          <div
            className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600"
            onClick={handleMaximize}
          />
        </div>
        <div className="text-sm font-medium text-white truncate max-w-xs">
          {post.metadata.title.length > 20
            ? post.metadata.title.slice(0, 20) + "..."
            : post.metadata.title}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16" />
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full overflow-hidden">
        <PanelGroup direction="vertical" className="h-full">
          <Panel defaultSize={100} minSize={30}>
            <div className="h-full overflow-auto p-6 bg-black">
              <div className="prose dark:prose-invert max-w-none overflow-hidden break-words">
                <h1 className="text-2xl font-bold mb-4 text-white">
                  {post.metadata.title}
                </h1>
                <div className="text-sm text-gray-300 mb-6">
                  {new Date(post.metadata.publishedAt).toLocaleDateString()}
                </div>
                <div className="overflow-hidden break-words">
                  <MDXContent content={post.content} />
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Resize Handles - All Corners and Borders */}
      <>
        {/* Corner handles */}
        {/* Bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "se")}
        ></div>

        {/* Bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
        ></div>

        {/* Top-right */}
        <div
          className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
        ></div>

        {/* Top-left */}
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
        ></div>

        {/* Border handles */}
        {/* Right border */}
        <div
          className="absolute top-4 right-0 w-1 h-full cursor-e-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "e")}
        />

        {/* Left border */}
        <div
          className="absolute top-4 left-0 w-1 h-full cursor-w-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "w")}
        />

        {/* Bottom border */}
        <div
          className="absolute bottom-0 left-4 w-full h-1 cursor-s-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "s")}
        />

        {/* Top border */}
        <div
          className="absolute top-0 left-4 w-full h-1 cursor-n-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "n")}
        />
      </>
    </div>
  );
}
