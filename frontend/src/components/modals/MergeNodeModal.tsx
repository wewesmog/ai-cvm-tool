"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
// Using native HTML select instead of custom Select component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pen, Eye as EyeIcon, Plus, Trash2 } from "lucide-react"

// Zod schema for form validation
const formSchema = z.object({
  // Basic Node Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),

  // Merge Configuration
  mergeType: z.enum(["and", "or", "minus"]),
  segments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    condition: z.string(),
    weight: z.number().min(0).max(100).default(50),
  })).min(1, "At least one segment is required"),
  
  // Data Source
  dataSource: z.enum(["api", "database", "analytics"]),
  apiEndpoint: z.string().optional(),
  sqlQuery: z.string().optional(),
  userField: z.string().optional(),
  
  // Schedule
  scheduleMode: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  repeatMode: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  maxParticipants: z.number().min(1).optional(),
  timezone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MergeNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function MergeNodeModal({ isOpen, onClose, onSave, nodeData }: MergeNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: nodeData?.title || 'Untitled Merge Node',
      description: nodeData?.description || 'Combine customer segments with logical operations',
      mergeType: nodeData?.mergeType || "and",
      segments: nodeData?.segments || [
        { id: "1", name: "Segment 1", condition: "user.age > 18", weight: 50 },
        { id: "2", name: "Segment 2", condition: "user.subscription == 'premium'", weight: 50 }
      ],
      dataSource: nodeData?.dataSource || "analytics",
      apiEndpoint: nodeData?.apiEndpoint || "",
      sqlQuery: nodeData?.sqlQuery || "",
      userField: nodeData?.userField || "",
      scheduleMode: nodeData?.scheduleMode ?? false,
      startDate: nodeData?.startDate ? new Date(nodeData.startDate) : undefined,
      endDate: nodeData?.endDate ? new Date(nodeData.endDate) : undefined,
      startTime: nodeData?.startTime || "09:00",
      endTime: nodeData?.endTime || "17:00",
      repeatMode: nodeData?.repeatMode || "none",
      maxParticipants: nodeData?.maxParticipants || 1000,
      timezone: nodeData?.timezone || "UTC",
    },
  });

  // Reset form when modal opens or nodeData changes
  useEffect(() => {
    if (isOpen && nodeData) {
      form.reset({
        title: nodeData?.title || 'Untitled Merge Node',
        description: nodeData?.description || 'Combine customer segments with logical operations',
        mergeType: nodeData?.mergeType || "and",
        segments: nodeData?.segments || [
          { id: "1", name: "Segment 1", condition: "user.age > 18", weight: 50 },
          { id: "2", name: "Segment 2", condition: "user.subscription == 'premium'", weight: 50 }
        ],
        dataSource: nodeData?.dataSource || "analytics",
        apiEndpoint: nodeData?.apiEndpoint || "",
        sqlQuery: nodeData?.sqlQuery || "",
        userField: nodeData?.userField || "",
        scheduleMode: nodeData?.scheduleMode ?? false,
        startDate: nodeData?.startDate ? new Date(nodeData.startDate) : undefined,
        endDate: nodeData?.endDate ? new Date(nodeData.endDate) : undefined,
        startTime: nodeData?.startTime || "09:00",
        endTime: nodeData?.endTime || "17:00",
        repeatMode: nodeData?.repeatMode || "none",
        maxParticipants: nodeData?.maxParticipants || 1000,
        timezone: nodeData?.timezone || "UTC",
      });
      setCurrentTab("general");
    } else if (!isOpen) {
      form.reset();
    }
  }, [isOpen, nodeData, form]);

  const handleSave = () => {
    const formData = form.getValues();
    console.log('💾 Saving Merge Node configuration:', formData);
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const tabs = [
    { label: "General", value: "general" },
    { label: "Merge", value: "segments" },
    { label: "Preview", value: "preview" },
  ];

  const getCurrentTabIndex = () => tabs.findIndex(tab => tab.value === currentTab);
  const isFirstTab = getCurrentTabIndex() === 0;
  const isLastTab = getCurrentTabIndex() === tabs.length - 1;

  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1].value);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].value);
    }
  };

  const addSegment = () => {
    const currentSegments = form.getValues("segments");
    const newSegment = {
      id: Date.now().toString(),
      name: `Segment ${currentSegments.length + 1}`,
      condition: "",
      weight: 50
    };
    form.setValue("segments", [...currentSegments, newSegment]);
  };

  const removeSegment = (index: number) => {
    const currentSegments = form.getValues("segments");
    if (currentSegments.length > 1) {
      form.setValue("segments", currentSegments.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-1/2 !max-w-none h-[80vh] flex flex-col" style={{ width: '50vw', maxWidth: 'none' }}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <Input
                  value={form.watch("title")}
                  onChange={(e) => form.setValue("title", e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-lg font-semibold border-none p-0 h-auto"
                  autoFocus
                />
              ) : (
                <DialogTitle
                  className="text-lg font-semibold cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {form.watch("title")} <Pen className="w-4 h-4 inline ml-2" />
                </DialogTitle>
              )}
              
              {isEditingDescription ? (
                <Textarea
                  value={form.watch("description")}
                  onChange={(e) => form.setValue("description", e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  className="text-sm text-muted-foreground border-none p-0 h-auto resize-none"
                  autoFocus
                />
              ) : (
                <DialogDescription
                  className="text-sm text-muted-foreground cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {form.watch("description")} <Pen className="w-3 h-3 inline ml-2" />
                </DialogDescription>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <Card className="h-full">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <form id="merge-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Merge Process Configuration</FieldLabel>
                        <FieldDescription>
                          Configure the merge process to combine customer segments with logical operations
                        </FieldDescription>
                        <FieldContent>
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-medium text-blue-800 mb-2">Process Overview</h4>
                              <p className="text-sm text-blue-700">
                                This merge process accepts input from multiple cells and produces one combined output cell. 
                                You can choose to include or exclude content based on your campaign requirements.
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 rounded border">
                                <h5 className="font-medium text-sm mb-1">Input Requirements</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• At least 2 connected processes</li>
                                  <li>• Same audience level (e.g., Household)</li>
                                  <li>• Arrow connections from upstream processes</li>
                                </ul>
                              </div>
                              <div className="p-3 bg-gray-50 rounded border">
                                <h5 className="font-medium text-sm mb-1">Output</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Combined list of unique IDs</li>
                                  <li>• Duplicate IDs included only once</li>
                                  <li>• Excluded records removed</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="segments" className="space-y-4">
                    <FieldGroup>
                      <FieldLabel>Merge Configuration</FieldLabel>
                      <FieldDescription>
                        Configure which records to include and exclude in the merge operation
                      </FieldDescription>
                      
                      {/* Merge Method Selection */}
                      <Card className="p-4 mb-4">
                        <CardHeader>
                          <CardTitle className="text-sm">Merge Method</CardTitle>
                          <CardDescription>
                            Choose how to combine the records from included cells
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="mergeMethod" value="and" defaultChecked className="text-blue-600" />
                              <span className="text-sm">Match (AND) - Include only IDs that exist in ALL included cells</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="mergeMethod" value="or" className="text-blue-600" />
                              <span className="text-sm">Merge/Purge (OR) - Include IDs that exist in ANY included cell</span>
                            </label>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Include/Exclude Lists */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Records to Include */}
                        <Card className="p-4">
                          <CardHeader>
                            <CardTitle className="text-sm text-green-700">Records to Include</CardTitle>
                            <CardDescription>
                              IDs in these cells will be combined into the merged output
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 min-h-[200px] border-2 border-dashed border-green-200 rounded p-4">
                              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex justify-between items-center cursor-move">
                                <span>Gold.out (1,250 contacts)</span>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex justify-between items-center cursor-move">
                                <span>Platinum.out (890 contacts)</span>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex justify-between items-center cursor-move">
                                <span>LoyaltyProgram.out (2,100 contacts)</span>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex justify-between items-center cursor-move">
                                <span>OptOuts.out (45 contacts)</span>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-3 h-3" />
                              </Button>
                              </div>
                          </div>
                          </CardContent>
                        </Card>

                        {/* Records to Exclude */}
                        <Card className="p-4">
                          <CardHeader>
                            <CardTitle className="text-sm text-red-700">Records to Exclude</CardTitle>
                            <CardDescription>
                              IDs in these cells will be excluded from the merged output
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 min-h-[200px] border-2 border-dashed border-red-200 rounded p-4">
                              <div className="text-sm text-gray-500 text-center py-8">
                                Drag items here to exclude them from the merge
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                          </div>
                          
                    </FieldGroup>
                  </TabsContent>


                  <TabsContent value="preview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <EyeIcon className="w-5 h-5" />
                          Merge Summary
                        </CardTitle>
                        <CardDescription>
                          Review the merge configuration and expected results
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <h4 className="font-medium text-green-800 mb-2">Records to Include</h4>
                              <div className="space-y-1 text-sm">
                                <p>• Gold.out (1,250 contacts)</p>
                                <p>• Platinum.out (890 contacts)</p>
                                <p>• LoyaltyProgram.out (2,100 contacts)</p>
                                <p>• OptOuts.out (45 contacts)</p>
                                <p className="font-medium text-green-700">Total: 4,285 contacts</p>
                              </div>
                            </div>
                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                              <h4 className="font-medium text-red-800 mb-2">Records to Exclude</h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-500">No exclusions configured</p>
                                <p className="font-medium text-red-700">Total: 0 contacts</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                            <h4 className="font-medium text-blue-800 mb-2">Merge Configuration</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Method:</strong> Match (AND)</p>
                                <p><strong>Logic:</strong> Include only IDs that exist in ALL included cells</p>
                              </div>
                              <div>
                                <p><strong>Expected Output:</strong> ~890 unique contacts</p>
                                <p><strong>Note:</strong> Only contacts in ALL 4 cells will be included</p>
                              </div>
                            </div>
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </CardContent>

                <CardFooter className="flex-shrink-0 border-t pt-4">
                  <div className="flex justify-between items-center w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousTab}
                      disabled={isFirstTab}
                    >
                      ← Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {getCurrentTabIndex() + 1} of {tabs.length}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={goToNextTab}
                      disabled={isLastTab}
                    >
                      Next →
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Tabs>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
