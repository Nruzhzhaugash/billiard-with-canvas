import React from 'react';

interface ColorPickerProps {
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onSelectColor }) => {
  const colors = ['red', 'green', 'blue', 'yellow', 'orange'];

  const handleColorSelect = (color: string) => {
    onSelectColor(color);
  };
// 
  return (
    <div className="color-picker">
      <span>Select Color: </span>
      {colors.map((color, index) => (
        <button key={index} style={{ backgroundColor: color }} onClick={() => handleColorSelect(color)} />
      ))}
    </div>
  );
};

export default ColorPicker;

