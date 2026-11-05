import React, { useState } from 'react';
import { X, ExternalLink, Download, Copy, Check, Music2, Disc3, ShieldAlert } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const AmDlModal: React.FC = () => {
  const { isAmDlModalOpen, closeAmDlModal, targetAmDlTrack, currentTrack, downloadTrack, downloadedTrackIds } = usePlayer();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const track = targetAmDlTrack || currentTrack;
  if (!isAmDlModalOpen || !track) return null;

  const isAlreadyDownloaded = downloadedTrackIds.has(track.id);

  const handleCopyLink = () => {
    if (track.appleMusicUrl) {
      navigator.clipboard.writeText(track.appleMusicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenAmDl = () => {
    // Copy the Apple Music URL first so it's ready on user's clipboard
    if (track.appleMusicUrl) {
      navigator.clipboard.writeText(track.appleMusicUrl);
    }
    // Open am-dl.pages.dev in a new tab / window
    window.open('https://am-dl.pages.dev/', '_blank');
  };

  const handleDownloadOffline = async () => {
    setDownloading(true);
    try {
      await downloadTrack(track);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportAudioFile = () => {
    if (!track.streamUrl) return;
    const a = document.createElement('a');
    a.href = track.streamUrl;
    a.download = `${track.artist} - ${track.title}.m4a`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl safe-bottom text-white animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FC3C44] to-[#FA233B] flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Apple Music Downloader</h3>
              <p className="text-xs text-neutral-400">Integrated with am-dl.pages.dev</p>
            </div>
          </div>
          <button
            onClick={closeAmDlModal}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition"
          >
            <X className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        {/* Selected Track Preview */}
        <div className="my-4 p-3 bg-white/5 rounded-2xl flex items-center space-x-3 border border-white/5">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
            <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
            <p className="text-[11px] text-[#FA233B] font-medium mt-0.5 truncate">{track.quality.badge}</p>
          </div>
        </div>

        {/* Apple Music Link Box */}
        <div className="mb-4">
          <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1">
            Apple Music Link:
          </span>
          <div className="flex items-center space-x-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
            <span className="text-xs text-neutral-300 truncate flex-1 font-mono">
              {track.appleMusicUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 text-neutral-300 hover:text-white active:scale-90 transition flex-shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Primary: Open am-dl */}
          <button
            onClick={handleOpenAmDl}
            className="w-full py-3.5 bg-gradient-to-r from-[#FC3C44] to-[#FA233B] hover:opacity-95 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-[#FA233B]/25 active:scale-98 transition"
          >
            <span>Open am-dl Downloader</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Secondary: In-App Offline Download */}
          <button
            onClick={handleDownloadOffline}
            disabled={downloading || isAlreadyDownloaded}
            className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 border transition active:scale-98 ${
              isAlreadyDownloaded
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
            }`}
          >
            {isAlreadyDownloaded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved for Offline Listening</span>
              </>
            ) : downloading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Downloading Track...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save to Offline Library</span>
              </>
            )}
          </button>

          {/* Export .m4a */}
          {track.streamUrl && (
            <button
              onClick={handleExportAudioFile}
              className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition text-center"
            >
              Export audio file (.m4a) to device
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
