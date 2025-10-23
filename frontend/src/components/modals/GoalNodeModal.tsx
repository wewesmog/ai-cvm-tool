"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, Pen, Target } from "lucide-react"

const formSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  
  // Goal Configuration
  goalType: z.enum(["conversion", "engagement", "retention", "custom"]),
  targetValue: z.number().min(0, "Target value must be positive").optional(),
  targetMetric: z.string().optional(),
  timeFrame: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  
  // Tracking
  trackProgress: z.boolean().default(true),
  autoComplete: z.boolean().default(false),
  completionThreshold: z.number().min(0).max(100).optional(),
  
  // Data Source
  dataSource: z.enum(["api", "database", "analytics"]),
  apiEndpoint: z.string().optional(),
  sqlQuery: z.string().optional(),
  analyticsEvent: z.string().optional(),
  
  // Schedule
  scheduleMode: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reminderInterval: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
})

const tabs = [
  {
    label: "General",
    value: "general",
  },
  {
    label: "Tracking",
    value: "tracking",
  },
  {
    label: "Data Source",
    value: "data-source",
  },
  {
    label: "Schedule",
    value: "schedule",
  },
  {
    label: "Preview",
    value: "preview",
  },
]

interface GoalNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function GoalNodeModal({ isOpen, onClose, onSave, nodeData }: GoalNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      // Basic Info
      title: nodeData?.title || "Goal Node",
      description: nodeData?.description || "Define a specific objective or target to achieve",
      
      // Goal Configuration
      goalType: "conversion",
      targetValue: undefined,
      targetMetric: "",
      timeFrame: "monthly",
      priority: "medium",
      
      // Tracking
      trackProgress: true,
      autoComplete: false,
      completionThreshold: 100,
      
      // Data Source
      dataSource: "database",
      apiEndpoint: "",
      sqlQuery: "",
      analyticsEvent: "",
      
      // Schedule
      scheduleMode: false,
      startDate: "",
      endDate: "",
      reminderInterval: "none",
    },
  })

  // Update form when nodeData changes
  useEffect(() => {
    if (nodeData) {
      form.reset({
        title: nodeData.title || "Goal Node",
        description: nodeData.description || "Define a specific objective or target to achieve",
        goalType: nodeData.goalType || "conversion",
        targetValue: nodeData.targetValue,
        targetMetric: nodeData.targetMetric || "",
        timeFrame: nodeData.timeFrame || "monthly",
        priority: nodeData.priority || "medium",
        trackProgress: nodeData.trackProgress ?? true,
        autoComplete: nodeData.autoComplete ?? false,
        completionThreshold: nodeData.completionThreshold || 100,
        dataSource: nodeData.dataSource || "database",
        apiEndpoint: nodeData.apiEndpoint || "",
        sqlQuery: nodeData.sqlQuery || "",
        analyticsEvent: nodeData.analyticsEvent || "",
        scheduleMode: nodeData.scheduleMode ?? false,
        startDate: nodeData.startDate || "",
        endDate: nodeData.endDate || "",
        reminderInterval: nodeData.reminderInterval || "none",
      });
    }
  }, [nodeData, form]);

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

  const handleSave = () => {
    const formData = form.getValues();
    console.log('💾 Saving Goal Node configuration:', formData);
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    form.reset();
    onClose();
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
                Save
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          <Card className="h-full">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <form id="goal-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Goal Type</FieldLabel>
                        <FieldDescription>
                          What type of goal is this?
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="goalType"
                            render={({ field, fieldState }) => (
                              <>
                                <select {...field} className="w-full p-2 border rounded-md">
                                  <option value="conversion">Conversion</option>
                                  <option value="engagement">Engagement</option>
                                  <option value="retention">Retention</option>
                                  <option value="custom">Custom</option>
                                </select>
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Target Value</FieldLabel>
                          <FieldDescription>
                            The target number to achieve
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="targetValue"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} type="number" min="0" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel>Target Metric</FieldLabel>
                          <FieldDescription>
                            What metric to track (e.g., "sales", "signups", "views")
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="targetMetric"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="sales, signups, views" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Time Frame</FieldLabel>
                          <FieldDescription>
                            How often to measure progress
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="timeFrame"
                              render={({ field, fieldState }) => (
                                <>
                                  <select {...field} className="w-full p-2 border rounded-md">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                  </select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel>Priority</FieldLabel>
                          <FieldDescription>
                            How important is this goal?
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="priority"
                              render={({ field, fieldState }) => (
                                <>
                                  <select {...field} className="w-full p-2 border rounded-md">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                  </select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      </div>
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="tracking" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Track Progress</FieldLabel>
                        <FieldDescription>
                          Enable progress tracking for this goal
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="trackProgress"
                            render={({ field, fieldState }) => (
                              <>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Auto Complete</FieldLabel>
                        <FieldDescription>
                          Automatically mark as complete when threshold is reached
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="autoComplete"
                            render={({ field, fieldState }) => (
                              <>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      {form.watch("autoComplete") && (
                        <Field>
                          <FieldLabel>Completion Threshold (%)</FieldLabel>
                          <FieldDescription>
                            Percentage of target value to consider complete
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="completionThreshold"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} type="number" min="0" max="100" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      )}
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="data-source" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Data Source</FieldLabel>
                        <FieldDescription>
                          Where to get goal tracking data from
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="dataSource"
                            render={({ field, fieldState }) => (
                              <>
                                <select {...field} className="w-full p-2 border rounded-md">
                                  <option value="api">API Endpoint</option>
                                  <option value="database">Database Query</option>
                                  <option value="analytics">Analytics Event</option>
                                </select>
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      {form.watch("dataSource") === "api" && (
                        <Field>
                          <FieldLabel>API Endpoint</FieldLabel>
                          <FieldDescription>
                            URL to fetch goal data from
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="apiEndpoint"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="https://api.example.com/goals" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      )}

                      {form.watch("dataSource") === "database" && (
                        <Field>
                          <FieldLabel>SQL Query</FieldLabel>
                          <FieldDescription>
                            Query to get goal progress data
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="sqlQuery"
                              render={({ field, fieldState }) => (
                                <>
                                  <Textarea
                                    {...field}
                                    placeholder="SELECT COUNT(*) FROM conversions WHERE date &gt;= ?"
                                    rows={3}
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      )}

                      {form.watch("dataSource") === "analytics" && (
                        <Field>
                          <FieldLabel>Analytics Event</FieldLabel>
                          <FieldDescription>
                            Event name to track in analytics
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="analyticsEvent"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="goal_completed, purchase, signup" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      )}
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Schedule Mode</FieldLabel>
                        <FieldDescription>
                          Enable scheduling for goal tracking
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="scheduleMode"
                            render={({ field, fieldState }) => (
                              <>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      {form.watch("scheduleMode") && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel>Start Date</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="startDate"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} type="date" />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>

                            <Field>
                              <FieldLabel>End Date</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="endDate"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} type="date" />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>
                          </div>

                          <Field>
                            <FieldLabel>Reminder Interval</FieldLabel>
                            <FieldDescription>
                              How often to send progress reminders
                            </FieldDescription>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="reminderInterval"
                                render={({ field, fieldState }) => (
                                  <>
                                    <select {...field} className="w-full p-2 border rounded-md">
                                      <option value="none">No Reminders</option>
                                      <option value="daily">Daily</option>
                                      <option value="weekly">Weekly</option>
                                      <option value="monthly">Monthly</option>
                                    </select>
                                    <FieldError errors={[fieldState.error]} />
                                  </>
                                )}
                              />
                            </FieldContent>
                          </Field>
                        </>
                      )}
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Preview
                        </CardTitle>
                        <CardDescription>
                          Preview of your goal node configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Title:</strong> {form.watch("title")}</p>
                          <p><strong>Description:</strong> {form.watch("description")}</p>
                          <p><strong>Goal Type:</strong> {form.watch("goalType")}</p>
                          <p><strong>Target Value:</strong> {form.watch("targetValue") || "Not set"}</p>
                          <p><strong>Target Metric:</strong> {form.watch("targetMetric") || "Not set"}</p>
                          <p><strong>Time Frame:</strong> {form.watch("timeFrame")}</p>
                          <p><strong>Priority:</strong> {form.watch("priority")}</p>
                          <p><strong>Track Progress:</strong> {form.watch("trackProgress") ? "Yes" : "No"}</p>
                          <p><strong>Auto Complete:</strong> {form.watch("autoComplete") ? "Yes" : "No"}</p>
                          <p><strong>Data Source:</strong> {form.watch("dataSource")}</p>
                          {form.watch("scheduleMode") && (
                            <>
                              <p><strong>Start Date:</strong> {form.watch("startDate")}</p>
                              <p><strong>End Date:</strong> {form.watch("endDate")}</p>
                              <p><strong>Reminder Interval:</strong> {form.watch("reminderInterval")}</p>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </CardContent>

                <CardFooter className="flex-shrink-0 border-t pt-4">
                  {/* Tab Navigation */}
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
  )
}
