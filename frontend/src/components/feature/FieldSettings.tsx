'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getSettings, updateFieldSettings } from '@/lib/storage/indexeddb';
import { FieldSettings as FieldSettingsType, ALL_FIELDS, DEFAULT_VISIBLE_FIELDS } from '@/lib/types';

interface FieldSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function FieldSettings({ isOpen, onClose, onSave }: FieldSettingsProps) {
  const [settings, setSettings] = useState<FieldSettingsType | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings.fieldSettings);
  };

  const toggleField = (fieldKey: string) => {
    if (!settings) return;
    const newVisible = settings.visibleFields.includes(fieldKey)
      ? settings.visibleFields.filter(f => f !== fieldKey)
      : [...settings.visibleFields, fieldKey];
    setSettings({ ...settings, visibleFields: newVisible });
  };

  const moveField = (fieldKey: string, direction: 'up' | 'down') => {
    if (!settings) return;
    const newOrder = [...settings.visibleFields];
    const index = newOrder.indexOf(fieldKey);
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setSettings({ ...settings, visibleFields: newOrder });
  };

  const resetToDefault = () => {
    setSettings({
      visibleFields: DEFAULT_VISIBLE_FIELDS,
      fieldOrder: DEFAULT_VISIBLE_FIELDS,
      listSortField: 'createdAt',
      listSortOrder: 'desc',
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    await updateFieldSettings(settings);
    onSave();
    onClose();
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">字段设置</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <i className="fa fa-times" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4">
            选择要显示的字段，并拖动调整顺序
          </p>

          <div className="space-y-2">
            {ALL_FIELDS.map(field => {
              const isVisible = settings.visibleFields.includes(field.key);
              const index = settings.visibleFields.indexOf(field.key);

              return (
                <div
                  key={field.key}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    isVisible ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleField(field.key)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{field.label}</span>
                  </div>

                  {isVisible && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.key, 'up')}
                        disabled={index === 0}
                      >
                        <i className="fa fa-chevron-up text-xs" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.key, 'down')}
                        disabled={index === settings.visibleFields.length - 1}
                      >
                        <i className="fa fa-chevron-down text-xs" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-between">
          <Button variant="outline" onClick={resetToDefault}>
            重置
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}