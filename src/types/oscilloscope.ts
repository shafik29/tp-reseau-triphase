export type ChannelType = 'CH1' | 'CH2' | 'CH3';

export interface Channel {
  id: ChannelType;
  label: string;
  color: string;
  enabled: boolean;
}

export type TimeDivision = 1 | 2 | 5 | 10;
export type VoltDivision = 1 | 2 | 5 | 10;

export interface OscilloscopeSettings {
  timeDiv: TimeDivision;
  voltDiv: VoltDivision;
  yPos: number;
}

export interface TimeCursorSettings {
  enabled: boolean;
  t1: number;
  t2: number;
}

export interface VoltCursorSettings {
  enabled: boolean;
  v1: number;
  v2: number;
}

export interface TriggerSettings {
  enabled: boolean;
  level: number;
  channel: ChannelType;
}

export interface Measurements {
  period: number | null;
  deltaT: number | null;
  phase: number | null;
}
