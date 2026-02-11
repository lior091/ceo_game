import { Meters, VisualPhase } from '../types/game';

interface MeterDisplayProps {
  meters: Meters;
  gamePhase: VisualPhase;
}

export default function MeterDisplay({ meters, gamePhase }: MeterDisplayProps) {
  const getMeterColor = (value: number, isStress: boolean) => {
    if (value < 25) return 'bg-danger';
    if (isStress && value > 75) return 'bg-danger';
    return '';
  };

  const getTransitionDuration = () => {
    switch (gamePhase) {
      case 'early': return 'duration-300';
      case 'mid': return 'duration-200';
      case 'late': return 'duration-100';
    }
  };

  const metersConfig = [
    { label: 'Team Trust', value: meters.teamTrust, color: 'bg-teal', isStress: false },
    { label: 'Business Health', value: meters.businessHealth, color: 'bg-gold', isStress: false },
    { label: 'CEO Stress', value: meters.ceoStress, color: 'bg-danger', isStress: true },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {metersConfig.map((meter) => {
        const dangerColor = getMeterColor(meter.value, meter.isStress);
        const barColor = dangerColor || meter.color;
        
        return (
          <div key={meter.label} className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-xs sm:text-sm font-medium text-gray-700">{meter.label}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700">{Math.round(meter.value)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all ${getTransitionDuration()} ease-out`}
                style={{ width: `${meter.value}%` }}
                role="progressbar"
                aria-valuenow={meter.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${meter.label}: ${Math.round(meter.value)} percent`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
