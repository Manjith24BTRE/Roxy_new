import React from 'react';

export function SupportedFormats() {
  const formats = ["MP4", "MOV", "AVI", "MKV", "WEBM", "MP3", "WAV", "PNG", "JPG", "JPEG", "SVG"];

  return (
    <div className="py-4 border-t border-[#1D2B64]/5 w-full shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 text-center select-none">
      <div className="flex flex-wrap justify-center gap-1.5">
        {formats.map((fmt, i) => (
          <span 
            key={i} 
            className="px-2.5 py-1 rounded-md bg-white border border-[#1D2B64]/5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#1D2B64]/50 shadow-sm"
          >
            {fmt}
          </span>
        ))}
      </div>
      
      <div className="text-[10px] font-semibold text-[#1D2B64]/40">
        On-device encoding support · Max file size 2GB
      </div>
    </div>
  );
}
export default SupportedFormats;
