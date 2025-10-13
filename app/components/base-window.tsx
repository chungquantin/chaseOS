"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2 } from "lucide-react";

interface BaseWindowProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  zIndex?: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function BaseWindow({
  title,
  children,
  onClose,
  onMinimize,
  onRestore,
  onFocus,
  onPositionChange,
  onSizeChange,
  zIndex = 50,
  initialPosition = { x: 200, y: 200 },
  initialSize = { width: 800, height: 600 },
}: BaseWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(() => {
    const defaultSize = initialSize;
    return {
      width: Math.max(400, defaultSize.width),
      height: Math.max(300, defaultSize.height),
    };
  });

  // Notify parent when position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [position]);

  // Notify parent when size changes
  useEffect(() => {
    if (onSizeChange) {
      onSizeChange(size);
    }
  }, [size]);
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

  // Handle close with animation
  const handleClose = () => {
    console.log("handleClose called, onClose:", !!onClose);
    onClose();
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on window control buttons
    const target = e.target as HTMLElement;
    if (
      target.classList.contains("cursor-pointer") ||
      target.closest(".cursor-pointer")
    ) {
      return;
    }

    // Only start dragging if clicking on the header area
    if (!headerRef.current?.contains(e.target as Node)) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    requestAnimationFrame(() => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep window within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
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

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    requestAnimationFrame(() => {
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
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
          break;
        case "sw": // bottom-left
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
          newX = Math.min(
            position.x + resizeStart.width - minWidth,
            position.x + resizeStart.width - newWidth
          );
          break;
        case "ne": // top-right
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newY = Math.min(
            position.y + resizeStart.height - minHeight,
            position.y + resizeStart.height - newHeight
          );
          break;
        case "nw": // top-left
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newX = Math.min(
            position.x + resizeStart.width - minWidth,
            position.x + resizeStart.width - newWidth
          );
          newY = Math.min(
            position.y + resizeStart.height - minHeight,
            position.y + resizeStart.height - newHeight
          );
          break;
        case "e": // right border
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
          break;
        case "w": // left border
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          newX = Math.min(
            position.x + resizeStart.width - minWidth,
            position.x + resizeStart.width - newWidth
          );
          break;
        case "s": // bottom border
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
          break;
        case "n": // top border
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newY = Math.min(
            position.y + resizeStart.height - minHeight,
            position.y + resizeStart.height - newHeight
          );
          break;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    });
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    setResizeDirection("");
  };

  // Maximize functionality
  const handleMaximize = () => {
    if (isMaximized) {
      // Restore to previous size
      setSize({ width: 800, height: 600 });
      setPosition({ x: 200, y: 200 });
    } else {
      // Maximize
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    console.log("handleMinimize called, onMinimize:", !!onMinimize);
    if (onMinimize) {
      onMinimize();
    }
  };

  const handleRestore = () => {
    console.log("handleRestore called, onRestore:", !!onRestore);
    if (onRestore) {
      onRestore();
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleResizeMouseUp);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleResizeMouseMove);
        document.removeEventListener("mouseup", handleResizeMouseUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, resizeDirection, resizeStart]);

  return (
    <motion.div
      ref={windowRef}
      className="fixed overflow-hidden rounded-xl shadow-2xl z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isMaximized ? 9999 : zIndex,
        willChange: isDragging || isResizing ? "transform" : "auto",
        backgroundColor: "#0d1117",
        border: "1px solid #21262d",
      }}
      initial={{
        opacity: 0,
        y: 50,
        rotateX: -15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotateX: 0,
      }}
      exit={{
        opacity: 0,
        y: 20,
        rotateX: 10,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        duration: 0.4,
      }}
      whileHover={{
        transition: { duration: 0.2 },
      }}
      whileTap={{
        transition: { duration: 0.1 },
      }}
      onClick={() => onFocus?.()}
    >
      {/* Window Header */}
      <div
        ref={headerRef}
        className="px-4 py-2 rounded-t-lg cursor-move flex items-center justify-between"
        style={{
          backgroundColor: "#161b22",
          borderBottom: "1px solid #21262d",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 bg-red-500 rounded-full cursor-pointer transition-all duration-150 hover:bg-red-600 hover:scale-110 flex items-center justify-center"
            onClick={(e) => {
              console.log("Close button clicked");
              e.stopPropagation();
              handleClose();
            }}
            style={{
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <X
              size={8}
              className="text-red-900 opacity-0 hover:opacity-100 transition-opacity"
            />
          </div>
          <div
            className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer transition-all duration-150 hover:bg-yellow-600 hover:scale-110 flex items-center justify-center"
            onClick={(e) => {
              console.log("Minimize button clicked");
              e.stopPropagation();
              handleMinimize();
            }}
            style={{
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <Minimize2
              size={8}
              className="text-yellow-900 opacity-0 hover:opacity-100 transition-opacity"
            />
          </div>
          <div
            className="w-3 h-3 bg-green-500 rounded-full cursor-pointer transition-all duration-150 hover:bg-green-600 hover:scale-110 flex items-center justify-center"
            onClick={(e) => {
              console.log("Maximize button clicked");
              e.stopPropagation();
              handleMaximize();
            }}
            style={{
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <Maximize2
              size={8}
              className="text-green-900 opacity-0 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
        <div
          className="text-sm font-medium font-sf-pro truncate max-w-xs"
          style={{ color: "#f0f6fc" }}
        >
          {title}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16" />
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full overflow-hidden">
        <motion.div
          className="h-full overflow-auto"
          style={{ backgroundColor: "#0d1117" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          {children}
        </motion.div>
      </div>

      {/* Resize Handles - All Corners and Borders */}
      <>
        {/* Corner handles */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "se")}
        />
        <div
          className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
        />
        <div
          className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
        />
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
        />

        {/* Border handles */}
        <div
          className="absolute top-4 right-0 w-1 h-full cursor-e-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "e")}
        />
        <div
          className="absolute top-4 left-0 w-1 h-full cursor-w-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "w")}
        />
        <div
          className="absolute bottom-0 left-4 w-full h-1 cursor-s-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "s")}
        />
        <div
          className="absolute top-0 left-4 w-full h-1 cursor-n-resize"
          onMouseDown={(e) => handleResizeMouseDown(e, "n")}
        />
      </>
    </motion.div>
  );
}
