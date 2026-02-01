import { useState } from 'react';
import { OscilloscopeScreen } from './OscilloscopeScreen';
import { OscilloscopeControls } from './OscilloscopeControls';
import { OscilloscopeChannels } from './OscilloscopeChannels';
import { TimeDivision, VoltDivision, ChannelType } from '../types/oscilloscope';
import { TerminalType } from '../types/generator';
import { ConnectionColor } from './ConnectionButton';

interface OscilloscopeProps {
  channelConnections: {
    CH1: { terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
    CH2: { terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
    CH3: { terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
  };
  selectedChannel: ChannelType | null;
  onChannelClick: (channel: ChannelType) => void;
  debugMode: boolean;
  generatorAmplitude: number;
  generatorFrequency: number;
  generatorIsOn: boolean;
}

export function Oscilloscope({
  channelConnections,
  selectedChannel,
  onChannelClick,
  debugMode,
  generatorAmplitude,
  generatorFrequency,
  generatorIsOn
}: OscilloscopeProps) {
  const [timeDiv, setTimeDiv] = useState<TimeDivision>(5);
  const [voltDiv, setVoltDiv] = useState<VoltDivision>(5);
  const [yPos, setYPos] = useState<number>(0);

  const [timeCursorsEnabled, setTimeCursorsEnabled] = useState<boolean>(false);
  const [cursorT1, setCursorT1] = useState<number>(20);
  const [cursorT2, setCursorT2] = useState<number>(40);

  const [voltCursorsEnabled, setVoltCursorsEnabled] = useState<boolean>(false);
  const [cursorV1, setCursorV1] = useState<number>(5);
  const [cursorV2, setCursorV2] = useState<number>(-5);

  const [triggerEnabled, setTriggerEnabled] = useState<boolean>(false);
  const [triggerLevel, setTriggerLevel] = useState<number>(0);
  const [triggerChannel, setTriggerChannel] = useState<ChannelType>('CH1');

  const [channels, setChannels] = useState({
    CH1: { enabled: true },
    CH2: { enabled: true },
    CH3: { enabled: true }
  });

  const handleChannelToggle = (channel: ChannelType) => {
    setChannels(prev => ({
      ...prev,
      [channel]: { enabled: !prev[channel].enabled }
    }));
  };

  const handleResetTimeCursors = () => {
    const totalTime = timeDiv * 10;
    setCursorT1(totalTime * 0.2);
    setCursorT2(totalTime * 0.5);
  };

  const handleResetVoltCursors = () => {
    setCursorV1(voltDiv * 2);
    setCursorV2(-voltDiv * 2);
  };

  const handleTimeCursorChange = (t1: number, t2: number) => {
    setCursorT1(t1);
    setCursorT2(t2);
  };

  const handleVoltCursorChange = (v1: number, v2: number) => {
    setCursorV1(v1);
    setCursorV2(v2);
  };

  const deltaT = Math.abs(cursorT2 - cursorT1);
  const deltaV = Math.abs(cursorV2 - cursorV1);

  const screenChannels = {
    CH1: {
      enabled: channels.CH1.enabled,
      terminal1: channelConnections.CH1.terminal1,
      terminal2: channelConnections.CH1.terminal2
    },
    CH2: {
      enabled: channels.CH2.enabled,
      terminal1: channelConnections.CH2.terminal1,
      terminal2: channelConnections.CH2.terminal2
    },
    CH3: {
      enabled: channels.CH3.enabled,
      terminal1: channelConnections.CH3.terminal1,
      terminal2: channelConnections.CH3.terminal2
    }
  };

  const displayChannels = {
    CH1: {
      enabled: channels.CH1.enabled,
      terminal1: channelConnections.CH1.terminal1,
      terminal2: channelConnections.CH1.terminal2,
      color: channelConnections.CH1.color
    },
    CH2: {
      enabled: channels.CH2.enabled,
      terminal1: channelConnections.CH2.terminal1,
      terminal2: channelConnections.CH2.terminal2,
      color: channelConnections.CH2.color
    },
    CH3: {
      enabled: channels.CH3.enabled,
      terminal1: channelConnections.CH3.terminal1,
      terminal2: channelConnections.CH3.terminal2,
      color: channelConnections.CH3.color
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <OscilloscopeScreen
            width={700}
            height={450}
            timeDiv={timeDiv}
            voltDiv={voltDiv}
            yPos={yPos}
            channels={screenChannels}
            frequency={generatorFrequency}
            amplitude={generatorAmplitude}
            isOn={generatorIsOn}
            timeCursors={{
              enabled: timeCursorsEnabled,
              t1: cursorT1,
              t2: cursorT2
            }}
            voltCursors={{
              enabled: voltCursorsEnabled,
              v1: cursorV1,
              v2: cursorV2
            }}
            trigger={{
              enabled: triggerEnabled,
              level: triggerLevel,
              channel: triggerChannel
            }}
            deltaT={deltaT}
            deltaV={deltaV}
            onTimeCursorChange={handleTimeCursorChange}
            onVoltCursorChange={handleVoltCursorChange}
          />

          <div className="border-t border-slate-700/50 pt-3">
            <OscilloscopeChannels
              channels={displayChannels}
              onChannelToggle={handleChannelToggle}
              onChannelClick={onChannelClick}
              selectedChannel={selectedChannel}
              debugMode={debugMode}
            />
          </div>
        </div>

        <div className="w-80">
          <OscilloscopeControls
            timeDiv={timeDiv}
            voltDiv={voltDiv}
            yPos={yPos}
            timeCursorsEnabled={timeCursorsEnabled}
            voltCursorsEnabled={voltCursorsEnabled}
            triggerEnabled={triggerEnabled}
            triggerLevel={triggerLevel}
            triggerChannel={triggerChannel}
            onTimeDivChange={setTimeDiv}
            onVoltDivChange={setVoltDiv}
            onYPosChange={setYPos}
            onToggleTimeCursors={() => setTimeCursorsEnabled(!timeCursorsEnabled)}
            onToggleVoltCursors={() => setVoltCursorsEnabled(!voltCursorsEnabled)}
            onResetTimeCursors={handleResetTimeCursors}
            onResetVoltCursors={handleResetVoltCursors}
            onToggleTrigger={() => setTriggerEnabled(!triggerEnabled)}
            onTriggerLevelChange={setTriggerLevel}
            onTriggerChannelChange={setTriggerChannel}
          />
        </div>
      </div>
    </div>
  );
}
