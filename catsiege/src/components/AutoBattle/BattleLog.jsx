import React, { useEffect, useRef } from "react";
import BattleLogCard from "./BattleLogCard";

const BattleLog = ({ logs = [], battleLog = [] }) => {
  const logContainerRef = useRef(null);

  // Use either logs or battleLog prop (for backward compatibility)
  const displayLogs = logs.length > 0 ? logs : battleLog;

  // Auto-scroll to the bottom of the log container when new logs appear
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayLogs]);

  return (
    <div
      className="w-full bg-[#201e1a] border border-[#FFF5E4]/10 rounded-lg p-3 mt-4 h-48 overflow-y-auto"
      ref={logContainerRef}
    >
      <h3 className="text-sm font-semibold text-[#FFF5E4]/70 mb-2 uppercase tracking-wider">
        Battle Log
      </h3>
      <div className="flex flex-col space-y-1">
        {displayLogs.map((log, index) => (
          <BattleLogCard
            key={index}
            log={log}
            index={index}
            totalLogs={displayLogs.length}
          />
        ))}
      </div>
    </div>
  );
};

export default BattleLog;
