import { Card, CardContent } from "@/components/ui/card";

type PriceRow = {
  asset: string;
  bid: number;
  ask: number;
};

type Props = {
  rows?: PriceRow[];
};

const DEFAULT_ROWS: PriceRow[] = [
  { asset: "96.50%", bid: 57215, ask: 57265 },
  { asset: "99.99%", bid: 59300, ask: 59345 },
];

export default function PriceTicker({ rows = DEFAULT_ROWS }: Props) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 items-center">
          <div />
          <div className="text-xs text-gray-500 pb-2">เสนอซื้อ</div>
          <div className="text-xs text-gray-500 pb-2">เสนอขาย</div>

          {rows.map((row) => (
            <RowCells key={row.asset} row={row} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RowCells({ row }: { row: PriceRow }) {
  return (
    <>
      <div className="text-[11px] leading-tight text-gray-500 py-1">
        <div>ทองคำ</div>
        <div className="font-semibold text-gray-700">{row.asset}</div>
      </div>
      <div className="text-2xl font-bold py-1">{row.bid.toLocaleString()}</div>
      <div className="text-2xl font-bold py-1">{row.ask.toLocaleString()}</div>
    </>
  );
}
