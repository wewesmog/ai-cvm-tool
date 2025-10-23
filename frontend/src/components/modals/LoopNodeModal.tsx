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
  
  // Loop Configuration
  maxLoops: z.number().min(1, "Must be at least 1").max(10, "Maximum 10 loops"),
  continueLabel: z.string().min(1, "Continue label is required"),
  exitLabel: z.string().min(1, "Exit label is required"),
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

interface LoopNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: z.infer<typeof formSchema>) => void;
  nodeData?: any;
}

export function LoopNodeModal({ isOpen, onClose, onSave, nodeData }: LoopNodeModalProps) {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Basic Info
      title: nodeData?.title || "Loop Node",
      description: nodeData?.description || "Repeat a branch until max attempts reached",
      
      // Loop Configuration
      maxLoops: nodeData?.maxLoops || 3,
      continueLabel: nodeData?.continueLabel || "Continue",
      exitLabel: nodeData?.exitLabel || "Exit",
    },
  })

  // Update form when nodeData changes
  useEffect(() => {
    if (nodeData) {
      form.reset({
        title: nodeData.title || "Loop Node",
        description: nodeData.description || "Repeat a branch until max attempts reached",
        maxLoops: nodeData.maxLoops || 3,
        continueLabel: nodeData.continueLabel || "Continue",
        exitLabel: nodeData.exitLabel || "Exit",
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
    console.log('💾 Saving Loop Node configuration:', formData);
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

              <form id="loop-node-form" className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto">
                  <TabsContent value="general" className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Maximum Loops</FieldLabel>
                        <FieldDescription>
                          Maximum number of times the loop can execute (1-10)
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="maxLoops"
                            render={({ field, fieldState }) => (
                              <>
                                <Input {...field} type="number" min="1" max="10" />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Continue Label</FieldLabel>
                        <FieldDescription>
                          Label for the handle that continues the loop (e.g., "Continue", "Retry", "Try Again")
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="continueLabel"
                            render={({ field, fieldState }) => (
                              <>
                                <Input {...field} placeholder="Continue" />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Exit Label</FieldLabel>
                        <FieldDescription>
                          Label for the handle that exits the loop (e.g., "Exit", "Give Up", "Stop", "End")
                        </FieldDescription>
                        <FieldContent>
                          <Controller
                            control={form.control}
                            name="exitLabel"
                            render={({ field, fieldState }) => (
                              <>
                                <Input {...field} placeholder="Exit" />
                                <FieldError errors={[fieldState.error]} />
                              </>
                            )}
                          />
                        </FieldContent>
                      </Field>
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
                          Preview of your loop node configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Title:</strong> {form.watch("title")}</p>
                          <p><strong>Description:</strong> {form.watch("description")}</p>
                          <p><strong>Maximum Loops:</strong> {form.watch("maxLoops")}</p>
                          <p><strong>Continue Label:</strong> {form.watch("continueLabel")}</p>
                          <p><strong>Exit Label:</strong> {form.watch("exitLabel")}</p>
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
