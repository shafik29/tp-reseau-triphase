import { ChannelType } from '../types/oscilloscope';
import { TerminalType } from '../types/generator';
import { ConnectionColor } from './ConnectionButton';

interface OscilloscopeChannelsProps {
  channels: {
    CH1: { enabled: boolean; terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
    CH2: { enabled: boolean; terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
    CH3: { enabled: boolean; terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
  };
  onChannelToggle: (channel: ChannelType) => void;
  onChannelClick: (channel: ChannelType) => void;
  selectedChannel: ChannelType | null;
  debugMode: boolean;
}

const channelColors = {
  CH1: '#ef4444',
  CH2: '#3b82f6',
  CH3: '#22c55e'
};

const channelLabels = {
  CH1: 'CH1 (Rouge)',
  CH2: 'CH2 (Bleu)',
  CH3: 'CH3 (Vert)'
};

export function OscilloscopeChannels({
  channels,
  onChannelToggle,
  onChannelClick,
  selectedChannel,
  debugMode
}: OscilloscopeChannelsProps) {
  const renderChannel = (channelId: ChannelType) => {
    const channel = channels[channelId];
    const isSelected = selectedChannel === channelId;
    const hasOneConnection = (channel.terminal1 !== null && channel.terminal2 === null) ||
                             (channel.terminal1 === null && channel.terminal2 !== null);
    const hasFullConnection = channel.terminal1 !== null && channel.terminal2 !== null;

    let connectionText = '';
    if (hasFullConnection) {
      connectionText = `${channel.terminal1} - ${channel.terminal2}`;
    } else if (hasOneConnection) {
      const terminal = channel.terminal1 || channel.terminal2;
      connectionText = `${terminal} (1/2)`;
    } else if (isSelected) {
      connectionText = 'Sélectionné - Cliquez sur une borne';
    } else {
      connectionText = 'Cliquer pour connecter';
    }

    return (
      <div
        key={channelId}
        className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: channelColors[channelId] }}
            />
            <span className="text-white text-sm font-medium">{channelLabels[channelId]}</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={channel.enabled}
              onChange={() => onChannelToggle(channelId)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <button
          onClick={() => onChannelClick(channelId)}
          disabled={!channel.enabled}
          className={`w-full px-2 py-1.5 rounded text-xs font-medium transition-all ${
            !channel.enabled
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : isSelected
              ? 'bg-yellow-600 text-white ring-2 ring-yellow-400 animate-pulse'
              : hasFullConnection
              ? 'bg-green-600 text-white'
              : hasOneConnection
              ? 'bg-orange-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {connectionText}
        </button>

        {!hasFullConnection && hasOneConnection && channel.enabled && (
          <div className="mt-1.5 p-1.5 bg-orange-900/30 border border-orange-500/50 rounded text-xs text-orange-300">
            Connectez une 2ème borne pour mesurer
          </div>
        )}

        {debugMode && (channel.terminal1 || channel.terminal2) && (
          <div className="mt-1.5 text-xs text-slate-400">
            T1: {channel.terminal1 || '-'} | T2: {channel.terminal2 || '-'}
            {channel.color && ` | Couleur: ${channel.color}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-2">Voies de mesure</h3>
      <div className="grid grid-cols-3 gap-3">
        {renderChannel('CH1')}
        {renderChannel('CH2')}
        {renderChannel('CH3')}
      </div>
      <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/50 rounded">
        <p className="text-xs text-blue-300 text-center">
          Chaque voie nécessite 2 connexions pour mesurer une différence de potentiel (tension simple Ph-N ou composée Ph-Ph).
        </p>
      </div>
    </div>
  );
}
