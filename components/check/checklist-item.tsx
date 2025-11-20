"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistItem } from "@/lib/checklist-data";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
    item: ChecklistItem;
    checked: boolean;
    onToggle: (checked: boolean) => void;
}

export function ChecklistItemComponent({ item, checked, onToggle }: ChecklistItemProps) {
    return (
        <div className={cn(
            "flex items-start space-x-3 p-3 rounded-lg transition-colors border",
            checked ? "bg-blue-50 border-blue-100" : "bg-white border-gray-100 hover:bg-gray-50"
        )}>
            <Checkbox
                id={item.id}
                checked={checked}
                onCheckedChange={(c) => onToggle(c as boolean)}
                className="mt-1"
            />
            <div className="space-y-1 flex-1">
                <label
                    htmlFor={item.id}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block",
                        checked ? "text-blue-900" : "text-gray-900"
                    )}
                >
                    {item.text}
                    {item.isCritical && (
                        <span className="ml-2 text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            필수
                        </span>
                    )}
                </label>
                {item.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {item.description}
                    </p>
                )}
                {item.subItems && item.subItems.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 p-2 rounded">
                        {item.subItems.map((sub, idx) => (
                            <li key={idx}>{sub}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
