declare module 'react-canvas-draw' {
  import { Component } from 'react';

  export interface CanvasDrawProps {
    onChange?: ((canvas: CanvasDraw) => void) | null;
    loadTimeOffset?: number;
    lazyRadius?: number;
    brushRadius?: number;
    brushColor?: string;
    catenaryColor?: string;
    gridColor?: string;
    backgroundColor?: string;
    hideGrid?: boolean;
    canvasWidth?: number | string;
    canvasHeight?: number | string;
    disabled?: boolean;
    imgSrc?: string;
    saveData?: string;
    immediateLoading?: boolean;
    hideInterface?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }

  export default class CanvasDraw extends Component<CanvasDrawProps> {
    undo(): void;
    clear(): void;
    getSaveData(): string;
    loadSaveData(saveData: string, immediate?: boolean): void;
  }
}
