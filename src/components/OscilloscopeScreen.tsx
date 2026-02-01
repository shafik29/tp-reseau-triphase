import { useEffect, useRef } from 'react';
import { TimeDivision, VoltDivision, TimeCursorSettings, VoltCursorSettings, TriggerSettings } from '../types/oscilloscope';
import { TerminalType } from '../types/generator';

interface OscilloscopeScreenProps {
  width: number;
  height: number;
  timeDiv: TimeDivision;
  voltDiv: VoltDivision;
  yPos: number;
  channels: {
    CH1: { enabled: boolean; terminal1: TerminalType | null; terminal2: TerminalType | null };
    CH2: { enabled: boolean; terminal1: TerminalType | null; terminal2: TerminalType | null };
    CH3: { enabled: boolean; terminal1: TerminalType | null; terminal2: TerminalType | null };
  };
  frequency: number;
  amplitude: number;
  isOn: boolean;
  timeCursors: TimeCursorSettings;
  voltCursors: VoltCursorSettings;
  trigger: TriggerSettings;
  deltaT: number;
  deltaV: number;
  onTimeCursorChange?: (t1: number, t2: number) => void;
  onVoltCursorChange?: (v1: number, v2: number) => void;
}

export function OscilloscopeScreen({
  width,
  height,
  timeDiv,
  voltDiv,
  yPos,
  channels,
  frequency,
  amplitude,
  isOn,
  timeCursors,
  voltCursors,
  trigger,
  deltaT,
  deltaV,
  onTimeCursorChange,
  onVoltCursorChange
}: OscilloscopeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const triggerTimeRef = useRef<number>(0);
  const dragRef = useRef<{ type: 'time' | 'volt' | null; cursor: '1' | '2' | null }>({ type: null, cursor: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      drawGrid(ctx);

      if (isOn && amplitude > 0) {
        drawWaveforms(ctx);
      }

      if (timeCursors.enabled) {
        drawTimeCursors(ctx);
      }

      if (voltCursors.enabled) {
        drawVoltCursors(ctx);
      }

      if (trigger.enabled) {
        drawTriggerLevel(ctx);
      }

      drawMeasurements(ctx);

      if (!trigger.enabled) {
        timeRef.current += 0.016;
      } else {
        updateTrigger();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;

      const divs = 10;
      const divWidth = width / divs;
      const divHeight = height / divs;

      for (let i = 0; i <= divs; i++) {
        ctx.beginPath();
        ctx.moveTo(i * divWidth, 0);
        ctx.lineTo(i * divWidth, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * divHeight);
        ctx.lineTo(width, i * divHeight);
        ctx.stroke();
      }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
    };

    const updateTrigger = () => {
      const omega = 2 * Math.PI * frequency;
      const vMax = amplitude * Math.sqrt(2);

      let phaseShift = 0;
      if (trigger.channel === 'CH2') phaseShift = -2 * Math.PI / 3;
      if (trigger.channel === 'CH3') phaseShift = -4 * Math.PI / 3;

      const currentTime = Date.now() / 1000;
      const v = vMax * Math.sin(omega * currentTime + phaseShift);
      const prevV = vMax * Math.sin(omega * (currentTime - 0.016) + phaseShift);

      if (prevV < trigger.level && v >= trigger.level) {
        triggerTimeRef.current = currentTime;
      }

      timeRef.current = triggerTimeRef.current;
    };

    const getTerminalVoltage = (terminal: TerminalType | null, t: number): number => {
      if (!terminal) return 0;
      if (terminal === 'N') return 0;

      const omega = 2 * Math.PI * frequency;
      const vMax = amplitude * Math.sqrt(2);

      let phaseShift = 0;
      if (terminal === 'Ph2') phaseShift = -2 * Math.PI / 3;
      if (terminal === 'Ph3') phaseShift = -4 * Math.PI / 3;

      return vMax * Math.sin(omega * t + phaseShift);
    };

    const drawWaveforms = (ctx: CanvasRenderingContext2D) => {
      const totalTime = timeDiv * 10;
      const samplesPerDiv = 100;
      const totalSamples = samplesPerDiv * 10;

      const drawChannel = (
        terminal1: TerminalType | null,
        terminal2: TerminalType | null,
        color: string
      ) => {
        if (!terminal1 || !terminal2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        let firstPoint = true;

        for (let i = 0; i < totalSamples; i++) {
          const t = (i / totalSamples) * totalTime / 1000;
          const tWithAnimation = t + timeRef.current;

          const v1 = getTerminalVoltage(terminal1, tWithAnimation);
          const v2 = getTerminalVoltage(terminal2, tWithAnimation);
          const v = v1 - v2;

          const x = (i / totalSamples) * width;
          const y = height / 2 - (v / voltDiv) * (height / 10) + yPos;

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      };

      if (channels.CH1.enabled) {
        drawChannel(channels.CH1.terminal1, channels.CH1.terminal2, '#ef4444');
      }

      if (channels.CH2.enabled) {
        drawChannel(channels.CH2.terminal1, channels.CH2.terminal2, '#3b82f6');
      }

      if (channels.CH3.enabled) {
        drawChannel(channels.CH3.terminal1, channels.CH3.terminal2, '#22c55e');
      }
    };

    const drawTimeCursors = (ctx: CanvasRenderingContext2D) => {
      const totalTime = timeDiv * 10;

      const x1 = (timeCursors.t1 / totalTime) * width;
      const x2 = (timeCursors.t2 / totalTime) * width;

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, 0);
      ctx.lineTo(x2, height);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px monospace';
      ctx.fillText('t1', x1 + 5, 15);
      ctx.fillText('t2', x2 + 5, 15);
    };

    const drawVoltCursors = (ctx: CanvasRenderingContext2D) => {
      const y1 = height / 2 - (voltCursors.v1 / voltDiv) * (height / 10) + yPos;
      const y2 = height / 2 - (voltCursors.v2 / voltDiv) * (height / 10) + yPos;

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(width, y1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y2);
      ctx.lineTo(width, y2);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = '#06b6d4';
      ctx.font = '12px monospace';
      ctx.fillText(`v1 (${voltCursors.v1.toFixed(1)}V)`, 5, y1 - 5);
      ctx.fillText(`v2 (${voltCursors.v2.toFixed(1)}V)`, 5, y2 - 5);
    };

    const drawTriggerLevel = (ctx: CanvasRenderingContext2D) => {
      const y = height / 2 - (trigger.level / voltDiv) * (height / 10) + yPos;

      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = '#f97316';
      ctx.font = '12px monospace';
      ctx.fillText(`TRIG: ${trigger.level.toFixed(1)}V`, width - 100, y - 5);

      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(20, y - 5);
      ctx.lineTo(20, y + 5);
      ctx.closePath();
      ctx.fillStyle = '#f97316';
      ctx.fill();
    };

    const drawMeasurements = (ctx: CanvasRenderingContext2D) => {
      let yOffset = 20;

      if (timeCursors.enabled) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`Δt = ${deltaT.toFixed(2)} ms`, 10, yOffset);
        yOffset += 25;
      }

      if (voltCursors.enabled) {
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`ΔV = ${deltaV.toFixed(2)} V`, 10, yOffset);
        yOffset += 25;
      }

      if (timeCursors.enabled || voltCursors.enabled) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('Calcul : φ = 2π·Δt / T', 10, yOffset);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, timeDiv, voltDiv, yPos, channels, frequency, amplitude, isOn, timeCursors, voltCursors, trigger, deltaT, deltaV]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (timeCursors.enabled) {
      const totalTime = timeDiv * 10;
      const x1 = (timeCursors.t1 / totalTime) * width;
      const x2 = (timeCursors.t2 / totalTime) * width;

      if (Math.abs(x - x1) < 10) {
        dragRef.current = { type: 'time', cursor: '1' };
        return;
      } else if (Math.abs(x - x2) < 10) {
        dragRef.current = { type: 'time', cursor: '2' };
        return;
      }
    }

    if (voltCursors.enabled) {
      const y1 = height / 2 - (voltCursors.v1 / voltDiv) * (height / 10) + yPos;
      const y2 = height / 2 - (voltCursors.v2 / voltDiv) * (height / 10) + yPos;

      if (Math.abs(y - y1) < 10) {
        dragRef.current = { type: 'volt', cursor: '1' };
        return;
      } else if (Math.abs(y - y2) < 10) {
        dragRef.current = { type: 'volt', cursor: '2' };
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.type || !dragRef.current.cursor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragRef.current.type === 'time' && onTimeCursorChange) {
      const totalTime = timeDiv * 10;
      const newTime = Math.max(0, Math.min(totalTime, (x / width) * totalTime));

      if (dragRef.current.cursor === '1') {
        onTimeCursorChange(newTime, timeCursors.t2);
      } else {
        onTimeCursorChange(timeCursors.t1, newTime);
      }
    } else if (dragRef.current.type === 'volt' && onVoltCursorChange) {
      const newVolt = ((height / 2 - y - yPos) / (height / 10)) * voltDiv;
      const clampedVolt = Math.max(-voltDiv * 5, Math.min(voltDiv * 5, newVolt));

      if (dragRef.current.cursor === '1') {
        onVoltCursorChange(clampedVolt, voltCursors.v2);
      } else {
        onVoltCursorChange(voltCursors.v1, clampedVolt);
      }
    }
  };

  const handleMouseUp = () => {
    dragRef.current = { type: null, cursor: null };
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="bg-slate-950 rounded-lg cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
