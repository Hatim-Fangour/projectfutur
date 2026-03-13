// @ts-nocheck
"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const TreatmentCarousel = ({ session }:any) => {
     const [currentIndex, setCurrentIndex] = useState(0)

  const carouselImages = [
    {
      url: session.beforeImage || "/placeholder.svg?height=400&width=600",
      label: "BEFORE",
      step: 0,
      total: session.duringImages?.length || 0 + 2,
      type: "before",
    },
    ...(session.duringImages || []).map((img, idx) => ({
      url: img.url || "/placeholder.svg?height=400&width=600",
      label: `STEP ${idx + 1}`,
      step: idx + 1,
      total: (session.duringImages?.length || 0) + 2,
      caption: img.caption,
      timestamp: img.timestamp,
      type: "during",
    })),
    {
      url: session.afterImage || "/placeholder.svg?height=400&width=600",
      label: "AFTER",
      step: (session.duringImages?.length || 0) + 1,
      total: (session.duringImages?.length || 0) + 2,
      type: "after",
    },
  ]

  const currentImage = carouselImages[currentIndex] || carouselImages[0]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }
  return (
    <div className="space-y-">
      {/* Main Carousel Display */}
      <div className="relative overflow-hidden rounded-lg bg-muted/50 border border-border">
        {/* Image Container */}
        <div className="relative w-full" style={{ aspectRatio: "2/1" }}>
          <img
            src={currentImage.url || "/placeholder.svg"}
            alt={currentImage.label}
            className="w-full h-full object-cover"
          />

          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-foreground">
            {currentImage.step} / {currentImage.total}
          </div>

          {/* Label Badge */}
          <div
            className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-sm ${
              currentImage.type === "before"
                ? "bg-blue-500/80"
                : currentImage.type === "after"
                  ? "bg-emerald-500/80"
                  : "bg-amber-500/80"
            }`}
          >
            {currentImage.label}
          </div>

          {/* Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-foreground">
              {currentImage.caption}
              {currentImage.timestamp && <span className="ml-2 text-muted-foreground">({currentImage.timestamp})</span>}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background p-2 rounded-full transition-all hover:scale-110 border border-border/50"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background p-2 rounded-full transition-all hover:scale-110 border border-border/50"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="overflow-x-auto mt-2">
        <div className="flex gap-2 pb-2">
          {carouselImages.map((image, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`flex-shrink-0 relative h-20 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-accent ring-2 ring-accent/50 scale-105"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <img
                src={image.url || "/placeholder.svg"}
                alt={`Thumbnail ${idx}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                    image.type === "before"
                      ? "bg-blue-500/80"
                      : image.type === "after"
                        ? "bg-emerald-500/80"
                        : "bg-amber-500/80"
                  }`}
                >
                  {image.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Details */}
      {/* <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">Current Stage</h3>
        <p className="text-sm text-muted-foreground">
          {currentImage.type === "before" && "Initial state before treatment begins"}
          {currentImage.type === "during" && `Treatment in progress - ${currentImage.caption || "Step completed"}`}
          {currentImage.type === "after" && "Final result after complete treatment"}
        </p>
      </div> */}
    </div>
  )
}

export default TreatmentCarousel