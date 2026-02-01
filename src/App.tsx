import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Oscilloscope } from './components/Oscilloscope';
import { Generator } from './components/Generator';
import { GeneratorControls, Amplitude, Frequency } from './components/GeneratorControls';
import { ConnectionColor } from './components/ConnectionButton';
import { TerminalType } from './types/generator';
import { ChannelType } from './types/oscilloscope';

type TerminalPoint =
  | { device: 'oscilloscope'; channel: ChannelType }
  | { device: 'generator'; terminal: TerminalType };

type Connection = {
  point1: TerminalPoint;
  point2: TerminalPoint;
  color: ConnectionColor;
};

const availableColors: ConnectionColor[] = ['red', 'green', 'yellow', 'blue'];

function App() {
  const [debugMode, setDebugMode] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TerminalPoint | null>(null);

  const [generatorAmplitude, setGeneratorAmplitude] = useState<Amplitude>(6);
  const [generatorFrequency, setGeneratorFrequency] = useState<Frequency>(50);
  const [generatorIsOn, setGeneratorIsOn] = useState(false);

  const getUsedColors = (): Set<ConnectionColor> => {
    const used = new Set<ConnectionColor>();
    connections.forEach(conn => {
      if (conn.color) used.add(conn.color);
    });
    return used;
  };

  const getNextAvailableColor = (): ConnectionColor => {
    const used = getUsedColors();
    for (const color of availableColors) {
      if (!used.has(color)) return color;
    }
    return availableColors[0];
  };

  const getPointColor = (point: TerminalPoint): ConnectionColor => {
    const connection = connections.find(conn =>
      pointsEqual(conn.point1, point) || pointsEqual(conn.point2, point)
    );
    return connection?.color || null;
  };

  const isPointConnected = (point: TerminalPoint): boolean => {
    if (point.device === 'generator') {
      return false;
    }

    const channelConnections = connections.filter(conn =>
      pointsEqual(conn.point1, point) || pointsEqual(conn.point2, point)
    );
    return channelConnections.length >= 2;
  };

  const pointsEqual = (p1: TerminalPoint, p2: TerminalPoint): boolean => {
    if (p1.device !== p2.device) return false;
    if (p1.device === 'oscilloscope' && p2.device === 'oscilloscope') {
      return p1.channel === p2.channel;
    }
    if (p1.device === 'generator' && p2.device === 'generator') {
      return p1.terminal === p2.terminal;
    }
    return false;
  };

  const handlePointClick = (point: TerminalPoint) => {
    if (isPointConnected(point)) {
      return;
    }

    if (!selectedPoint) {
      setSelectedPoint(point);
    } else {
      if (pointsEqual(selectedPoint, point)) {
        setSelectedPoint(null);
        return;
      }

      const color = getNextAvailableColor();
      const newConnection: Connection = {
        point1: selectedPoint,
        point2: point,
        color
      };

      setConnections([...connections, newConnection]);
      setSelectedPoint(null);
    }
  };

  const handleChannelClick = (channel: ChannelType) => {
    handlePointClick({ device: 'oscilloscope', channel });
  };

  const handleTerminalClick = (terminal: TerminalType) => {
    handlePointClick({ device: 'generator', terminal });
  };

  const handleClearAllConnections = () => {
    setConnections([]);
    setSelectedPoint(null);
  };

  const getChannelConnections = (): {
    CH1: { terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
    CH2: { terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
    CH3: { terminal1: TerminalType | null; terminal2: TerminalType | null; color: ConnectionColor };
  } => {
    const result = {
      CH1: { terminal1: null as TerminalType | null, terminal2: null as TerminalType | null, color: null as ConnectionColor },
      CH2: { terminal1: null as TerminalType | null, terminal2: null as TerminalType | null, color: null as ConnectionColor },
      CH3: { terminal1: null as TerminalType | null, terminal2: null as TerminalType | null, color: null as ConnectionColor }
    };

    connections.forEach(conn => {
      const oscilloscopePoint = conn.point1.device === 'oscilloscope' ? conn.point1 :
                                 conn.point2.device === 'oscilloscope' ? conn.point2 : null;
      const generatorPoint = conn.point1.device === 'generator' ? conn.point1 :
                             conn.point2.device === 'generator' ? conn.point2 : null;

      if (oscilloscopePoint && generatorPoint && oscilloscopePoint.device === 'oscilloscope' && generatorPoint.device === 'generator') {
        const channel = oscilloscopePoint.channel;
        if (result[channel].terminal1 === null) {
          result[channel].terminal1 = generatorPoint.terminal;
          result[channel].color = conn.color;
        } else if (result[channel].terminal2 === null) {
          result[channel].terminal2 = generatorPoint.terminal;
        }
      }
    });

    return result;
  };

  const getTerminalConnections = (): Map<TerminalType, ConnectionColor> => {
    const map = new Map<TerminalType, ConnectionColor>();
    connections.forEach(conn => {
      if (conn.point1.device === 'generator') {
        map.set(conn.point1.terminal, conn.color);
      }
      if (conn.point2.device === 'generator') {
        map.set(conn.point2.terminal, conn.color);
      }
    });
    return map;
  };

  const getSelectedChannel = (): ChannelType | null => {
    if (selectedPoint && selectedPoint.device === 'oscilloscope') {
      return selectedPoint.channel;
    }
    return null;
  };

  const getSelectedTerminal = (): TerminalType | null => {
    if (selectedPoint && selectedPoint.device === 'generator') {
      return selectedPoint.terminal;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,183,77,0.1),transparent_40%)]" />

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {debugMode ? 'Hide Zones' : 'Show Zones'}
        </button>
        {connections.length > 0 && (
          <button
            onClick={handleClearAllConnections}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Réinitialiser connexions
          </button>
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
              TP – Réseau triphasé : Activité 3
            </h1>
            <p className="text-lg text-slate-300 text-center">
              Tension instantanée et déphasage – Oscilloscope numérique
            </p>
          </div>
        </div>
      </header>

      {/* Instructions Panel */}
      <div className="relative z-10 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Consignes d'utilisation
            </h2>
            <ul className="text-slate-200 space-y-2 text-base">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Allumer le générateur avec le bouton "ON"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Choisir l'amplitude : 6 V ou 9 V (valeur efficace)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Régler la fréquence (50 Hz ou 100 Hz pour faciliter l'observation)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Activer les voies de l'oscilloscope (CH1, CH2, CH3)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Connecter chaque voie à deux bornes du générateur : ex. Ph1 puis N pour une tension simple, ou Ph1 puis Ph2 pour une tension composée</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Régler la base de temps (ms/div) et la sensibilité (V/div) pour une visualisation optimale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span>Activer les curseurs pour mesurer la période T et le décalage Δt entre deux signaux</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <div className="container mx-auto px-4 pb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Oscilloscope numérique pédagogique</h2>
            <Oscilloscope
              channelConnections={getChannelConnections()}
              selectedChannel={getSelectedChannel()}
              onChannelClick={handleChannelClick}
              debugMode={debugMode}
              generatorAmplitude={generatorAmplitude}
              generatorFrequency={generatorFrequency}
              generatorIsOn={generatorIsOn}
            />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Générateur Triphasé</h2>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex gap-6 items-center">
                <div className="flex-shrink-0">
                  <Generator
                    terminalConnections={getTerminalConnections()}
                    selectedTerminal={getSelectedTerminal()}
                    onTerminalClick={handleTerminalClick}
                    debugMode={debugMode}
                  />
                </div>
                <div className="w-80">
                  <GeneratorControls
                    amplitude={generatorAmplitude}
                    frequency={generatorFrequency}
                    isOn={generatorIsOn}
                    onAmplitudeChange={setGeneratorAmplitude}
                    onFrequencyChange={setGeneratorFrequency}
                    onTogglePower={() => setGeneratorIsOn(!generatorIsOn)}
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedPoint && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-pulse">
              Sélectionnez une seconde borne pour créer la connexion
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 p-6">
            <div className="text-center space-y-2">
              <p className="text-slate-200 font-medium">
                Lycée Léon Chiris – Terminale Bac Pro – Maths/Sciences
              </p>
              <p className="text-slate-300">
                M. BEN AHMED
              </p>
              <p className="text-slate-400 text-sm">
                © 2025/2026 – Tous droits réservés
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
