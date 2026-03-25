import { Button } from "@/components/ui/button";
import { GitBranch, RotateCcw } from "lucide-react";
import type { VersionEntry } from "@/types/workspace.types";

interface VersionHistoryProps {
	versions: VersionEntry[];
	onRevert: (versionId: number) => Promise<void>;
	loading?: boolean;
	canRevert?: boolean;
}

const VersionHistory = ({ versions, onRevert, loading = false, canRevert = false }: VersionHistoryProps) => {
	if (loading) {
		return <p className="text-[11px] text-muted-foreground">Loading version history...</p>;
	}

	if (versions.length === 0) {
		return <p className="text-[11px] text-muted-foreground">No versions yet</p>;
	}

	return (
		<div className="space-y-2">
			{versions.map((version) => (
				<div key={version.id} className="bg-surface rounded-md p-2 group">
					<div className="flex items-center justify-between mb-1">
						<div className="flex items-center gap-1">
							<GitBranch className="h-3 w-3 text-primary" />
							<span className="text-xs font-semibold text-foreground">v{version.versionNumber}</span>
						</div>
						{canRevert && (
							<Button
								variant="ghost"
								size="sm"
								className="h-5 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={() => void onRevert(version.id)}
							>
								<RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Revert
							</Button>
						)}
					</div>
					<p className="text-[11px] text-muted-foreground truncate">{version.contentPreview || "(empty snapshot)"}</p>
					<p className="text-[10px] text-muted-foreground mt-0.5">
						{(version.authorName || version.authorEmail || "Unknown") + " • " + new Date(version.createdAt).toLocaleString()}
					</p>
				</div>
			))}
		</div>
	);
};

export default VersionHistory;
