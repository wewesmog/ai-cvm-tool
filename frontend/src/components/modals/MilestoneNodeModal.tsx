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
import { EyeIcon, Pen, MapPin, Calendar, Award } from "lucide-react"

const formSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  
  // Milestone Configuration
  milestoneType: z.enum(["checkpoint", "achievement", "milestone", "landmark"]),
  category: z.enum(["user-journey", "business", "technical", "marketing", "custom"]),
  importance: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  
  // Tracking
  trackCompletion: z.boolean().default(true),
  autoTrigger: z.boolean().default(false),
  completionCriteria: z.string().optional(),
  
  // Data Source
  dataSource: z.enum(["api", "database", "analytics", "manual"]),
  apiEndpoint: z.string().optional(),
  sqlQuery: z.string().optional(),
  analyticsEvent: z.string().optional(),
  
  // Schedule & Timing
  scheduleMode: z.boolean().default(false),
  targetDate: z.string().optional(),
  reminderDate: z.string().optional(),
  reminderInterval: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  
  // Rewards & Actions
  hasReward: z.boolean().default(false),
  rewardType: z.enum(["points", "badge", "certificate", "notification", "custom"]).optional(),
  rewardValue: z.string().optional(),
  triggerAction: z.boolean().default(false),
  actionType: z.enum(["email", "sms", "webhook", "database"]).optional(),
  actionConfig: z.string().optional(),
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
    label: "Rewards",
    value: "rewards",
  },
  {
    label: "Preview",
    value: "preview",
  },
]

