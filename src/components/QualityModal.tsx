import React from 'react';
import { X, Sparkles, Check, Headphones, Cpu, Radio, ShieldCheck } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const QualityModal: React.FC = () => {
  const { isQualityModalOpen, closeQualityModal, currentTrack } = usePlayer();

  if (!isQualityModalOpen || !currentTrack) return null;

  const { quality } = currentTrack;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl safe-bottom text-white animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#FC3C44] to-[#FA233B] text-white">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{quality.badge}</h3>
              <p className="text-xs text-neutral-400">Apple Lossless Audio Codec</p>
            </div>
          </div>
          <button
            onClick={closeQualityModal}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition"
          >
            <X className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        {/* Specifications Grid */}
        <div className="my-5 grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Resolution
            </span>
            <span className="text-base font-bold text-white flex items-center gap-1">
              {quality.bitDepth} / {quality.sampleRate}
            </span>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Codec
            </span>
            <span className="text-base font-bold text-white truncate block">
              ALAC Lossless
            </span>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Channels
            </span>
            <span className="text-base font-bold text-white">
              Stereo (2.0)
            </span>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Fidelity
            </span>
            <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Bit-Perfect
            </span>
          </div>
        </div>

        {/* Technical Explanations */}
        <div className="space-y-3 text-xs text-neutral-300">
          <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl">
            <Headphones className="w-4 h-4 text-[#FA233B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">External DAC Recommended</p>
              <p className="text-neutral-400 mt-0.5">
                To play Hi-Res Lossless songs up to 24-bit/192kHz on Android without OS downsampling, connect a USB Digital-to-Analog converter.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl">
            <Cpu className="w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Lossless Compression</p>
              <p className="text-neutral-400 mt-0.5">
                ALAC preserves every single bit of the original studio master recording with zero audio compression loss.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={closeQualityModal}
          className="mt-6 w-full py-3.5 bg-[#FA233B] hover:bg-[#FC3C44] text-white font-bold rounded-2xl text-center active:scale-98 transition shadow-lg shadow-[#FA233B]/20"
        >
          Done
        </button>
      </div>
    </div>
  );
};
