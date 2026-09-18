import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

/**
 * Satu tile metrik ringkasan — Card + heading, tanpa chart (T-042.3).
 * Diekstrak (code review PR #127) dari duplikat identik di
 * `DashboardHome.tsx` (Dashboard Home) dan `AnalyzeDashboard.tsx`
 * (`/analyze`) — kedua halaman merender summary row metrik dengan tile yang
 * sama persis.
 */
export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        {/* eslint-disable-next-line no-restricted-syntax -- layout-only, konsisten pola shadcn+Tailwind lain di (app)/ */}
        <div className="flex flex-col gap-2">
          <Text variant="muted">{label}</Text>
          <Text variant="h3" as="h2" className="mt-0 scroll-m-0">
            {value}
          </Text>
        </div>
      </CardContent>
    </Card>
  );
}
