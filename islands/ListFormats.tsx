import { useComputed, useSignal } from "@preact/signals";
import DropDown from "../components/DropDown.tsx";
import EmbeddedTable, { type CellRecord, type TableHeader } from "../components/EmbeddedTable.tsx";
import OutlinedButton from "../components/OutlinedButton.tsx";
import useListFormats from "../hooks/useListFormats.ts";
import type { ExplicitFormat } from "../models/format.ts";

interface EmbeddedFormat {
  id: string;
  ext: string;
  res: string;
  fps?: number;
  fileSize: string;
  aCodec: string;
  vCodec: string;
  format: ExplicitFormat;
}

const TABLE_HEADER: TableHeader<EmbeddedFormat> = {
  id: "ID",
  ext: "Extension",
  res: "Resolution",
  fps: "Framerate",
  fileSize: "Size",
  aCodec: "Audio Codec",
  vCodec: "Video Codec",
  format: "",
};

const AUDIO_EXT = ["aac", "alac", "flac", "m4a", "mp3", "opus", "vorbis", "wav"];
const VIDEO_EXT = ["avi", "flv", "gif", "mkv", "mov", "mp4", "webm"];
const DEFAULT_TARGET_EXT = "default";

const isAudioFormat = (format: ExplicitFormat) => format.resolution === "audio_only";
const isVideoFormat = (format: ExplicitFormat) => Boolean(format.width && format.height);

interface ListFormatsProps {
  sourceUrl: string;
  targetMenuEnabled: boolean;
}

export default function ListFormats({ sourceUrl, targetMenuEnabled }: ListFormatsProps) {
  const { data: formats, loading } = useListFormats(sourceUrl);

  const audioFormat = useSignal<ExplicitFormat | null>(null);
  const videoFormat = useSignal<ExplicitFormat | null>(null);

  const targetExtension = useSignal<string>(DEFAULT_TARGET_EXT);

  const selectedFormatCount = useComputed(() => {
    return [audioFormat.value, videoFormat.value].filter(Boolean).length;
  });
  const selectedFormatEmpty = useComputed(() => {
    return selectedFormatCount.value === 0;
  });
  const hasFormatSelected = useComputed(() => {
    return Boolean(audioFormat.value) || Boolean(videoFormat.value);
  });

  const dropDownOptions = useComputed(() => {
    if (videoFormat.value) {
      return [DEFAULT_TARGET_EXT, ...VIDEO_EXT].map((ext) => ({ label: ext, value: ext }));
    }
    return [DEFAULT_TARGET_EXT, ...AUDIO_EXT].map((ext) => ({ label: ext, value: ext }));
  });

  const isSelectedFormat = (format: ExplicitFormat) => {
    return [audioFormat.value?.id, videoFormat.value?.id].includes(format.id);
  };

  const handleClick = (format: ExplicitFormat) => {
    targetExtension.value = DEFAULT_TARGET_EXT; // * RESET *

    if (audioFormat.value?.id === format.id) {
      audioFormat.value = null;
      return;
    }
    if (videoFormat.value?.id === format.id) {
      videoFormat.value = null;
      return;
    }
    if (isAudioFormat(format)) {
      audioFormat.value = format;
      return;
    }
    if (isVideoFormat(format)) {
      videoFormat.value = format;
      return;
    }
  };

  const datasetFormats = useComputed<Array<CellRecord<EmbeddedFormat>>>(() => {
    return formats.value.map((format) => ({
      id: {
        value: format.id,
        renderCell: (value) => <span>{value}</span>,
      },
      ext: {
        value: format.extension,
        renderCell: (value) => (
          <span class="px-2 text-[var(--primary-color)] bg-[var(--primary-color-25)] rounded-full">
            {value}
          </span>
        ),
      },
      res: {
        value: format.resolution,
        renderCell: (value) => <span>{value}</span>,
      },
      fps: {
        value: format.framePerSecond,
        renderCell: (value) => {
          if (!value) return <span />;
          return (
            <span class="px-2 text-[var(--primary-color)] bg-[var(--primary-color-25)] rounded-full">
              {value}
            </span>
          );
        },
      },
      fileSize: {
        value: format.fileSize,
        renderCell: (value) => <span>{value}</span>,
      },
      aCodec: {
        value: format.audioCodec,
        renderCell: (value) => <span>{value}</span>,
      },
      vCodec: {
        value: format.videoCodec,
        renderCell: (value) => <span>{value}</span>,
      },
      format: {
        value: format,
        renderCell: (value) => {
          const selected = isSelectedFormat(value);

          return (
            <div class="flex min-w-[96px]">
              <OutlinedButton
                outlined={selected}
                onClick={() => handleClick(value)}
              >
                {selected ? "Selected" : "Select"}
              </OutlinedButton>
            </div>
          );
        },
      },
    }));
  });

  const goToFormatPage = async () => {
    const body = JSON.stringify({
      sourceUrl,
      audioFormat: audioFormat.value,
      videoFormat: videoFormat.value,
      targetExtension: targetExtension.value !== DEFAULT_TARGET_EXT ? targetExtension.value : undefined,
    });

    const res = await fetch("/api/format", {
      method: "POST",
      body,
    });

    if (res.ok) {
      const data: { token: string } = await res.json();
      globalThis.location.href = `/format/${data.token}?url=${sourceUrl}`;
    }
  };

  return (
    <div class="flex flex-col space-y-4 py-4 px-4 md:px-8 lg:px-16 h-[calc(100%-195px)] md:h-[calc(100%-175px)]">
      {loading.value && (
        <div class="flex items-center justify-between min-h-[48px]">
          <span class="text-[18px] font-semibold text-[var(--text-color)]">
            Wait For It...
          </span>
        </div>
      )}

      {!loading.value && (
        <div class="flex items-center justify-between min-h-[48px]">
          <div class="flex flex-col">
            <span class="text-[18px] font-semibold text-[var(--text-color)]">
              {formats.value.length} Result{formats.value.length > 1 ? "s" : ""}
            </span>

            {!selectedFormatEmpty.value && (
              <div class="flex items-center text-[14px]">
                <span class="text-[var(--text-color-secondary)]">
                  {selectedFormatCount.value} Selected Format{selectedFormatCount.value > 1 ? "s" : ""}, Output:&nbsp;
                </span>

                {targetMenuEnabled && (
                  <DropDown<string>
                    onChange={(event) => targetExtension.value = event.currentTarget.value}
                    options={dropDownOptions.value}
                  />
                )}
              </div>
            )}
          </div>

          {hasFormatSelected.value && (
            <button
              class="px-2 text-[24px] font-semibold text-fraunces tracking-wide bg-[var(--primary-color)] text-[var(--bg-color)] hover:bg-[var(--primary-color-75)] rounded-[6px]"
              type="button"
              onClick={goToFormatPage}
            >
              fetch!
            </button>
          )}
        </div>
      )}

      <EmbeddedTable<EmbeddedFormat>
        headers={TABLE_HEADER}
        dataset={datasetFormats.value}
      />
    </div>
  );
}
