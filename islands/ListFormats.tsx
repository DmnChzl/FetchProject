import { useComputed, useSignal } from "@preact/signals";
import EmbeddedTable, { CellRecord } from "../components/EmbeddedTable.tsx";
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

const TABLE_HEADERS = [
  "ID",
  "Extension",
  "Resolution",
  "Framerate",
  "Size",
  "Audio Codec",
  "Video Codec",
  "",
];

const isAudioFormat = (format: ExplicitFormat) => format.resolution === "audio_only";
const isVideoFormat = (format: ExplicitFormat) => Boolean(format.width && format.height);

interface ListFormatsProps {
  url: string;
}

export default function ListFormats({ url }: ListFormatsProps) {
  const { data: formats, loading } = useListFormats(url);

  const audioFormat = useSignal("");
  const videoFormat = useSignal("");

  const selectedFormatCount = useComputed(() => {
    return [audioFormat.value, videoFormat.value].filter(Boolean).length;
  });
  const selectedFormatEmpty = useComputed(() => {
    return selectedFormatCount.value === 0;
  });
  const hasFormatSelected = useComputed(() => {
    return Boolean(audioFormat.value) || Boolean(videoFormat.value);
  });

  const downloadLink = useComputed(() => {
    const encodedUrl = encodeURIComponent(url);
    let link = `/download?url=${encodedUrl}`;

    if (audioFormat.value) {
      link += `&audio=${audioFormat.value}`;
    }
    if (videoFormat.value) {
      link += `&video=${videoFormat.value}`;
    }
    return link;
  });

  const isSelectedFormat = (format: ExplicitFormat) => [audioFormat.value, videoFormat.value].includes(format.id);

  const handleClick = (format: ExplicitFormat) => {
    if (audioFormat.value === format.id) {
      audioFormat.value = "";
      return;
    }
    if (videoFormat.value === format.id) {
      videoFormat.value = "";
      return;
    }
    if (isAudioFormat(format)) {
      audioFormat.value = format.id;
      return;
    }
    if (isVideoFormat(format)) {
      videoFormat.value = format.id;
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

  return (
    <div class="flex flex-col space-y-4 py-4 px-4 md:px-8 lg:px-16 h-[calc(100%-175px)]">
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
            {!selectedFormatEmpty.value &&
              (
                <span class="text-[14px] text-[var(--text-color-secondary)]">
                  {selectedFormatCount.value} Selected Format{selectedFormatCount.value > 1 ? "s" : ""}
                </span>
              )}
          </div>
          {hasFormatSelected.value && (
            <a
              class="px-2 text-[24px] font-semibold text-fraunces tracking-wide bg-[var(--primary-color)] text-[var(--bg-color)] hover:bg-[var(--primary-color-75)] rounded-[6px]"
              href={downloadLink.value}
            >
              fetch!
            </a>
          )}
        </div>
      )}

      <EmbeddedTable<EmbeddedFormat>
        headers={TABLE_HEADERS}
        dataset={datasetFormats.value}
      />
    </div>
  );
}
