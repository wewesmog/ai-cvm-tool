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
import { EyeIcon, Pen, Plus, Trash2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const formSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  
  // General Tab
  branches: z.number().min(2, "Must have at least 2 branches").max(10, "Maximum 10 branches"),
  randomSample: z.boolean().default(false),
  sampleSize: z.number().min(1, "Sample size must be at least 1").optional(),
  useSampleSize: z.boolean().default(false),
  randomSeed: z.number().optional(),
  
  // Branch Configs
  branchConfigs: z.array(z.object({
    title: z.string().min(1, "Branch title is required"),
    description: z.string().optional(),
    dataSource: z.enum(["api", "safary clique", "database"]),
    sqlQuery: z.string().min(1, "SQL query is required"),
    apiEndpoint: z.string().optional(),
    userField: z.string().optional(),
  })).optional(),
  
  // Data Source Tab (legacy)
  dataSource: z.enum(["api", "safary clique", "database"]),
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
    label: "Branches",
    value: "branches",
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

interface DecisionNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function DecisionNodeModal({ isOpen, onClose, onSave, nodeData }: DecisionNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [dataSource, setDataSource] = useState<string>("database");
  const [scheduleMode, setScheduleMode] = useState<boolean>(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingBranchTitle, setEditingBranchTitle] = useState<number | null>(null);
  const [editingBranchDesc, setEditingBranchDesc] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      // Basic Info
      title: nodeData?.title || "Decision Node",
      description: nodeData?.description || "Split customers based on conditions",
      
      // General
      branches: 2,
      randomSample: false,
      sampleSize: 1000,
      useSampleSize: false,
      randomSeed: undefined,
      
      // Branch Configs
      branchConfigs: [
        {
          title: "Branch 1",
          description: "",
          dataSource: "database" as const,
          sqlQuery: "",
          apiEndpoint: "",
          userField: "",
        },
        {
          title: "Branch 2", 
          description: "",
          dataSource: "database" as const,
          sqlQuery: "",
          apiEndpoint: "",
          userField: "",
        }
      ],
      
      // Data Source (legacy)
      dataSource: "database",
      apiEndpoint: "",
      sqlQuery: "",
      userField: "",
      
      // Schedule
      scheduleMode: true,
    },
  })

  // Update form when nodeData changes
  useEffect(() => {
    if (nodeData) {
      form.reset({
        title: nodeData.title || "Decision Node",
        description: nodeData.description || "Split customers based on conditions",
        branches: nodeData.branches || 2,
        randomSample: nodeData.randomSample ?? false,
        sampleSize: nodeData.sampleSize || 1000,
        useSampleSize: nodeData.useSampleSize ?? false,
        randomSeed: nodeData.randomSeed,
        branchConfigs: nodeData.branchConfigs || [
          {
            title: "Branch 1",
            description: "",
            dataSource: "database" as const,
            sqlQuery: "",
            apiEndpoint: "",
            userField: "",
          },
          {
            title: "Branch 2", 
            description: "",
            dataSource: "database" as const,
            sqlQuery: "",
            apiEndpoint: "",
            userField: "",
          }
        ],
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

  // Function to update branch configs when number of branches changes
  const updateBranchConfigs = (newBranches: number) => {
    const currentConfigs = form.getValues("branchConfigs") || [];
    const newConfigs = [];
    
    for (let i = 0; i < newBranches; i++) {
      if (currentConfigs[i]) {
        newConfigs.push(currentConfigs[i]);
      } else {
        newConfigs.push({
          title: `Branch ${i + 1}`,
          description: "",
          dataSource: "database" as const,
          sqlQuery: "",
          apiEndpoint: "",
          userField: "",
        });
      }
    }
    
    form.setValue("branchConfigs", newConfigs);
  };

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
    console.log('💾 Saving Decision Node configuration:', formData);
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

              <form id="decision-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Number of Branches</FieldLabel>
                        <FieldDescription>
                          How many branches should this decision node have?
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="branches"
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  {...field}
                                  type="number"
                                  min="2"
                                  max="10"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange(value);
                                    updateBranchConfigs(value);
                                  }}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Random Sample</FieldLabel>
                        <FieldDescription>
                          Enable random sampling for testing
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="randomSample"
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

                      {form.watch("randomSample") && (
                        <>
                          <Field>
                            <FieldLabel>Use Sample Size</FieldLabel>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="useSampleSize"
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

                          {form.watch("useSampleSize") && (
                            <Field>
                              <FieldLabel>Sample Size</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={form.control}
                                  name="sampleSize"
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input {...field} type="number" min="1" />
                                      <FieldError errors={[fieldState.error]} />
                                    </>
                                  )}
                                />
                              </FieldContent>
                            </Field>
                          )}

                          <Field>
                            <FieldLabel>Random Seed (Optional)</FieldLabel>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="randomSeed"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input {...field} type="number" />
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

                  <TabsContent value="branches" className="space-y-4">
                    <Accordion type="multiple" className="w-full">
                      {form.watch("branchConfigs")?.map((branch, index) => (
                        <AccordionItem key={index} value={`branch-${index}`}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              {editingBranchTitle === index ? (
                                <Input
                                  value={branch.title}
                                  onChange={(e) => {
                                    const newConfigs = [...(form.getValues("branchConfigs") || [])];
                                    newConfigs[index] = { ...newConfigs[index], title: e.target.value };
                                    form.setValue("branchConfigs", newConfigs);
                                  }}
                                  onBlur={() => setEditingBranchTitle(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setEditingBranchTitle(null);
                                    }
                                  }}
                                  className="text-sm font-medium border-none p-0 h-auto"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="text-sm font-medium cursor-pointer hover:bg-gray-50 p-1 rounded"
                                  onClick={() => setEditingBranchTitle(index)}
                                >
                                  {branch.title} <Pen className="w-3 h-3 inline ml-1" />
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <Field>
                                <FieldLabel>Description</FieldLabel>
                                <FieldContent>
                                  {editingBranchDesc === index ? (
                                    <Textarea
                                      value={branch.description}
                                      onChange={(e) => {
                                        const newConfigs = [...(form.getValues("branchConfigs") || [])];
                                        newConfigs[index] = { ...newConfigs[index], description: e.target.value };
                                        form.setValue("branchConfigs", newConfigs);
                                      }}
                                      onBlur={() => setEditingBranchDesc(null)}
                                      className="text-sm border-none p-0 h-auto resize-none"
                                      autoFocus
                                    />
                                  ) : (
                                    <div
                                      className="text-sm text-muted-foreground cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[20px]"
                                      onClick={() => setEditingBranchDesc(index)}
                                    >
                                      {branch.description || "Click to add description"} <Pen className="w-3 h-3 inline ml-1" />
                                    </div>
                                  )}
                                </FieldContent>
                              </Field>

                              <Field>
                                <FieldLabel>Data Source</FieldLabel>
                                <FieldContent>
                                  <select
                                    value={branch.dataSource}
                                    onChange={(e) => {
                                      const newConfigs = [...(form.getValues("branchConfigs") || [])];
                                      newConfigs[index] = { ...newConfigs[index], dataSource: e.target.value as any };
                                      form.setValue("branchConfigs", newConfigs);
                                    }}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="api">API Endpoint</option>
                                    <option value="safary clique">Safary Clique</option>
                                    <option value="database">Database Query</option>
                                  </select>
                                </FieldContent>
                              </Field>

                              {branch.dataSource === "database" && (
                                <Field>
                                  <FieldLabel>SQL Query</FieldLabel>
                                  <FieldContent>
                                    <Textarea
                                      value={branch.sqlQuery}
                                      onChange={(e) => {
                                        const newConfigs = [...(form.getValues("branchConfigs") || [])];
                                        newConfigs[index] = { ...newConfigs[index], sqlQuery: e.target.value };
                                        form.setValue("branchConfigs", newConfigs);
                                      }}
                                      placeholder="SELECT * FROM customers WHERE condition = 'value'"
                                      rows={3}
                                    />
                                  </FieldContent>
                                </Field>
                              )}

                              {branch.dataSource === "api" && (
                                <Field>
                                  <FieldLabel>API Endpoint</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      value={branch.apiEndpoint}
                                      onChange={(e) => {
                                        const newConfigs = [...(form.getValues("branchConfigs") || [])];
                                        newConfigs[index] = { ...newConfigs[index], apiEndpoint: e.target.value };
                                        form.setValue("branchConfigs", newConfigs);
                                      }}
                                      placeholder="https://api.example.com/branch-data"
                                    />
                                  </FieldContent>
                                </Field>
                              )}

                              {branch.dataSource === "safary clique" && (
                                <Field>
                                  <FieldLabel>User Field</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      value={branch.userField}
                                      onChange={(e) => {
                                        const newConfigs = [...(form.getValues("branchConfigs") || [])];
                                        newConfigs[index] = { ...newConfigs[index], userField: e.target.value };
                                        form.setValue("branchConfigs", newConfigs);
                                      }}
                                      placeholder="user_id, email, phone"
                                    />
                                  </FieldContent>
                                </Field>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="data-source" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Data Source</FieldLabel>
                        <FieldDescription>
                          Choose how to get customer data for this decision point
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
                                  <option value="api">API Endpoint</option>
                                  <option value="safary clique">Safary Clique</option>
                                  <option value="database">Database Query</option>
                                </select>
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

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
                                    placeholder="SELECT * FROM customers WHERE status = 'active'"
                                    rows={4}
                                  />
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
                          Enable scheduling for this decision point
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
                          Preview of your decision node configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Title:</strong> {form.watch("title")}</p>
                          <p><strong>Description:</strong> {form.watch("description")}</p>
                          <p><strong>Branches:</strong> {form.watch("branches")}</p>
                          <p><strong>Random Sample:</strong> {form.watch("randomSample") ? "Yes" : "No"}</p>
                          {form.watch("randomSample") && (
                            <>
                              <p><strong>Sample Size:</strong> {form.watch("sampleSize")}</p>
                              <p><strong>Random Seed:</strong> {form.watch("randomSeed") || "None"}</p>
                            </>
                          )}
                          <div>
                            <strong>Branch Configurations:</strong>
                            <ul className="ml-4 mt-1">
                              {form.watch("branchConfigs")?.map((branch, index) => (
                                <li key={index} className="text-sm">
                                  {branch.title}: {branch.dataSource}
                                </li>
                              ))}
                            </ul>
                          </div>
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