interface MilestoneNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function MilestoneNodeModal({ isOpen, onClose, onSave, nodeData }: MilestoneNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      // Basic Info
      title: nodeData?.title || "Milestone Node",
      description: nodeData?.description || "Mark an important checkpoint or achievement in the journey",
      
      // Milestone Configuration
      milestoneType: "checkpoint",
      category: "user-journey",
      importance: "medium",
      
      // Tracking
      trackCompletion: true,
      autoTrigger: false,
      completionCriteria: "",
      
      // Data Source
      dataSource: "manual",
      apiEndpoint: "",
      sqlQuery: "",
      analyticsEvent: "",
      
      // Schedule & Timing
      scheduleMode: false,
      targetDate: "",
      reminderDate: "",
      reminderInterval: "none",
      
      // Rewards & Actions
      hasReward: false,
      rewardType: "notification",
      rewardValue: "",
      triggerAction: false,
      actionType: "email",
      actionConfig: "",
    },
  })

  // Update form when nodeData changes
  useEffect(() => {
    if (nodeData) {
      form.reset({
        title: nodeData.title || "Milestone Node",
        description: nodeData.description || "Mark an important checkpoint or achievement in the journey",
        milestoneType: nodeData.milestoneType || "checkpoint",
        category: nodeData.category || "user-journey",
        importance: nodeData.importance || "medium",
        trackCompletion: nodeData.trackCompletion ?? true,
        autoTrigger: nodeData.autoTrigger ?? false,
        completionCriteria: nodeData.completionCriteria || "",
        dataSource: nodeData.dataSource || "manual",
        apiEndpoint: nodeData.apiEndpoint || "",
        sqlQuery: nodeData.sqlQuery || "",
        analyticsEvent: nodeData.analyticsEvent || "",
        scheduleMode: nodeData.scheduleMode ?? false,
        targetDate: nodeData.targetDate || "",
        reminderDate: nodeData.reminderDate || "",
        reminderInterval: nodeData.reminderInterval || "none",
        hasReward: nodeData.hasReward ?? false,
        rewardType: nodeData.rewardType || "notification",
        rewardValue: nodeData.rewardValue || "",
        triggerAction: nodeData.triggerAction ?? false,
        actionType: nodeData.actionType || "email",
        actionConfig: nodeData.actionConfig || "",
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
    console.log('💾 Saving Milestone Node configuration:', formData);
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
              <TabsList className="grid w-full grid-cols-6">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <form id="milestone-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Milestone Type</FieldLabel>
                        <FieldDescription>
                          What type of milestone is this?
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="milestoneType"
                            render={({ field, fieldState }) => (
                              <>
                                <select {...field} className="w-full p-2 border rounded-md">
                                  <option value="checkpoint">Checkpoint</option>
                                  <option value="achievement">Achievement</option>
                                  <option value="milestone">Milestone</option>
                                  <option value="landmark">Landmark</option>
                                </select>
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Category</FieldLabel>
                          <FieldDescription>
                            What category does this milestone belong to?
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="category"
                              render={({ field, fieldState }) => (
                                <>
                                  <select {...field} className="w-full p-2 border rounded-md">
                                    <option value="user-journey">User Journey</option>
                                    <option value="business">Business</option>
                                    <option value="technical">Technical</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="custom">Custom</option>
                                  </select>
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel>Importance</FieldLabel>
                          <FieldDescription>
                            How important is this milestone?
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="importance"
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
                        <FieldLabel>Track Completion</FieldLabel>
                        <FieldDescription>
                          Enable completion tracking for this milestone
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="trackCompletion"
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
                        <FieldLabel>Auto Trigger</FieldLabel>
                        <FieldDescription>
                          Automatically trigger when conditions are met
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="autoTrigger"
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
                        <FieldLabel>Completion Criteria</FieldLabel>
                        <FieldDescription>
                          What conditions must be met to complete this milestone?
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="completionCriteria"
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea
                                  {...field}
                                  placeholder="e.g., User completes profile, makes first purchase, reaches 100 points"
                                  rows={3}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="data-source" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Data Source</FieldLabel>
                        <FieldDescription>
                          How to detect milestone completion
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="dataSource"
                            render={({ field, fieldState }) => (
                              <>
                                <select {...field} className="w-full p-2 border rounded-md">
                                  <option value="manual">Manual</option>
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
                            URL to check milestone status
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="apiEndpoint"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="https://api.example.com/milestones" />
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
                            Query to check milestone completion
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="sqlQuery"
                              render={({ field, fieldState }) => (
                                <>
                                  <Textarea
                                    {...field}
                                    placeholder="SELECT COUNT(*) FROM user_actions WHERE action = 'milestone_completed'"
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
                            Event name to track milestone completion
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="analyticsEvent"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="milestone_reached, achievement_unlocked" />
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
                          Enable scheduling for this milestone
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
                              <FieldLabel>Target Date</FieldLabel>
                              <FieldDescription>
                                When should this milestone be reached?
                              </FieldDescription>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="targetDate"
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
                              <FieldLabel>Reminder Date</FieldLabel>
                              <FieldDescription>
                                When to send reminders
                              </FieldDescription>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="reminderDate"
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
                              How often to send reminders
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

                  <TabsContent value="rewards" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Has Reward</FieldLabel>
                        <FieldDescription>
                          Does completing this milestone give a reward?
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="hasReward"
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

                      {form.watch("hasReward") && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel>Reward Type</FieldLabel>
                              <FieldDescription>
                                What type of reward to give
                              </FieldDescription>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="rewardType"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <select {...field} className="w-full p-2 border rounded-md">
                                        <option value="points">Points</option>
                                        <option value="badge">Badge</option>
                                        <option value="certificate">Certificate</option>
                                        <option value="notification">Notification</option>
                                        <option value="custom">Custom</option>
                                      </select>
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>

                            <Field>
                              <FieldLabel>Reward Value</FieldLabel>
                              <FieldDescription>
                                Value or description of the reward
                              </FieldDescription>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="rewardValue"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} placeholder="100 points, Gold Badge, etc." />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>
                          </div>
                        </>
                      )}

                      <Field>
                        <FieldLabel>Trigger Action</FieldLabel>
                        <FieldDescription>
                          Should completing this milestone trigger an action?
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="triggerAction"
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

                      {form.watch("triggerAction") && (
                        <>
                          <Field>
                            <FieldLabel>Action Type</FieldLabel>
                            <FieldDescription>
                              What action to trigger
                            </FieldDescription>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="actionType"
                                render={({ field, fieldState }) => (
                                  <>
                                    <select {...field} className="w-full p-2 border rounded-md">
                                      <option value="email">Send Email</option>
                                      <option value="sms">Send SMS</option>
                                      <option value="webhook">Call Webhook</option>
                                      <option value="database">Update Database</option>
                                    </select>
                                    <FieldError errors={[fieldState.error]} />
                                  </>
                                )}
                              />
                            </FieldContent>
                          </Field>

                          <Field>
                            <FieldLabel>Action Configuration</FieldLabel>
                            <FieldDescription>
                              Configuration for the action (email template, webhook URL, etc.)
                            </FieldDescription>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="actionConfig"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Textarea
                                      {...field}
                                      placeholder="Email template, webhook URL, database query, etc."
                                      rows={3}
                                    />
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
                          <MapPin className="w-5 h-5" />
                          Preview
                        </CardTitle>
                        <CardDescription>
                          Preview of your milestone node configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Title:</strong> {form.watch("title")}</p>
                          <p><strong>Description:</strong> {form.watch("description")}</p>
                          <p><strong>Milestone Type:</strong> {form.watch("milestoneType")}</p>
                          <p><strong>Category:</strong> {form.watch("category")}</p>
                          <p><strong>Importance:</strong> {form.watch("importance")}</p>
                          <p><strong>Track Completion:</strong> {form.watch("trackCompletion") ? "Yes" : "No"}</p>
                          <p><strong>Auto Trigger:</strong> {form.watch("autoTrigger") ? "Yes" : "No"}</p>
                          <p><strong>Data Source:</strong> {form.watch("dataSource")}</p>
                          {form.watch("hasReward") && (
                            <>
                              <p><strong>Reward Type:</strong> {form.watch("rewardType")}</p>
                              <p><strong>Reward Value:</strong> {form.watch("rewardValue")}</p>
                            </>
                          )}
                          {form.watch("triggerAction") && (
                            <>
                              <p><strong>Action Type:</strong> {form.watch("actionType")}</p>
                              <p><strong>Action Config:</strong> {form.watch("actionConfig")}</p>
                            </>
                          )}
                          {form.watch("scheduleMode") && (
                            <>
                              <p><strong>Target Date:</strong> {form.watch("targetDate")}</p>
                              <p><strong>Reminder Date:</strong> {form.watch("reminderDate")}</p>
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
