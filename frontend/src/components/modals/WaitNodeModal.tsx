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
import { EyeIcon, Pen } from "lucide-react"

const formSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  
  // General Tab
  waitType: z.enum(["fixed", "next-day"]),
  waitDays: z.number().min(0, "Days cannot be negative."),
  waitHours: z.number().min(0, "Hours cannot be negative."),
  waitTime: z.string().optional(), // Time to resume (optional - defaults to current time for fixed, midnight for next-day)
  
  // For next-day wait
  waitUntilDay: z.enum([
    "monday", "tuesday", "wednesday", "thursday", 
    "friday", "saturday", "sunday", "business-day"
  ]).optional(),
  
  // Data Source Tab
  dataSource: z.enum(["static", "api", "database", "user-profile"]),
  apiEndpoint: z.string().optional(),
  sqlQuery: z.string().min(1, "Please enter a SQL query."),
  userField: z.string().optional(),
  
  // Schedule Tab
  scheduleMode: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  repeatMode: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant.").optional(),
  timezone: z.string().optional(),
})

const tabs = [
  {
    label: "General",
    value: "general",
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

// Helper function to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

interface WaitNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function WaitNodeModal({ isOpen, onClose, onSave, nodeData }: WaitNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [dataSource, setDataSource] = useState<string>("database");
  const [scheduleMode, setScheduleMode] = useState<boolean>(true);
  const [waitType, setWaitType] = useState<string>("fixed");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      // Basic Info
      title: nodeData?.title || "Wait Node",
      description: nodeData?.description || "Wait for a specified time before continuing",
      
      // General
      waitType: "fixed",
      waitDays: 0,
      waitHours: 0,
      waitTime: getCurrentTime(), // Default to current time
      waitUntilDay: "monday",
      
      // Data Source
      dataSource: "database",
      apiEndpoint: "",
      sqlQuery: "",
      userField: "",
      
      // Schedule
      scheduleMode: true,
      startDate: "",
      endDate: "",
      startTime: "09:00",
      endTime: "17:00",
      repeatMode: "none",
      maxParticipants: 100,
      timezone: "UTC",
    },
  })

  // Update form when nodeData changes
  useEffect(() => {
    if (nodeData) {
      form.reset({
        title: nodeData.title || "Wait Node",
        description: nodeData.description || "Wait for a specified time before continuing",
        waitType: nodeData.waitType || "fixed",
        waitDays: nodeData.waitDays || 0,
        waitHours: nodeData.waitHours || 0,
        waitTime: nodeData.waitTime || getCurrentTime(),
        waitUntilDay: nodeData.waitUntilDay || "monday",
        dataSource: nodeData.dataSource || "database",
        apiEndpoint: nodeData.apiEndpoint || "",
        sqlQuery: nodeData.sqlQuery || "",
        userField: nodeData.userField || "",
        scheduleMode: nodeData.scheduleMode ?? true,
        startDate: nodeData.startDate || "",
        endDate: nodeData.endDate || "",
        startTime: nodeData.startTime || "09:00",
        endTime: nodeData.endTime || "17:00",
        repeatMode: nodeData.repeatMode || "none",
        maxParticipants: nodeData.maxParticipants || 100,
        timezone: nodeData.timezone || "UTC",
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
    console.log('💾 Saving Wait Node configuration:', formData);
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
              <TabsList className="grid w-full grid-cols-4">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <form id="wait-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Wait Type</FieldLabel>
                        <FieldDescription>
                          Choose how long to wait before continuing
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="waitType"
                            render={({ field, fieldState }) => (
                              <>
                                <select
                                  {...field}
                                  value={waitType}
                                  onChange={(e) => {
                                    setWaitType(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="fixed">Fixed Duration</option>
                                  <option value="next-day">Until Next Day</option>
                                </select>
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      {waitType === "fixed" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel>Wait Days</FieldLabel>
                              <FieldDescription>
                                Number of days to wait
                              </FieldDescription>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="waitDays"
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
                              <FieldLabel>Wait Hours</FieldLabel>
                              <FieldDescription>
                                Number of hours to wait
                              </FieldDescription>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="waitHours"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} type="number" min="0" />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>
                          </div>

                          <Field>
                            <FieldLabel>Resume Time</FieldLabel>
                            <FieldDescription>
                              Time to resume the journey (optional)
                            </FieldDescription>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="waitTime"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input {...field} type="time" />
                                    <FieldError errors={[fieldState.error]} />
                                  </>
                                )}
                              />
                            </FieldContent>
                          </Field>
                        </>
                      )}

                      {waitType === "next-day" && (
                        <Field>
                          <FieldLabel>Wait Until</FieldLabel>
                          <FieldDescription>
                            Which day to resume the journey
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="waitUntilDay"
                              render={({ field, fieldState }) => (
                                <>
                                  <select {...field} className="w-full p-2 border rounded-md">
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                    <option value="business-day">Next Business Day</option>
                                  </select>
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
                          Choose how to get customer data for this wait point
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="dataSource"
                            render={({ field, fieldState }) => (
                              <>
                                <select
                                  {...field}
                                  value={dataSource}
                                  onChange={(e) => {
                                    setDataSource(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="static">Static Data</option>
                                  <option value="api">API Endpoint</option>
                                  <option value="database">Database Query</option>
                                  <option value="user-profile">User Profile</option>
                                </select>
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      {dataSource === "api" && (
                        <Field>
                          <FieldLabel>API Endpoint</FieldLabel>
                          <FieldDescription>
                            Enter the API endpoint URL
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="apiEndpoint"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="https://api.example.com/wait-data" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      )}

                      {dataSource === "database" && (
                        <Field>
                          <FieldLabel>SQL Query</FieldLabel>
                          <FieldDescription>
                            Enter the SQL query to get customer data
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="sqlQuery"
                              render={({ field, fieldState }) => (
                                <>
                                  <Textarea
                                    {...field}
                                    placeholder="SELECT * FROM customers WHERE wait_condition = true"
                                    rows={4}
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      )}

                      {dataSource === "user-profile" && (
                        <Field>
                          <FieldLabel>User Field</FieldLabel>
                          <FieldDescription>
                            Enter the user field to check
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="userField"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="last_activity, subscription_status" />
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
                          Enable scheduling for this wait point
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

                          <div className="grid grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel>Start Time</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="startTime"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} type="time" />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>

                            <Field>
                              <FieldLabel>End Time</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="endTime"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} type="time" />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>
                          </div>

                          <Field>
                            <FieldLabel>Repeat Mode</FieldLabel>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="repeatMode"
                                render={({ field, fieldState }) => (
                                  <>
                                    <select {...field} className="w-full p-2 border rounded-md">
                                      <option value="none">No Repeat</option>
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

                          <Field>
                            <FieldLabel>Max Participants</FieldLabel>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="maxParticipants"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input {...field} type="number" min="1" />
                                    <FieldError errors={[fieldState.error]} />
                                  </>
                                )}
                              />
                            </FieldContent>
                          </Field>

                          <Field>
                            <FieldLabel>Timezone</FieldLabel>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="timezone"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input {...field} placeholder="UTC" />
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
                          <EyeIcon className="w-5 h-5" />
                          Preview
                        </CardTitle>
                        <CardDescription>
                          Preview of your wait node configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Title:</strong> {form.watch("title")}</p>
                          <p><strong>Description:</strong> {form.watch("description")}</p>
                          <p><strong>Wait Type:</strong> {form.watch("waitType")}</p>
                          {form.watch("waitType") === "fixed" && (
                            <>
                              <p><strong>Wait Days:</strong> {form.watch("waitDays")}</p>
                              <p><strong>Wait Hours:</strong> {form.watch("waitHours")}</p>
                              <p><strong>Resume Time:</strong> {form.watch("waitTime")}</p>
                            </>
                          )}
                          {form.watch("waitType") === "next-day" && (
                            <p><strong>Wait Until:</strong> {form.watch("waitUntilDay")}</p>
                          )}
                          <p><strong>Data Source:</strong> {form.watch("dataSource")}</p>
                          {form.watch("scheduleMode") && (
                            <>
                              <p><strong>Start Date:</strong> {form.watch("startDate")}</p>
                              <p><strong>End Date:</strong> {form.watch("endDate")}</p>
                              <p><strong>Start Time:</strong> {form.watch("startTime")}</p>
                              <p><strong>End Time:</strong> {form.watch("endTime")}</p>
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
