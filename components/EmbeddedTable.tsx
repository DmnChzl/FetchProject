import { useSignal } from "@preact/signals";
import clsx from "clsx";
import { JSX } from "preact";
import { sortByKey } from "../utils/index.ts";
import { IconChevronDown, IconChevronUp } from "./icons/index.ts";

export type TableHeader<T> = Record<keyof T, string>;

export type CellRecord<T> = {
  [K in keyof T]: {
    value: T[K];
    renderCell: (value: T[K]) => JSX.Element;
  };
};

function cellRecordToObject<T>(record: CellRecord<T>) {
  const obj = {} as T;
  for (const key in record) {
    obj[key] = record[key].value;
  }
  return obj;
}

function cellRecordToProps<T>(record: CellRecord<T>) {
  return Object.values(record) as Array<CellRecord<T>[keyof T]>;
}

interface EmbeddedTableProps<T> {
  headers: TableHeader<T>;
  dataset: Array<CellRecord<T>>;
}

export default function EmbeddedTable<T>({ headers, dataset }: EmbeddedTableProps<T>) {
  const sortKey = useSignal<keyof T | null>(null);
  const sortOrder = useSignal<"asc" | "desc">("asc");

  const handleClick = (key: keyof T) => {
    if (sortKey.value === key) {
      if (sortOrder.value === "asc") {
        sortOrder.value = "desc";
      } else {
        sortKey.value = null;
      }
    } else {
      sortKey.value = key;
      sortOrder.value = "asc";
    }
  };

  return (
    <div class="overflow-auto border border-[var(--border-color)] rounded-[12px] shadow-sm">
      <table class="border-collapse w-full">
        <thead>
          <tr>
            {(Object.entries(headers) as [keyof T, string][]).map(([key, value], idx) => (
              <th
                key={`header-${idx}`}
                class="sticky top-0 z-10 py-2 px-4 h-[40px] text-[14px] font-semibold text-[var(--text-color-idle)] bg-[var(--bg-color)] text-left whitespace-nowrap"
              >
                <button
                  class="flex items-center justify-between w-full"
                  type="button"
                  onClick={() => handleClick(key)}
                >
                  <span>{value}</span>
                  {sortKey.value !== key && <span class="w-[24px] hidden sm:block" />}
                  {sortKey.value === key && sortOrder.value === "asc" && <IconChevronDown />}
                  {sortKey.value === key && sortOrder.value === "desc" && <IconChevronUp />}
                </button>
                <span class="absolute bottom-0 left-0 w-full h-px bg-[var(--border-color)]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset
            .slice() // Immutability
            .sort((a, b) => {
              if (sortKey.value === null) return 0;
              const aObj = cellRecordToObject(a);
              const bObj = cellRecordToObject(b);
              return sortByKey(sortKey.value, sortOrder.value)(aObj, bObj);
            }).map((data, idx) => {
              const props = cellRecordToProps(data);

              return (
                <tr key={idx} className={clsx(idx !== 0 && "border-t border-[var(--border-color)]")}>
                  {props.map((prop, idx) => (
                    <td
                      key={`prop-${idx}`}
                      className="py-2 px-4 text-[14px] text-[var(--text-color-secondary)] text-left"
                    >
                      {prop.renderCell(prop.value)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
