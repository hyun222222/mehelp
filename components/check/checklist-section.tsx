"use client";

import { ChecklistItem, ChecklistSection } from "@/lib/checklist-data";
import { ChecklistItemComponent } from "./checklist-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChecklistSectionProps {
    section: ChecklistSection;
    checkedItems: Record<string, boolean>;
    onToggleItem: (id: string, checked: boolean) => void;
}

export function ChecklistSectionComponent({ section, checkedItems, onToggleItem }: ChecklistSectionProps) {
    const totalItems = section.items.length;
    const completedItems = section.items.filter(item => checkedItems[item.id]).length;
    const progress = (completedItems / totalItems) * 100;

    return (
        <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-800">
                            {section.title}
                        </CardTitle>
                        {section.description && (
                            <CardDescription className="mt-1">
                                {section.description}
                            </CardDescription>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-blue-600">
                            {completedItems} / {totalItems}
                        </span>
                    </div>
                </div>
                <Progress value={progress} className="h-2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
                {section.items.map((item) => (
                    <ChecklistItemComponent
                        key={item.id}
                        item={item}
                        checked={!!checkedItems[item.id]}
                        onToggle={(checked) => onToggleItem(item.id, checked)}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
