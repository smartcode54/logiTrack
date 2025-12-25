"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageViewerProps {
  imageSrc: string | string[];
  onClose: () => void;
  alt?: string;
  initialIndex?: number;
}

export const ImageViewer = ({ imageSrc, onClose, alt = "Image", initialIndex = 0 }: ImageViewerProps) => {
  const images = Array.isArray(imageSrc) ? imageSrc : [imageSrc];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const currentImage = images[currentIndex];

  useEffect(() => {
    // Reset scale และ position เมื่อเปลี่ยนภาพ
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setSwipeOffset(0);
  }, [currentIndex]);

  useEffect(() => {
    // Set initial index when imageSrc changes
    if (Array.isArray(imageSrc) && initialIndex >= 0 && initialIndex < imageSrc.length) {
      setCurrentIndex(initialIndex);
    }
  }, [imageSrc, initialIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (scale > 1) {
        // Zoom mode - drag image
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      } else {
        // Normal mode - swipe between images
        setSwipeStart({ x: touch.clientX, y: touch.clientY });
        setSwipeOffset(0);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (isDragging && scale > 1) {
        // Zoom mode - drag image
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      } else if (swipeStart && scale === 1) {
        // Normal mode - swipe between images
        const deltaX = touch.clientX - swipeStart.x;
        const deltaY = touch.clientY - swipeStart.y;

        // Only allow horizontal swipe if it's more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setSwipeOffset(deltaX);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
    } else if (swipeStart && scale === 1) {
      // Check if swipe was significant enough to change image
      const threshold = 50;
      if (swipeOffset > threshold && currentIndex > 0) {
        goToPrevious();
      } else if (swipeOffset < -threshold && currentIndex < images.length - 1) {
        goToNext();
      }
      setSwipeStart(null);
      setSwipeOffset(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-black/50">
        <h3 className="text-white font-black uppercase">ดูภาพ {images.length > 1 && `(${currentIndex + 1}/${images.length})`}</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={goToNext}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          )}
        </>
      )}

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4 relative">
        <div
          className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
          style={{
            transform:
              scale === 1 && swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging || swipeOffset !== 0 ? "none" : "transform 0.2s",
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${alt} ${index + 1}`}
              className={`max-w-full max-h-full object-contain ${index === currentIndex ? "block" : "hidden"}`}
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center items-center gap-4 p-4 bg-black/50">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className={`p-3 rounded-full ${
            scale <= 0.5 ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20"
          } transition-colors`}
        >
          <ZoomOut size={24} />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-black text-sm"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className={`p-3 rounded-full ${
            scale >= 3 ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20"
          } transition-colors`}
        >
          <ZoomIn size={24} />
        </button>
      </div>
    </div>
  );
};
