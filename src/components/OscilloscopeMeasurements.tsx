interface OscilloscopeMeasurementsProps {
  deltaT: number;
  deltaV: number;
  timeCursorsEnabled: boolean;
  voltCursorsEnabled: boolean;
}

export function OscilloscopeMeasurements({
  deltaT,
  deltaV,
  timeCursorsEnabled,
  voltCursorsEnabled
}: OscilloscopeMeasurementsProps) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Mesures</h3>

      <div className="space-y-3">
        {timeCursorsEnabled && (
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-sm text-slate-400 mb-1">Décalage temporel Δt</div>
            <div className="text-2xl font-mono font-bold text-yellow-400">
              {deltaT.toFixed(2)} ms
            </div>
          </div>
        )}

        {voltCursorsEnabled && (
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-sm text-slate-400 mb-1">Différence de tension ΔV</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {deltaV.toFixed(2)} V
            </div>
          </div>
        )}

        {!timeCursorsEnabled && !voltCursorsEnabled && (
          <div className="bg-slate-900/50 rounded-lg p-4 text-center">
            <div className="text-sm text-slate-400">
              Activez les curseurs temporels ou de tension pour effectuer des mesures
            </div>
          </div>
        )}

        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mt-4">
          <div className="text-xs text-blue-300 font-semibold mb-2">
            Objectifs du TP
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>• Mesurer la période T avec les curseurs temporels</div>
            <div>• Mesurer le décalage Δt entre deux signaux</div>
            <div>• Calculer le déphasage : φ = 2π·Δt / T</div>
            <div>• Mesurer les amplitudes avec les curseurs de tension</div>
          </div>
        </div>
      </div>
    </div>
  );
}
