"use client"

import * as React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon } from "lucide-react"



const formSchema = z.object({
  // General Tab
  audience: z.enum(["phone-number", "email", "account-no"]),
  unlimitedParticipants: z.boolean().default(true),
  
  // Data Source Tab
  dataSource: z.enum(["api", "safary clique", "database"]),
  apiEndpoint: z.string().optional(),
  sqlQuery: z.string().min(1, "Please enter a SQL query."),
  userField: z.string().optional(),
  
  // Schedule Tab
  scheduleMode: z.boolean(),
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

export function GoalsModal() {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const [dataSource, setDataSource] = useState<string>("database");
  const [scheduleMode, setScheduleMode] = useState<boolean>(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      // General
      audience: "phone-number",
      
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
      
    
      unlimitedParticipants: true,
    
     
      
    
    },
  })

  const getCurrentTabIndex = () => tabs.findIndex(tab => tab.value === currentTab);
  const isFirstTab = getCurrentTabIndex() === 0;
  const isLastTab = getCurrentTabIndex() === tabs.length - 1;

  // Check if a tab has validation errors
  const getTabErrors = (tabValue: string) => {
    // Only show errors if form has been touched or submitted
    if (!form.formState.isSubmitted && !form.formState.isDirty) {
      return false;
    }
    
    // Check for actual errors in the specific tab
    switch (tabValue) {
      case "general":
        return !!(form.formState.errors.audience);
      case "data-source":
        return !!(form.formState.errors.dataSource || form.formState.errors.apiEndpoint || form.formState.errors.userField);
      case "schedule":
        return !!(form.formState.errors.scheduleMode || form.formState.errors.startDate || form.formState.errors.endDate || form.formState.errors.maxParticipants);
      // case "preview":
      //   return !!();
      default:
        return false;
    }
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Validation happens automatically via zodResolver
    // This function only runs if validation passes
    toast("Form submitted successfully!", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
  }

  return (
      <Card className="w-full h-full flex flex-col min-h-0">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">
          <CardHeader className="p-0">
            <TabsList className="rounded-none bg-gray-50">
              {tabs.map((tab) => {
                const hasErrors = getTabErrors(tab.value);
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className={hasErrors ? "text-red-600 border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700" : ""}
                  >
                    {tab.label}
                    {hasErrors && <span className="ml-1 text-red-500">●</span>}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {/* Divider */}
            <div className="border-b border-gray-200"></div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-6 pb-0 min-h-0">
            <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
       
          <TabsContent value="general">
           <div>
            <h4 className="font-medium text-primary-900 mb-2">Create / Edit Goal</h4>
           </div>
          </TabsContent>
          <TabsContent value="data-source">
            <FieldGroup>
                <Controller
                  name="dataSource"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="data-source-select">
                        Data Source Type
                      </FieldLabel>
                      <select
                        {...field}
                        id="data-source-select"
                        className="w-1/2 p-2 border rounded-md"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => {
                          field.onChange(e);
                          setDataSource(e.target.value);
                        }}
                      >
                        <option value="database">Database Query</option>
                        <option value="safary clique">Safary Clique</option>
                        <option value="api">API Endpoint</option>
                      </select>
                      <FieldDescription className="mt-2">
                        Choose the data source for wasafiri.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                
                {dataSource === "api" && (
                    <p className="text-md font-medium text-red-500">Coming Soon !!</p>
                //   <Controller
                //     name="apiEndpoint"
                //     control={form.control}
                //     render={({ field, fieldState }) => (
                //       <Field data-invalid={fieldState.invalid}>
                //         <FieldLabel htmlFor="api-endpoint">
                //           API Endpoint
                //         </FieldLabel>
                //         <Input
                //           {...field}
                //           id="api-endpoint"
                //           aria-invalid={fieldState.invalid}
                //           placeholder="https://api.example.com/welcome-message"
                //           autoComplete="off"
                //         />
                //         <FieldDescription className="mt-2">
                //           URL to fetch the welcome message from.
                  //         </FieldDescription>
                  //         {fieldState.invalid && (
                  //           <FieldError errors={[fieldState.error]} />
                  //         )}
                  //       </Field>
                  //     )}
                  //   />
                  )}
                
                {dataSource === "safary clique" && (
                  <p className="text-md font-medium text-red-500">Coming Soon !!</p>
                )}
                
                {dataSource === "database" && (
                  <Controller
                    name="sqlQuery"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="sql-query">
                          SQL Query
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="sql-query"
                          aria-invalid={fieldState.invalid}
                          placeholder="SELECT * FROM welcome_messages"
                          autoComplete="off"
                          rows={6}
                          className="min-h-24 resize-none"
                        />
                        <FieldDescription className="mt-2">
                          SQL query to fetch wasafiri from the database.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
                
                {dataSource === "user-profile" && (
                    <p className="text-md font-medium text-red-500">Coming Soon !!</p>
                //   <Controller
                //     name="userField"
                //     control={form.control}
                //     render={({ field, fieldState }) => (
                //       <Field data-invalid={fieldState.invalid}>
                //         <FieldLabel htmlFor="user-field">
                //           User Field
                //         </FieldLabel>
                //         <Input
                //           {...field}
                //           id="user-field"
                //           aria-invalid={fieldState.invalid}
                //           placeholder="name, email, company"
                //           autoComplete="off"
                //         />
                //         <FieldDescription className="mt-2">
                //           User profile field to personalize the message.
                //         </FieldDescription>
                //         {fieldState.invalid && (
                //           <FieldError errors={[fieldState.error]} />
                //         )}
                //       </Field>
                //     )}
                //   />
                )}
                
                {/* <Controller
                  name="fallbackMessage"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="fallback-message">
                        Fallback Message
                      </FieldLabel>
                      <Input
                        {...field}
                        id="fallback-message"
                        aria-invalid={fieldState.invalid}
                        placeholder="Welcome!"
                        autoComplete="off"
                      />
                      <FieldDescription className="mt-2">
                        Message to show if data source fails.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}
              </FieldGroup>
          </TabsContent>
          <TabsContent value="schedule">
            <FieldGroup>
                <Controller
                  name="scheduleMode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <FieldContent className="space-y-1">
                        <FieldLabel htmlFor="scheduleMode">
                          Follow the Safary Schedule
                        </FieldLabel>
                        <FieldDescription>
                          When enabled, this node will follow the predefined Safary journey schedule. When disabled, you can set custom timing.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                      <Switch
                        id="scheduleMode"
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          setScheduleMode(value);
                        }}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
              
                {scheduleMode ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">Safary Schedule Active</h4>
                    <p className="text-sm text-blue-700">
                      This node will automatically follow the Safary journey timeline. Customer selection will be managed by the overall journey flow.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
                      <h4 className="font-medium text-primary-900 mb-2">Custom Journey Schedule</h4>
                      <p className="text-sm text-primary-700">
                        Configure when customers can join this journey.<span className="text-red-500">Coming Soon !!</span>
                      </p>
                    </div>
                    
                    {/* <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="startDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="start-date">
                              Journey Start Date
                            </FieldLabel>
                            <Input
                              {...field}
                              type="date"
                              id="start-date"
                              aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription className="mt-2">
                              When customers can start joining this journey.
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      
                      <Controller
                        name="endDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="end-date">
                              Journey End Date
                            </FieldLabel>
                            <Input
                              {...field}
                              type="date"
                              id="end-date"
                              aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription className="mt-2">
                              Last day customers can join this journey.
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="startTime"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="start-time">
                              Daily Start Time
                            </FieldLabel>
                            <Input
                              {...field}
                              type="time"
                              id="start-time"
                              aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription className="mt-2">
                              Earliest time customers can join each day.
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      
                      <Controller
                        name="endTime"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="end-time">
                              Daily End Time
                            </FieldLabel>
                            <Input
                              {...field}
                              type="time"
                              id="end-time"
                              aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription className="mt-2">
                              Latest time customers can join each day.
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="repeatMode"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="repeat-mode">
                              Repeat Pattern
                            </FieldLabel>
                            <select
                              {...field}
                              id="repeat-mode"
                              className="w-1/2 p-2 border rounded-md"
                              aria-invalid={fieldState.invalid}
                            >
                              <option value="none">No Repeat (One-time)</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                            <FieldDescription className="mt-2">
                              How often this journey selection window repeats.
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      
                      <Controller
                        name="maxParticipants"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="max-participants">
                              Max Participants
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              id="max-participants"
                              aria-invalid={fieldState.invalid}
                              placeholder="100"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FieldDescription className="mt-2">
                              Maximum number of customers who can join this journey.
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    
                    <Controller
                      name="timezone"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="timezone">
                            Timezone
                          </FieldLabel>
                          <select
                            {...field}
                            id="timezone"
                            className="w-1/2 p-2 border rounded-md"
                            aria-invalid={fieldState.invalid}
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Paris">Paris</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                            <option value="Asia/Shanghai">Shanghai</option>
                          </select>
                          <FieldDescription className="mt-2">
                            Timezone for the journey schedule times.
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    /> */}
                  </div>
                )}
              </FieldGroup>
          </TabsContent>
          <TabsContent value="preview">
          <div className="space-y-12 flex flex-col items-center justify-center">
                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
                      <h4 className="font-medium text-primary-900 mb-2">How many wasafiri will join the journey?</h4>
                      <p className="text-sm text-primary-700">
                        Click the button below to preview the wasafiri.
                      </p>
                    </div>
                    <Button variant="outline" className="bg-primary-600 hover:bg-primary-700  align-center flex items-center justify-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Preview Wasafiri
                    </Button>
                    </div>
          </TabsContent>
          </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4 border-t">
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
        
        {/* Form Actions */}
        <div className="flex justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-demo" className="bg-blue-600 hover:bg-blue-700">
            Save Configuration
          </Button>
        </div>
          </CardFooter>
        </Tabs>
      </Card>
  )
}
