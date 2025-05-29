import clsx from "clsx";
import { JSX } from "preact";

export type CellRecord<T> = {
  [K in keyof T]: {
    value: T[K];
    renderCell: (value: T[K]) => JSX.Element;
  };
};

function cellRecordToProps<T>(record: CellRecord<T>) {
  return Object.values(record) as Array<CellRecord<T>[keyof T]>;
}

interface EmbeddedTableProps<T> {
  headers: string[];
  dataset: Array<CellRecord<T>>;
}

export default function EmbeddedTable<T>({ headers, dataset }: EmbeddedTableProps<T>) {
  return (
    <div class="overflow-auto border border-[var(--border-color)] rounded-[12px] shadow-sm">
      <table class="border-collapse w-full">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th
                key={`header-${idx}`}
                class="sticky top-0 z-10 py-2 px-4 text-[14px] font-semibold text-[var(--text-color-idle)] bg-[var(--bg-color)] text-left"
              >
                {header}
                <span class="absolute bottom-0 left-0 w-full h-px bg-[var(--border-color)]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.map((data, idx) => {
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
