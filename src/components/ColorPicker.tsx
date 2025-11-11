import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'

const ColorPicker = ({ eventColors, selectedColor, onColorChange }:any) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-6 h-6 p-0 rounded-full border-2 border-white shadow-[0_0_0_1px_#ccc] hover:opacity-90"
          style={{ backgroundColor: selectedColor || eventColors[0] }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-5 gap-2">
          {eventColors.map((color:string, index:number) => (
            <DropdownMenuItem
              key={index}
              onClick={() => onColorChange(color)}
              className="p-0 h-auto cursor-pointer focus:bg-transparent"
            >
              <div
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  border: color === selectedColor 
                    ? "2px solid black" 
                    : "2px solid transparent",
                }}
              />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColorPicker