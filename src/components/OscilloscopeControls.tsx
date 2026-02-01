import { TimeDivision, VoltDivision, ChannelType } from '../types/oscilloscope';

interface OscilloscopeControlsProps {
  timeDiv: TimeDivision;
  voltDiv: VoltDivision;
  yPos: number;
  timeCursorsEnabled: boolean;
  voltCursorsEnabled: boolean;
  triggerEnabled: boolean;
  triggerLevel: number;
  triggerChannel: ChannelType;
  onTimeDivChange: (value: TimeDivision) => void;
  onVoltDivChange: (value: VoltDivision) => void;
  onYPosChange: (value: number) => void;
  onToggleTimeCursors: () => void;
  onToggleVoltCursors: () => void;
  onResetTimeCursors: () => void;
  onResetVoltCursors: () => void;
  onToggleTrigger: () => void;
  onTriggerLevelChange: (value: number) => void;
  onTriggerChannelChange: (channel: ChannelType) => void;
}

const timeDivOptions: TimeDivision[] = [1, 2, 5, 10];
const voltDivOptions: VoltDivision[] = [1, 2, 5, 10];

export function OscilloscopeControls({
  timeDiv,
  voltDiv,
  yPos,
  timeCursorsEnabled,
  voltCursorsEnabled,
  triggerEnabled,
  triggerLevel,
  triggerChannel,
  onTimeDivChange,
  onVoltDivChange,
  onYPosChange,
  onToggleTimeCursors,
  onToggleVoltCursors,
  onResetTimeCursors,
  onResetVoltCursors,
  onToggleTrigger,
  onTriggerLevelChange,
  onTriggerChannelChange
}: OscilloscopeControlsProps) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900/90 pb-2">Réglages</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Base de temps (ms/div)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {timeDivOptions.map((value) => (
              <button
                key={value}
                onClick={() => onTimeDivChange(value)}
                className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                  timeDiv === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Sensibilité (V/div)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {voltDivOptions.map((value) => (
              <button
                key={value}
                onClick={() => onVoltDivChange(value)}
                className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                  voltDiv === value
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Position verticale: {yPos.toFixed(0)} px
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={yPos}
            onChange={(e) => onYPosChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="pt-3 border-t border-slate-700 space-y-2.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Curseurs temporels (Δt)
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={onToggleTimeCursors}
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  timeCursorsEnabled
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {timeCursorsEnabled ? 'ON' : 'OFF'}
              </button>
              {timeCursorsEnabled && (
                <button
                  onClick={onResetTimeCursors}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                >
                  RAZ
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Curseurs de tension (ΔV)
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={onToggleVoltCursors}
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  voltCursorsEnabled
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {voltCursorsEnabled ? 'ON' : 'OFF'}
              </button>
              {voltCursorsEnabled && (
                <button
                  onClick={onResetVoltCursors}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                >
                  RAZ
                </button>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-700">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Trigger (stabilisation)
            </label>
            <button
              onClick={onToggleTrigger}
              className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors mb-2.5 ${
                triggerEnabled
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {triggerEnabled ? 'TRIG ON' : 'TRIG OFF'}
            </button>

            {triggerEnabled && (
              <>
                <div className="mb-2.5">
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Niveau: {triggerLevel.toFixed(1)} V
                  </label>
                  <input
                    type="range"
                    min={-voltDiv * 5}
                    max={voltDiv * 5}
                    step="0.1"
                    value={triggerLevel}
                    onChange={(e) => onTriggerLevelChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Voie de trigger
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['CH1', 'CH2', 'CH3'] as ChannelType[]).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => onTriggerChannelChange(ch)}
                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                          triggerChannel === ch
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
