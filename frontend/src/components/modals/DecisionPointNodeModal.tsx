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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, Pen } from "lucide-react"

const formSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  
  // Decision Point Configuration
  condition: z.string().min(1, "Condition is required"),
  yesAction: z.string().min(1, "Yes action is required"),
  noAction: z.string().min(1, "No action is required"),
  yesDescription: z.string().optional(),
  noDescription: z.string().optional(),
  
  // Edge Labels (for displaying on connections)
  yesLabel: z.string().default("Yes"),
  noLabel: z.string().default("No"),
})

const tabs = [
  {
    label: "General",
    value: "general",
  },
  {
    label: "Preview",
    value: "preview",
  },
]

interface DecisionPointNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function DecisionPointNodeModal({ isOpen, onClose, onSave, nodeData }: DecisionPointNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Basic Info
      title: nodeData?.title || "Decision Point",
      description: nodeData?.description || "Simple Yes/No decision point",
      
      // Decision Point Configuration
      condition: nodeData?.condition || "",
      yesAction: nodeData?.yesAction || "Yes",
      noAction: nodeData?.noAction || "No",
      yesDescription: nodeData?.yesDescription || "",
      noDescription: nodeData?.noDescription || "",
      
      // Edge Labels
      yesLabel: nodeData?.yesLabel || "Yes",
      noLabel: nodeData?.noLabel || "No",
    },
  })

  // Update form when nodeData changes
  useEffect(() => {
    if (nodeData) {
      form.reset({
        title: nodeData.title || "Decision Point",
        description: nodeData.description || "Simple Yes/No decision point",
        condition: nodeData.condition || "",
        yesAction: nodeData.yesAction || "Yes",
        noAction: nodeData.noAction || "No",
        yesDescription: nodeData.yesDescription || "",
        noDescription: nodeData.noDescription || "",
        yesLabel: nodeData.yesLabel || "Yes",
        noLabel: nodeData.noLabel || "No",
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
    console.log('💾 Saving Decision Point Node configuration:', formData);
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
              <TabsList className="grid w-full grid-cols-2">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <form id="decision-point-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Condition</FieldLabel>
                        <FieldDescription>
                          The condition to evaluate (e.g., "user.age &gt; 18", "subscription.active &eq;&eq; true")
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="condition"
                            render={({ field, fieldState }) => (
                              <>
                                <Input {...field} placeholder="user.age &gt; 18" />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Yes Action</FieldLabel>
                          <FieldDescription>
                            Label for the "Yes" branch
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="yesAction"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="Yes" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel>No Action</FieldLabel>
                          <FieldDescription>
                            Label for the "No" branch
                          </FieldDescription>
                          <FieldContent>
                            <Controller
                              control={form.control}
                              name="noAction"
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="No" />
                                  <FieldError errors={[fieldState.error]} />
                                </>
                              )}
                            />
                          </FieldContent>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel>Yes Description</FieldLabel>
                        <FieldDescription>
                          Description of what happens when condition is true
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="yesDescription"
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea 
                                  {...field} 
                                  placeholder="What happens when condition is true"
                                  rows={2}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>No Description</FieldLabel>
                        <FieldDescription>
                          Description of what happens when condition is false
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="noDescription"
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea 
                                  {...field} 
                                  placeholder="What happens when condition is false"
                                  rows={2}
                                />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <div className="border-t pt-4 mt-6">
                        <h3 className="text-sm font-medium mb-3">Edge Labels (shown on connections)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Yes Edge Label</FieldLabel>
                            <FieldDescription>
                              Label shown on the Yes connection
                            </FieldDescription>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="yesLabel"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input {...field} placeholder="Yes" />
                                    <FieldError errors={[fieldState.error]} />
                                  </>
                                )}
                              />
                            </FieldContent>
                          </Field>

                          <Field>
                            <FieldLabel>No Edge Label</FieldLabel>
                            <FieldDescription>
                              Label shown on the No connection
                            </FieldDescription>
                            <FieldContent>
                              <Controller
                                control={form.control}
                                name="noLabel"
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input {...field} placeholder="No" />
                                    <FieldError errors={[fieldState.error]} />
                                  </>
                                )}
                              />
                            </FieldContent>
                          </Field>
                        </div>
                      </div>
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
                          Preview of your decision point node configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Title:</strong> {form.watch("title")}</p>
                          <p><strong>Description:</strong> {form.watch("description")}</p>
                          <p><strong>Condition:</strong> {form.watch("condition")}</p>
                          <p><strong>Yes Action:</strong> {form.watch("yesAction")}</p>
                          <p><strong>No Action:</strong> {form.watch("noAction")}</p>
                          <p><strong>Yes Description:</strong> {form.watch("yesDescription")}</p>
                          <p><strong>No Description:</strong> {form.watch("noDescription")}</p>
                          <div className="border-t pt-2 mt-2">
                            <p className="text-sm font-medium mb-1">Edge Labels:</p>
                            <p><strong>Yes Label:</strong> {form.watch("yesLabel")}</p>
                            <p><strong>No Label:</strong> {form.watch("noLabel")}</p>
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
